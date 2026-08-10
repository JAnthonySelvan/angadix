import { FeaturedShowcase } from '../../models/FeaturedShowcase.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { uploadService } from '../../services/upload.service.js';

/**
 * @desc    Get all featured showcases (storefront or admin)
 * @route   GET /api/v1/featured-showcase or /api/v1/admin/featured-showcase
 * @access  Public / Admin
 */
export const getFeaturedShowcases = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  const filter = {};
  if (isActive !== undefined) {
    if (isActive === 'true' || isActive === true) {
      filter.isActive = { $in: [true, 'true', 1] };
    } else {
      filter.isActive = { $in: [false, 'false', 0] };
    }
  }

  const showcases = await FeaturedShowcase.find(filter)
    .populate('linkedProduct', '_id name slug price salePrice image images')
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');

  return res.status(200).json(
    new ApiResponse(200, showcases, 'Featured showcases retrieved successfully.')
  );
});

/**
 * @desc    Get single featured showcase by ID
 * @route   GET /api/v1/admin/featured-showcase/:id
 * @access  Private/Admin
 */
export const getFeaturedShowcaseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const showcase = await FeaturedShowcase.findById(id)
    .populate('linkedProduct', '_id name slug price salePrice image')
    .lean();

  if (!showcase) {
    throw new ApiError(404, `Featured showcase entry with ID '${id}' not found.`);
  }

  return res.status(200).json(
    new ApiResponse(200, showcase, 'Featured showcase entry retrieved successfully.')
  );
});

/**
 * @desc    Create featured showcase
 * @route   POST /api/v1/admin/featured-showcase
 * @access  Private/Admin
 */
export const createFeaturedShowcase = asyncHandler(async (req, res) => {
  const { title, description, ctaText, ctaLink, linkedProduct, sortOrder, isActive } = req.body;

  let imageObj = { url: '', publicId: '' };
  if (req.file) {
    if (uploadService.isConfigured()) {
      imageObj = await uploadService.uploadBuffer(req.file.buffer, {
        folder: 'angadix/featured-showcase',
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
    throw new ApiError(400, 'Featured showcase image file or valid image URL is required.');
  }

  const showcase = await FeaturedShowcase.create({
    title,
    description,
    image: imageObj,
    ctaText: ctaText || 'Shop Now',
    ctaLink: ctaLink || '',
    linkedProduct: (linkedProduct && String(linkedProduct).trim() !== '' && String(linkedProduct) !== 'null') ? linkedProduct : null,
    sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
    isActive: isActive !== undefined ? Boolean(isActive === 'true' || isActive === true) : true,
  });

  const populatedShowcase = await FeaturedShowcase.findById(showcase._id)
    .populate('linkedProduct', '_id name slug price salePrice image')
    .lean();

  return res.status(201).json(
    new ApiResponse(201, populatedShowcase, 'Featured showcase entry created successfully.')
  );
});

/**
 * @desc    Update featured showcase
 * @route   PATCH /api/v1/admin/featured-showcase/:id
 * @access  Private/Admin
 */
export const updateFeaturedShowcase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, ctaText, ctaLink, linkedProduct, sortOrder, isActive } = req.body;

  const showcase = await FeaturedShowcase.findById(id);
  if (!showcase) {
    throw new ApiError(404, `Featured showcase entry with ID '${id}' not found.`);
  }

  if (title !== undefined) showcase.title = title;
  if (description !== undefined) showcase.description = description;
  if (ctaText !== undefined) showcase.ctaText = ctaText;
  if (ctaLink !== undefined) showcase.ctaLink = ctaLink;
  if (linkedProduct !== undefined) {
    showcase.linkedProduct = (linkedProduct && String(linkedProduct).trim() !== '' && String(linkedProduct) !== 'null') ? linkedProduct : null;
  }
  if (sortOrder !== undefined) showcase.sortOrder = parseInt(sortOrder, 10);
  if (isActive !== undefined) showcase.isActive = Boolean(isActive === 'true' || isActive === true);

  if (req.file) {
    if (uploadService.isConfigured()) {
      if (showcase.image && showcase.image.publicId) {
        await uploadService.deleteAsset(showcase.image.publicId);
      }
      showcase.image = await uploadService.uploadBuffer(req.file.buffer, {
        folder: 'angadix/featured-showcase',
        resource_type: 'image',
      });
    } else {
      const base64 = req.file.buffer.toString('base64');
      showcase.image = { url: `data:${req.file.mimetype};base64,${base64}`, publicId: '' };
    }
  } else if (req.body.imageUrl) {
    showcase.image = { url: req.body.imageUrl, publicId: '' };
  }

  await showcase.save();

  const populatedShowcase = await FeaturedShowcase.findById(showcase._id)
    .populate('linkedProduct', '_id name slug price salePrice image')
    .lean();

  return res.status(200).json(
    new ApiResponse(200, populatedShowcase, 'Featured showcase entry updated successfully.')
  );
});

/**
 * @desc    Delete featured showcase
 * @route   DELETE /api/v1/admin/featured-showcase/:id
 * @access  Private/Admin
 */
export const deleteFeaturedShowcase = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const showcase = await FeaturedShowcase.findById(id);
  if (!showcase) {
    throw new ApiError(404, `Featured showcase entry with ID '${id}' not found.`);
  }

  if (showcase.image && showcase.image.publicId && uploadService.isConfigured()) {
    await uploadService.deleteAsset(showcase.image.publicId);
  }

  await showcase.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, { _id: id }, 'Featured showcase entry deleted successfully.')
  );
});

/**
 * @desc    Bulk reorder featured showcases sortOrder
 * @route   PATCH /api/v1/admin/featured-showcase/reorder
 * @access  Private/Admin
 */
export const reorderFeaturedShowcases = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Reorder payload must be a non-empty array of { id, sortOrder }.');
  }

  const bulkOps = items.map(({ id, sortOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { sortOrder: parseInt(sortOrder, 10) } },
    },
  }));

  const result = await FeaturedShowcase.bulkWrite(bulkOps);

  return res.status(200).json(
    new ApiResponse(
      200,
      { modifiedCount: result.modifiedCount },
      'Featured showcases reordered successfully.'
    )
  );
});
