import mongoose from 'mongoose';
import { Brand } from '../models/Brand.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadService } from '../services/upload.service.js';

/**
 * @desc    Get all brands with optional isActive filter
 * @route   GET /api/v1/brands
 * @access  Public
 */
export const getBrands = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  const brands = await Brand.find(filter).sort({ name: 1 }).lean();

  return res.status(200).json(
    new ApiResponse(200, brands, 'Brands retrieved successfully.')
  );
});

/**
 * @desc    Get single brand by slug
 * @route   GET /api/v1/brands/:slug
 * @access  Public
 */
export const getBrandBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const brand = await Brand.findOne({ slug }).lean();

  if (!brand) {
    throw new ApiError(404, `Brand with slug '${slug}' not found.`);
  }

  return res.status(200).json(
    new ApiResponse(200, brand, 'Brand details retrieved successfully.')
  );
});

/**
 * @desc    Create new brand (Admin only)
 * @route   POST /api/v1/brands
 * @access  Private/Admin
 */
export const createBrand = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;

  // Check if brand name already exists
  const existingBrand = await Brand.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
  });
  if (existingBrand) {
    throw new ApiError(409, `Brand with name '${name}' already exists.`);
  }

  // Upload logo to Cloudinary if provided
  let logoObj = { url: '', publicId: '' };
  if (req.file) {
    if (uploadService.isConfigured()) {
      logoObj = await uploadService.uploadBuffer(req.file.buffer, {
        folder: 'angadix/brands',
        resource_type: 'image',
      });
    }
  }

  const brand = await Brand.create({
    name,
    description: description || '',
    logo: logoObj,
    isActive: isActive !== undefined ? isActive : true,
  });

  return res.status(201).json(
    new ApiResponse(201, brand, 'Brand created successfully.')
  );
});

/**
 * @desc    Update brand (Admin only)
 * @route   PATCH /api/v1/brands/:id
 * @access  Private/Admin
 */
export const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  const brand = await Brand.findById(id);
  if (!brand) {
    throw new ApiError(404, `Brand with ID '${id}' not found.`);
  }

  // Check name uniqueness if updated
  if (name && name.trim().toLowerCase() !== brand.name.toLowerCase()) {
    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: id },
    });
    if (existingBrand) {
      throw new ApiError(409, `Brand with name '${name}' already exists.`);
    }
    brand.name = name;
  }

  if (description !== undefined) brand.description = description;
  if (isActive !== undefined) brand.isActive = Boolean(isActive);

  // Upload new logo and replace old logo if file is sent
  if (req.file) {
    if (uploadService.isConfigured()) {
      if (brand.logo && brand.logo.publicId) {
        await uploadService.deleteAsset(brand.logo.publicId);
      }
      brand.logo = await uploadService.uploadBuffer(req.file.buffer, {
        folder: 'angadix/brands',
        resource_type: 'image',
      });
    }
  }

  await brand.save();

  return res.status(200).json(
    new ApiResponse(200, brand, 'Brand updated successfully.')
  );
});

/**
 * @desc    Soft-delete brand (Admin only)
 * @route   DELETE /api/v1/brands/:id
 * @access  Private/Admin
 */
export const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const brand = await Brand.findById(id);
  if (!brand) {
    throw new ApiError(404, `Brand with ID '${id}' not found.`);
  }

  // Unassign this brand from any products currently referencing it
  await Product.updateMany({ brand: id }, { $unset: { brand: 1 } });

  if (brand.logo?.publicId && uploadService.isConfigured()) {
    await uploadService.deleteAsset(brand.logo.publicId);
  }

  await brand.deleteOne();

  return res.status(200).json(
    new ApiResponse(
      200,
      { _id: id },
      `Brand '${brand.name}' deleted successfully.`
    )
  );
});
