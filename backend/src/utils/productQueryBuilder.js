import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';

/**
 * Builds Mongoose filter query object for product listing, search, and facet aggregation.
 * Supports multi-select category/brand (IDs or slugs), price range, rating, in-stock, and spec-based filters.
 * 
 * @param {Object} queryParams - Express req.query object
 * @returns {Promise<Object>} Mongoose query filter object
 */
export const buildProductFilterQuery = async (queryParams = {}) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    isFeatured,
    isBestSeller,
    isActive,
    specs,
  } = queryParams;

  const query = {};

  // 1. Soft-inactive filter (Default: active products only)
  if (isActive !== undefined) {
    query.isActive = isActive === 'true' || isActive === true;
  } else {
    query.isActive = true;
  }

  // 2. Multi-select Category (comma-separated IDs or slugs, e.g. ?category=electronics,laptops)
  if (category) {
    const rawCategories = Array.isArray(category)
      ? category
      : String(category).split(',').map((c) => c.trim()).filter(Boolean);

    if (rawCategories.length > 0) {
      const catIds = [];
      const catSlugs = [];

      for (const item of rawCategories) {
        if (mongoose.Types.ObjectId.isValid(item)) {
          catIds.push(new mongoose.Types.ObjectId(item));
        } else {
          catSlugs.push(item);
        }
      }

      if (catSlugs.length > 0) {
        const matchingCategories = await Category.find({ slug: { $in: catSlugs } }).select('_id').lean();
        matchingCategories.forEach((cat) => catIds.push(cat._id));
      }

      if (catIds.length > 0) {
        let currentParentIds = [...catIds];
        while (currentParentIds.length > 0) {
          const childCategories = await Category.find({
            parentCategory: { $in: currentParentIds },
          })
            .select('_id')
            .lean();

          if (childCategories.length === 0) break;

          const newChildIds = [];
          for (const child of childCategories) {
            const alreadyIncluded = catIds.some((id) => id.equals(child._id));
            if (!alreadyIncluded) {
              catIds.push(child._id);
              newChildIds.push(child._id);
            }
          }
          currentParentIds = newChildIds;
        }
      }

      query.category = { $in: catIds };
    }
  }

  // 3. Multi-select Brand (comma-separated IDs or slugs, e.g. ?brand=apple,samsung)
  if (brand) {
    const rawBrands = Array.isArray(brand)
      ? brand
      : String(brand).split(',').map((b) => b.trim()).filter(Boolean);

    if (rawBrands.length > 0) {
      const brandIds = [];
      const brandSlugs = [];

      for (const item of rawBrands) {
        if (mongoose.Types.ObjectId.isValid(item)) {
          brandIds.push(new mongoose.Types.ObjectId(item));
        } else {
          brandSlugs.push(item);
        }
      }

      if (brandSlugs.length > 0) {
        const matchingBrands = await Brand.find({ slug: { $in: brandSlugs } }).select('_id').lean();
        matchingBrands.forEach((b) => brandIds.push(b._id));
      }

      query.brand = { $in: brandIds };
    }
  }

  // 4. Feature Flags
  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === 'true' || isFeatured === true;
  }
  if (isBestSeller !== undefined) {
    query.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
  }

  // 5. Price Range Filter (minPrice / maxPrice)
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined && minPrice !== '') {
      query.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      query.price.$lte = parseFloat(maxPrice);
    }
  }

  // 6. Rating Filter (minRating)
  if (minRating !== undefined && minRating !== '') {
    query.ratingsAverage = { $gte: parseFloat(minRating) };
  }

  // 7. In-Stock Filter (inStock=true)
  if (inStock !== undefined && (inStock === 'true' || inStock === true)) {
    query.stock = { $gt: 0 };
  }

  // 8. Dynamic Specification Filters (?specs=RAM:16GB,Storage:512GB)
  if (specs) {
    const specPairs = Array.isArray(specs)
      ? specs
      : String(specs).split(',').map((s) => s.trim()).filter(Boolean);

    const elemMatches = [];
    for (const pair of specPairs) {
      const colonIndex = pair.indexOf(':');
      if (colonIndex > 0) {
        const key = pair.substring(0, colonIndex).trim();
        const value = pair.substring(colonIndex + 1).trim();
        if (key && value) {
          elemMatches.push({
            $elemMatch: {
              key: new RegExp(`^${key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i'),
              value: new RegExp(value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i'),
            },
          });
        }
      }
    }

    if (elemMatches.length > 0) {
      query.specifications = { $all: elemMatches };
    }
  }

  return query;
};
