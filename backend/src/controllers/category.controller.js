import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadService } from '../services/upload.service.js';

/**
 * @desc    Get all categories with optional isActive filter & populated parentCategory
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const { isActive, parent } = req.query;

  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  if (parent === 'null') {
    filter.parentCategory = null;
  } else if (parent) {
    filter.parentCategory = parent;
  }

  const categories = await Category.find(filter)
    .populate('parentCategory', 'name slug')
    .sort({ name: 1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, categories, 'Categories retrieved successfully.')
  );
});

/**
 * @desc    Get single category by slug
 * @route   GET /api/v1/categories/:slug
 * @access  Public
 */
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug })
    .populate('parentCategory', 'name slug')
    .lean();

  if (!category) {
    throw new ApiError(404, `Category with slug '${slug}' not found.`);
  }

  return res.status(200).json(
    new ApiResponse(200, category, 'Category details retrieved successfully.')
  );
});

/**
 * @desc    Create new category (Admin only)
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentCategory, isActive } = req.body;

  // Check if category name already exists
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
  });
  if (existingCategory) {
    throw new ApiError(409, `Category with name '${name}' already exists.`);
  }

  // Handle parent category validation if provided
  if (parentCategory) {
    const parentExists = await Category.findById(parentCategory);
    if (!parentExists) {
      throw new ApiError(404, 'Parent category specified does not exist.');
    }
  }

  // Upload image to Cloudinary if provided
  let imageObj = { url: '', publicId: '' };
  if (req.file) {
    if (uploadService.isConfigured()) {
      imageObj = await uploadService.uploadBuffer(req.file.buffer, {
        folder: 'angadix/categories',
        resource_type: 'image',
      });
    }
  }

  const category = await Category.create({
    name,
    description: description || '',
    image: imageObj,
    parentCategory: parentCategory || null,
    isActive: isActive !== undefined ? isActive : true,
  });

  return res.status(201).json(
    new ApiResponse(201, category, 'Category created successfully.')
  );
});

/**
 * @desc    Update category (Admin only)
 * @route   PATCH /api/v1/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, parentCategory, isActive } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, `Category with ID '${id}' not found.`);
  }

  // Prevent self-referencing parent category
  if (parentCategory && parentCategory === id) {
    throw new ApiError(400, 'A category cannot be its own parent category.');
  }

  // Check name uniqueness if updated
  if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: id },
    });
    if (existingCategory) {
      throw new ApiError(409, `Category with name '${name}' already exists.`);
    }
    category.name = name;
  }

  if (description !== undefined) category.description = description;
  if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
  if (isActive !== undefined) category.isActive = Boolean(isActive);

  // Upload new image and replace old image if file is sent
  if (req.file) {
    if (uploadService.isConfigured()) {
      // Clean up old image if publicId exists
      if (category.image && category.image.publicId) {
        await uploadService.deleteAsset(category.image.publicId);
      }
      category.image = await uploadService.uploadBuffer(req.file.buffer, {
        folder: 'angadix/categories',
        resource_type: 'image',
      });
    }
  }

  await category.save();

  return res.status(200).json(
    new ApiResponse(200, category, 'Category updated successfully.')
  );
});

/**
 * @desc    Soft-delete category (Admin only)
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, `Category with ID '${id}' not found.`);
  }

  // Check if active products reference this category
  if (mongoose.models.Product) {
    const activeProductsCount = await Product.countDocuments({
      category: id,
      isActive: true,
    });
    if (activeProductsCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete category. ${activeProductsCount} active products are currently referencing it.`
      );
    }
  }

  category.isActive = false;
  await category.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { _id: category._id, isActive: false },
      'Category soft-deleted successfully (set to inactive).'
    )
  );
});
