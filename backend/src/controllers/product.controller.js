import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadService } from '../services/upload.service.js';

/**
 * Helper to safely parse specifications input (supports JSON string or array)
 */
const parseSpecifications = (specs) => {
  if (!specs) return [];
  if (typeof specs === 'string') {
    try {
      return JSON.parse(specs);
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(specs) ? specs : [];
};

/**
 * Helper to safely parse tags input (supports JSON string, array, or comma-separated string)
 */
const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }
  return [];
};

/**
 * @desc    Get paginated products with filtering & sorting
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '12', 10)));
  const skip = (page - 1) * limit;

  const {
    category,
    brand,
    isFeatured,
    isBestSeller,
    isActive,
    minPrice,
    maxPrice,
    search,
    sort,
  } = req.query;

  const query = {};

  // Default to active products for public users
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  } else {
    query.isActive = true;
  }

  // Filter by Category (by ID or slug)
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) query.category = catDoc._id;
      else query.category = null; // No match found
    }
  }

  // Filter by Brand (by ID or slug)
  if (brand) {
    if (mongoose.Types.ObjectId.isValid(brand)) {
      query.brand = brand;
    } else {
      const brandDoc = await Brand.findOne({ slug: brand });
      if (brandDoc) query.brand = brandDoc._id;
      else query.brand = null;
    }
  }

  // Flag filters
  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
  if (isBestSeller !== undefined) query.isBestSeller = isBestSeller === 'true';

  // Price range filters
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
  }

  // Text search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
    ];
  }

  // Sort options mapping
  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'newest') sortOption = { createdAt: -1 };
  else if (sort === 'rating') sortOption = { ratingsAverage: -1 };

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      'Products fetched successfully.'
    )
  );
});

/**
 * @desc    Get single product by slug
 * @route   GET /api/v1/products/:slug
 * @access  Public
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug })
    .populate('category', 'name slug description image')
    .populate('brand', 'name slug logo description')
    .populate('createdBy', 'name email')
    .lean();

  if (!product) {
    throw new ApiError(404, `Product with slug '${slug}' not found.`);
  }

  return res.status(200).json(
    new ApiResponse(200, product, 'Product details retrieved successfully.')
  );
});

/**
 * @desc    Create new product with images/video upload (Admin only)
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    shortDescription,
    category,
    brand,
    price,
    discountPrice,
    currency,
    stock,
    sku,
    isFeatured,
    isBestSeller,
    isActive,
    specifications,
    tags,
  } = req.body;

  // Check SKU uniqueness
  const existingSku = await Product.findOne({ sku: sku.trim().toUpperCase() });
  if (existingSku) {
    throw new ApiError(409, `Product SKU '${sku}' already exists.`);
  }

  // Validate category existence
  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    throw new ApiError(404, `Category with ID '${category}' not found.`);
  }

  // Validate brand existence if provided
  if (brand) {
    const brandDoc = await Brand.findById(brand);
    if (!brandDoc) {
      throw new ApiError(404, `Brand with ID '${brand}' not found.`);
    }
  }

  // Handle Cloudinary Uploads for images and video
  let uploadedImages = [];
  let uploadedVideo = { url: '', publicId: '' };

  if (req.files && uploadService.isConfigured()) {
    // Images upload
    if (req.files.images && req.files.images.length > 0) {
      uploadedImages = await uploadService.uploadMultipleImages(
        req.files.images,
        'angadix/products'
      );
    }
    // Video upload
    if (req.files.video && req.files.video.length > 0) {
      const videoFile = req.files.video[0];
      uploadedVideo = await uploadService.uploadBuffer(videoFile.buffer, {
        folder: 'angadix/products/videos',
        resource_type: 'video',
      });
    }
  }

  const parsedPrice = parseFloat(price);
  const parsedDiscount =
    discountPrice !== undefined && discountPrice !== null && discountPrice !== ''
      ? parseFloat(discountPrice)
      : null;

  if (parsedDiscount !== null && parsedDiscount >= parsedPrice) {
    throw new ApiError(422, 'Discount price must be strictly less than the original price.');
  }

  const product = await Product.create({
    name,
    description,
    shortDescription: shortDescription || '',
    category,
    brand: brand || null,
    price: parsedPrice,
    discountPrice: parsedDiscount,
    currency: currency || 'INR',
    stock: stock !== undefined ? parseInt(stock, 10) : 0,
    sku: sku.trim().toUpperCase(),
    images: uploadedImages,
    video: uploadedVideo,
    specifications: parseSpecifications(specifications),
    tags: parseTags(tags),
    isFeatured: isFeatured !== undefined ? isFeatured === 'true' || isFeatured === true : false,
    isBestSeller: isBestSeller !== undefined ? isBestSeller === 'true' || isBestSeller === true : false,
    isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
    createdBy: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(201, product, 'Product created successfully.')
  );
});

/**
 * @desc    Update product (Admin only)
 * @route   PATCH /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, `Product with ID '${id}' not found.`);
  }

  const {
    name,
    description,
    shortDescription,
    category,
    brand,
    price,
    discountPrice,
    currency,
    stock,
    sku,
    isFeatured,
    isBestSeller,
    isActive,
    specifications,
    tags,
  } = req.body;

  // Check SKU uniqueness if changed
  if (sku && sku.trim().toUpperCase() !== product.sku) {
    const existingSku = await Product.findOne({
      sku: sku.trim().toUpperCase(),
      _id: { $ne: id },
    });
    if (existingSku) {
      throw new ApiError(409, `Product SKU '${sku}' is already taken.`);
    }
    product.sku = sku.trim().toUpperCase();
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (shortDescription !== undefined) product.shortDescription = shortDescription;
  if (category) product.category = category;
  if (brand !== undefined) product.brand = brand || null;
  if (currency) product.currency = currency;

  if (price !== undefined) product.price = parseFloat(price);
  if (discountPrice !== undefined) {
    const parsedDisc = discountPrice ? parseFloat(discountPrice) : null;
    if (parsedDisc !== null && parsedDisc >= product.price) {
      throw new ApiError(422, 'Discount price must be strictly less than original price.');
    }
    product.discountPrice = parsedDisc;
  }

  if (stock !== undefined) product.stock = parseInt(stock, 10);
  if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
  if (isBestSeller !== undefined) product.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
  if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;

  if (specifications !== undefined) product.specifications = parseSpecifications(specifications);
  if (tags !== undefined) product.tags = parseTags(tags);

  // Handle uploaded new images / video
  if (req.files && uploadService.isConfigured()) {
    if (req.files.images && req.files.images.length > 0) {
      const newImages = await uploadService.uploadMultipleImages(
        req.files.images,
        'angadix/products'
      );
      // Append or replace images
      if (req.body.replaceImages === 'true') {
        // Clean up old images
        const oldPublicIds = product.images.map((img) => img.publicId).filter(Boolean);
        if (oldPublicIds.length > 0) {
          await uploadService.deleteMultipleAssets(oldPublicIds, 'image');
        }
        product.images = newImages;
      } else {
        // Append
        product.images.push(...newImages);
      }
    }

    if (req.files.video && req.files.video.length > 0) {
      if (product.video && product.video.publicId) {
        await uploadService.deleteAsset(product.video.publicId, 'video');
      }
      product.video = await uploadService.uploadBuffer(req.files.video[0].buffer, {
        folder: 'angadix/products/videos',
        resource_type: 'video',
      });
    }
  }

  await product.save();

  return res.status(200).json(
    new ApiResponse(200, product, 'Product updated successfully.')
  );
});

/**
 * @desc    Quick stock update (Admin only)
 * @route   PATCH /api/v1/products/:id/stock
 * @access  Private/Admin
 */
export const updateProductStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, `Product with ID '${id}' not found.`);
  }

  product.stock = parseInt(stock, 10);
  await product.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { _id: product._id, stock: product.stock, sku: product.sku },
      'Product stock updated successfully.'
    )
  );
});

/**
 * @desc    Hard-delete product + Cloudinary assets cleanup (Admin only)
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, `Product with ID '${id}' not found.`);
  }

  // Delete associated Cloudinary assets if configured
  if (uploadService.isConfigured()) {
    const imagePublicIds = product.images.map((img) => img.publicId).filter(Boolean);
    if (imagePublicIds.length > 0) {
      await uploadService.deleteMultipleAssets(imagePublicIds, 'image');
    }

    if (product.video && product.video.publicId) {
      await uploadService.deleteAsset(product.video.publicId, 'video');
    }
  }

  await product.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, { _id: id }, 'Product and associated media deleted successfully.')
  );
});

/**
 * @desc    Get homepage aggregated product sections (Trending, Flash Sale, Featured, Best Sellers, Top Rated, Recently Added)
 * @route   GET /api/v1/products/homepage
 * @access  Public
 */
export const getHomepageProducts = asyncHandler(async (req, res) => {
  const limitCap = 8;
  const activeQuery = { isActive: true };

  const selectFields = 'name slug price discountPrice currency stock images ratingsAverage ratingsCount isFeatured isBestSeller category brand';
  const populateOptions = [
    { path: 'category', select: 'name slug' },
    { path: 'brand', select: 'name slug logo' },
  ];

  const [
    trending,
    flashSale,
    featured,
    bestSellers,
    topRated,
    recentlyAdded,
  ] = await Promise.all([
    // Trending: sorted by ratingsCount and ratingsAverage
    Product.find(activeQuery)
      .select(selectFields)
      .populate(populateOptions)
      .sort({ ratingsCount: -1, ratingsAverage: -1 })
      .limit(limitCap)
      .lean(),

    // Flash Sale: items with active discountPrice
    Product.find({ ...activeQuery, discountPrice: { $ne: null, $gt: 0 } })
      .select(selectFields)
      .populate(populateOptions)
      .sort({ discountPrice: 1 })
      .limit(limitCap)
      .lean(),

    // Featured: isFeatured = true
    Product.find({ ...activeQuery, isFeatured: true })
      .select(selectFields)
      .populate(populateOptions)
      .sort({ createdAt: -1 })
      .limit(limitCap)
      .lean(),

    // Best Sellers: isBestSeller = true
    Product.find({ ...activeQuery, isBestSeller: true })
      .select(selectFields)
      .populate(populateOptions)
      .sort({ createdAt: -1 })
      .limit(limitCap)
      .lean(),

    // Top Rated: ratingsAverage >= 4.0
    Product.find({ ...activeQuery, ratingsAverage: { $gte: 4.0 } })
      .select(selectFields)
      .populate(populateOptions)
      .sort({ ratingsAverage: -1, ratingsCount: -1 })
      .limit(limitCap)
      .lean(),

    // Recently Added: latest items
    Product.find(activeQuery)
      .select(selectFields)
      .populate(populateOptions)
      .sort({ createdAt: -1 })
      .limit(limitCap)
      .lean(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        trending,
        flashSale,
        featured,
        bestSellers,
        topRated,
        recentlyAdded,
      },
      'Homepage product sections retrieved successfully.'
    )
  );
});
