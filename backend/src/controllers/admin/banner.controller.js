import { Banner } from '../../models/Banner.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { uploadService } from '../../services/upload.service.js';

/**
 * @desc    Get all banners
 * @route   GET /api/v1/admin/banners
 * @access  Private/Admin (also public if used on storefront)
 */
export const getBanners = asyncHandler(async (req, res) => {
  const { placement, isActive } = req.query;

  const filter = {};
  if (placement) filter.placement = placement;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const banners = await Banner.find(filter)
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

  return res.status(200).json(
    new ApiResponse(200, banners, 'Banners retrieved successfully.')
  );
});

/**
 * @desc    Get single banner by ID
 * @route   GET /api/v1/admin/banners/:id
 * @access  Private/Admin
 */
export const getBannerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const banner = await Banner.findById(id).lean();
  if (!banner) {
    throw new ApiError(404, `Banner with ID '${id}' not found.`);
  }

  return res.status(200).json(
    new ApiResponse(200, banner, 'Banner details retrieved successfully.')
  );
});

/**
 * @desc    Create banner
 * @route   POST /api/v1/admin/banners
 * @access  Private/Admin
 */
export const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, ctaText, ctaLink, placement, sortOrder, isActive, startDate, endDate } =
    req.body;

  let imageObj = { url: '', publicId: '' };
  if (req.file) {
    if (uploadService.isConfigured()) {
      imageObj = await uploadService.uploadBuffer(req.file.buffer, {
        folder: 'angadix/banners',
        resource_type: 'image',
      });
    } else {
      const base64 = req.file.buffer.toString('base64');
      imageObj = { url: `data:${req.file.mimetype};base64,${base64}`, publicId: '' };
    }
  } else if (req.body.imageUrl) {
    imageObj.url = req.body.imageUrl;
  }

  if (!imageObj.url) {
    throw new ApiError(400, 'Banner image file or valid image URL is required.');
  }

  const banner = await Banner.create({
    title,
    subtitle: subtitle || '',
    image: imageObj,
    ctaText: ctaText || '',
    ctaLink: ctaLink || '',
    placement: placement || 'hero',
    sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
    isActive: isActive !== undefined ? Boolean(isActive === 'true' || isActive === true) : true,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  });

  return res.status(201).json(
    new ApiResponse(201, banner, 'Banner created successfully.')
  );
});

/**
 * @desc    Update banner
 * @route   PATCH /api/v1/admin/banners/:id
 * @access  Private/Admin
 */
export const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, ctaText, ctaLink, placement, sortOrder, isActive, startDate, endDate } =
    req.body;

  const banner = await Banner.findById(id);
  if (!banner) {
    throw new ApiError(404, `Banner with ID '${id}' not found.`);
  }

  if (title !== undefined) banner.title = title;
  if (subtitle !== undefined) banner.subtitle = subtitle;
  if (ctaText !== undefined) banner.ctaText = ctaText;
  if (ctaLink !== undefined) banner.ctaLink = ctaLink;
  if (placement !== undefined) banner.placement = placement;
  if (sortOrder !== undefined) banner.sortOrder = parseInt(sortOrder, 10);
  if (isActive !== undefined) banner.isActive = Boolean(isActive === 'true' || isActive === true);
  if (startDate !== undefined) banner.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) banner.endDate = endDate ? new Date(endDate) : null;

  if (req.file) {
    if (uploadService.isConfigured()) {
      if (banner.image && banner.image.publicId) {
        await uploadService.deleteAsset(banner.image.publicId);
      }
      banner.image = await uploadService.uploadBuffer(req.file.buffer, {
        folder: 'angadix/banners',
        resource_type: 'image',
      });
    } else {
      const base64 = req.file.buffer.toString('base64');
      banner.image = { url: `data:${req.file.mimetype};base64,${base64}`, publicId: '' };
    }
  } else if (req.body.imageUrl) {
    banner.image = { url: req.body.imageUrl, publicId: '' };
  }

  await banner.save();

  return res.status(200).json(
    new ApiResponse(200, banner, 'Banner updated successfully.')
  );
});

/**
 * @desc    Delete banner
 * @route   DELETE /api/v1/admin/banners/:id
 * @access  Private/Admin
 */
export const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const banner = await Banner.findById(id);
  if (!banner) {
    throw new ApiError(404, `Banner with ID '${id}' not found.`);
  }

  if (banner.image && banner.image.publicId && uploadService.isConfigured()) {
    await uploadService.deleteAsset(banner.image.publicId);
  }

  await banner.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, { _id: id }, 'Banner deleted successfully.')
  );
});

/**
 * @desc    Bulk reorder banners sortOrder
 * @route   PATCH /api/v1/banners/reorder or /api/v1/admin/banners/reorder
 * @access  Private/Admin
 */
export const reorderBanners = asyncHandler(async (req, res) => {
  const { items } = req.body; // Expect array of { id, sortOrder }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Reorder payload must be a non-empty array of { id, sortOrder }.');
  }

  const bulkOps = items.map(({ id, sortOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { sortOrder: parseInt(sortOrder, 10) } },
    },
  }));

  const result = await Banner.bulkWrite(bulkOps);

  return res.status(200).json(
    new ApiResponse(
      200,
      { modifiedCount: result.modifiedCount },
      'Banners reordered successfully.'
    )
  );
});
