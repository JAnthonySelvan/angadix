import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Coupon } from '../models/Coupon.js';

// 1. Admin: Create Coupon
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    maxDiscountAmount,
    minOrderValue,
    usageLimit,
    usageLimitPerUser,
    validFrom,
    validUntil,
    applicableCategories,
    isActive,
  } = req.body;

  const upperCode = code.trim().toUpperCase();

  const existingCoupon = await Coupon.findOne({ code: upperCode });
  if (existingCoupon) {
    throw new ApiError(400, `Coupon code '${upperCode}' already exists.`);
  }

  const coupon = await Coupon.create({
    code: upperCode,
    description: description || '',
    discountType,
    discountValue: parseFloat(discountValue),
    maxDiscountAmount:
      maxDiscountAmount !== undefined && maxDiscountAmount !== null && maxDiscountAmount !== ''
        ? parseFloat(maxDiscountAmount)
        : null,
    minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
    usageLimit:
      usageLimit !== undefined && usageLimit !== null && usageLimit !== ''
        ? parseInt(usageLimit, 10)
        : null,
    usageLimitPerUser: usageLimitPerUser ? parseInt(usageLimitPerUser, 10) : 1,
    validFrom: new Date(validFrom),
    validUntil: new Date(validUntil),
    applicableCategories: applicableCategories || [],
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, coupon, 'Coupon created successfully.'));
});

// 2. Admin: Get All Coupons (Paginated + Filtered)
export const getAllCoupons = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  if (req.query.code) {
    query.code = { $regex: req.query.code.trim(), $options: 'i' };
  }

  const [coupons, totalCoupons] = await Promise.all([
    Coupon.find(query)
      .populate('createdBy', 'name email')
      .populate('applicableCategories', 'name slug')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Coupon.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCoupons / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        coupons,
        pagination: {
          totalCoupons,
          currentPage: page,
          totalPages,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      'Coupons fetched successfully.'
    )
  );
});

// 3. Admin: Get Single Coupon by ID
export const getCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id)
    .populate('createdBy', 'name email')
    .populate('applicableCategories', 'name slug')
    .populate('redeemedBy.user', 'name email');

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, 'Coupon details retrieved successfully.'));
});

// 4. Admin: Update Coupon
export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }

  if (req.body.code) {
    const upperCode = req.body.code.trim().toUpperCase();
    if (upperCode !== coupon.code) {
      const existing = await Coupon.findOne({ code: upperCode });
      if (existing) {
        throw new ApiError(400, `Coupon code '${upperCode}' is already in use.`);
      }
      coupon.code = upperCode;
    }
  }

  const updatableFields = [
    'description',
    'discountType',
    'discountValue',
    'maxDiscountAmount',
    'minOrderValue',
    'usageLimit',
    'usageLimitPerUser',
    'validFrom',
    'validUntil',
    'applicableCategories',
    'isActive',
  ];

  for (const field of updatableFields) {
    if (req.body[field] !== undefined) {
      if (field === 'validFrom' || field === 'validUntil') {
        coupon[field] = new Date(req.body[field]);
      } else {
        coupon[field] = req.body[field];
      }
    }
  }

  await coupon.save();

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, 'Coupon updated successfully.'));
});

// 5. Admin: Soft Delete / Deactivate Coupon
export const deactivateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }

  coupon.isActive = false;
  await coupon.save();

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, 'Coupon deactivated successfully.'));
});

// 6. User: Validate Coupon Preview Endpoint
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body;
  const numericOrderValue = parseFloat(orderValue);
  const upperCode = code.trim().toUpperCase();

  const coupon = await Coupon.findOne({ code: upperCode });
  if (!coupon) {
    throw new ApiError(404, 'Invalid or non-existent coupon code.');
  }

  const validation = coupon.isValidForUse(numericOrderValue, req.user._id);
  if (!validation.valid) {
    throw new ApiError(400, validation.reason);
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = numericOrderValue * (coupon.discountValue / 100);
    if (coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount !== undefined) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === 'flat') {
    discountAmount = Math.min(coupon.discountValue, numericOrderValue);
  }

  discountAmount = Math.round(discountAmount * 100) / 100;
  const finalAmount = Math.max(0, Math.round((numericOrderValue - discountAmount) * 100) / 100);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        valid: true,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalAmount,
        minOrderValue: coupon.minOrderValue,
      },
      `Coupon '${coupon.code}' is valid and ready to apply.`
    )
  );
});
