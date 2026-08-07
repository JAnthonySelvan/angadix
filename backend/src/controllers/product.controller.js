import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { Cart } from '../models/Cart.js';
import { Wishlist } from '../models/Wishlist.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadService } from '../services/upload.service.js';
import { buildProductFilterQuery } from '../utils/productQueryBuilder.js';

const LIGHTWEIGHT_CARD_FIELDS =
  'name slug price discountPrice currency stock images ratingsAverage ratingsCount isFeatured isBestSeller category brand';

/**
 * Helper to fetch related products lightweight documents
 */
const fetchRelatedProductsHelper = async (categoryId, currentProductId, limitCap = 6) => {
  if (!categoryId) return [];
  return await Product.find({
    category: categoryId,
    _id: { $ne: currentProductId },
    isActive: true,
  })
    .select(LIGHTWEIGHT_CARD_FIELDS)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .sort({ isFeatured: -1, ratingsAverage: -1 })
    .limit(limitCap)
    .lean();
};

/**
 * Helper to fetch similar products lightweight documents
 */
const fetchSimilarProductsHelper = async (
  tags = [],
  brandId = null,
  currentProductId,
  excludeIds = [],
  limitCap = 6
) => {
  const query = {
    _id: { $ne: currentProductId, $nin: excludeIds },
    isActive: true,
  };

  const conditions = [];
  if (tags && tags.length > 0) {
    conditions.push({ tags: { $in: tags } });
  }
  if (brandId) {
    conditions.push({ brand: brandId });
  }

  if (conditions.length > 0) {
    query.$or = conditions;
  }

  return await Product.find(query)
    .select(LIGHTWEIGHT_CARD_FIELDS)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .sort({ ratingsAverage: -1, createdAt: -1 })
    .limit(limitCap)
    .lean();
};

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
 * @desc    Get paginated products with advanced filtering & sorting
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '12', 10)));
  const skip = (page - 1) * limit;

  const query = await buildProductFilterQuery(req.query);

  // Text search filter fallback for main list endpoint
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { tags: { $regex: req.query.search, $options: 'i' } },
      { shortDescription: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Sort options mapping
  const { sort } = req.query;
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
 * @desc    Get single product by slug (with bundled related & similar products)
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

  const categoryId = product.category?._id || product.category;
  const brandId = product.brand?._id || product.brand;

  const relatedProducts = await fetchRelatedProductsHelper(categoryId, product._id, 6);
  const relatedIds = relatedProducts.map((p) => p._id);
  const similarProducts = await fetchSimilarProductsHelper(
    product.tags,
    brandId,
    product._id,
    relatedIds,
    6
  );

  const payload = {
    ...product,
    relatedProducts,
    similarProducts,
  };

  return res.status(200).json(
    new ApiResponse(200, payload, 'Product details retrieved successfully.')
  );
});

/**
 * @desc    Full-text search endpoint with relevance ranking and filters
 * @route   GET /api/v1/products/search?q=<query>
 * @access  Public
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const q = req.query.q ? req.query.q.trim() : '';
  if (!q || q.length < 2) {
    throw new ApiError(422, 'Search query (q) must be at least 2 characters long.');
  }

  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '12', 10)));
  const skip = (page - 1) * limit;

  const filterQuery = await buildProductFilterQuery(req.query);
  const query = {
    $text: { $search: q },
    ...filterQuery,
  };

  const { sort } = req.query;
  let sortOption = { score: { $meta: 'textScore' } };
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'newest') sortOption = { createdAt: -1 };
  else if (sort === 'rating') sortOption = { ratingsAverage: -1 };

  const [products, total] = await Promise.all([
    Product.find(query, { score: { $meta: 'textScore' } })
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
      'Search results retrieved successfully.'
    )
  );
});

/**
 * @desc    Search autocomplete / suggestions (lightweight)
 * @route   GET /api/v1/products/search/suggestions?q=<partial>
 * @access  Public
 */
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const q = req.query.q ? req.query.q.trim() : '';
  if (!q || q.length < 2) {
    throw new ApiError(422, 'Search query (q) must be at least 2 characters long.');
  }

  const suggestions = await Product.find({
    name: { $regex: q, $options: 'i' },
    isActive: true,
  })
    .select('name slug')
    .limit(8)
    .lean();

  return res.status(200).json(
    new ApiResponse(200, suggestions, 'Search suggestions retrieved successfully.')
  );
});

/**
 * @desc    Get faceted counts for currently applied filter context
 * @route   GET /api/v1/products/facets
 * @access  Public
 */
export const getProductFacets = asyncHandler(async (req, res) => {
  const filterQuery = await buildProductFilterQuery(req.query);

  const facetResults = await Product.aggregate([
    { $match: filterQuery },
    {
      $facet: {
        categories: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'categoryDoc',
            },
          },
          { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              name: '$categoryDoc.name',
              slug: '$categoryDoc.slug',
              count: 1,
            },
          },
          { $sort: { count: -1 } },
        ],
        brands: [
          { $group: { _id: '$brand', count: { $sum: 1 } } },
          {
            $lookup: {
              from: 'brands',
              localField: '_id',
              foreignField: '_id',
              as: 'brandDoc',
            },
          },
          { $unwind: { path: '$brandDoc', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              name: '$brandDoc.name',
              slug: '$brandDoc.slug',
              logo: '$brandDoc.logo',
              count: 1,
            },
          },
          { $sort: { count: -1 } },
        ],
        priceRange: [
          {
            $group: {
              _id: null,
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' },
            },
          },
        ],
        ratings: [
          {
            $bucket: {
              groupBy: '$ratingsAverage',
              boundaries: [0, 1, 2, 3, 4, 5.01],
              default: 'Other',
              output: { count: { $sum: 1 } },
            },
          },
        ],
        inStockCount: [{ $match: { stock: { $gt: 0 } } }, { $count: 'count' }],
        total: [{ $count: 'total' }],
      },
    },
  ]);

  const facets = facetResults[0] || {};
  const priceRange =
    facets.priceRange && facets.priceRange[0]
      ? { min: facets.priceRange[0].minPrice || 0, max: facets.priceRange[0].maxPrice || 0 }
      : { min: 0, max: 0 };
  const total = facets.total && facets.total[0] ? facets.total[0].total : 0;
  const inStock = facets.inStockCount && facets.inStockCount[0] ? facets.inStockCount[0].count : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        categories: facets.categories || [],
        brands: (facets.brands || []).filter((b) => b._id !== null),
        priceRange,
        ratings: facets.ratings || [],
        inStock,
        total,
      },
      'Faceted counts retrieved successfully.'
    )
  );
});

/**
 * @desc    Get related products (standalone endpoint)
 * @route   GET /api/v1/products/:id/related
 * @access  Public
 */
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let product;
  if (mongoose.Types.ObjectId.isValid(id)) {
    product = await Product.findById(id).lean();
  } else {
    product = await Product.findOne({ slug: id }).lean();
  }

  if (!product) {
    throw new ApiError(404, `Product '${id}' not found.`);
  }

  const categoryId = product.category?._id || product.category;
  const relatedProducts = await fetchRelatedProductsHelper(categoryId, product._id, 8);

  return res.status(200).json(
    new ApiResponse(200, relatedProducts, 'Related products retrieved successfully.')
  );
});

/**
 * @desc    Get similar products (standalone endpoint)
 * @route   GET /api/v1/products/:id/similar
 * @access  Public
 */
export const getSimilarProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let product;
  if (mongoose.Types.ObjectId.isValid(id)) {
    product = await Product.findById(id).lean();
  } else {
    product = await Product.findOne({ slug: id }).lean();
  }

  if (!product) {
    throw new ApiError(404, `Product '${id}' not found.`);
  }

  const brandId = product.brand?._id || product.brand;
  const similarProducts = await fetchSimilarProductsHelper(
    product.tags,
    brandId,
    product._id,
    [],
    8
  );

  return res.status(200).json(
    new ApiResponse(200, similarProducts, 'Similar products retrieved successfully.')
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

/**
 * GET /api/v1/products/:id/frequently-bought-together
 * Fetch rule-based frequently bought together recommendations
 */
export const getFrequentlyBoughtTogether = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const limitCap = parseInt(req.query.limit, 10) || 4;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid product ID.');
  }

  const sourceProduct = await Product.findById(id);
  if (!sourceProduct || !sourceProduct.isActive) {
    throw new ApiError(404, 'Product not found or unavailable.');
  }

  let recommendations = [];

  // Guarded check: If Order model exists (Phase 5/6), query Order co-occurrences
  if (mongoose.models && mongoose.models.Order) {
    try {
      const Order = mongoose.models.Order;
      const ordersWithProduct = await Order.find({ 'items.product': id })
        .select('items.product')
        .lean();

      if (ordersWithProduct && ordersWithProduct.length > 0) {
        const coOccurrenceMap = {};
        ordersWithProduct.forEach((order) => {
          order.items?.forEach((item) => {
            const pId = item.product?.toString();
            if (pId && pId !== id) {
              coOccurrenceMap[pId] = (coOccurrenceMap[pId] || 0) + 1;
            }
          });
        });

        const sortedProductIds = Object.keys(coOccurrenceMap).sort(
          (a, b) => coOccurrenceMap[b] - coOccurrenceMap[a]
        );

        if (sortedProductIds.length > 0) {
          recommendations = await Product.find({
            _id: { $in: sortedProductIds.slice(0, limitCap) },
            isActive: true,
            stock: { $gt: 0 },
          })
            .select(LIGHTWEIGHT_CARD_FIELDS)
            .populate('category', 'name slug')
            .populate('brand', 'name slug logo')
            .lean();
        }
      }
    } catch (orderErr) {
      console.warn('Order co-occurrence query skipped:', orderErr?.message);
    }
  }

  // Temporary fallback rule-based matching (brand match > tag overlap > category match) until Order data exists in Phase 5/6
  if (recommendations.length < limitCap) {
    const existingIds = [id, ...recommendations.map((p) => p._id.toString())];
    const tags = sourceProduct.tags || [];

    const conditions = [];
    if (sourceProduct.brand) conditions.push({ brand: sourceProduct.brand });
    if (sourceProduct.category) conditions.push({ category: sourceProduct.category });
    if (tags.length > 0) conditions.push({ tags: { $in: tags } });

    if (conditions.length > 0) {
      const fallbackCandidates = await Product.find({
        _id: { $nin: existingIds },
        isActive: true,
        stock: { $gt: 0 },
        $or: conditions,
      })
        .select(LIGHTWEIGHT_CARD_FIELDS)
        .populate('category', 'name slug')
        .populate('brand', 'name slug logo')
        .sort({ isBestSeller: -1, ratingsAverage: -1 })
        .limit(limitCap * 2)
        .lean();

      // Rank candidates by relevance score
      const rankedCandidates = fallbackCandidates.map((prod) => {
        let score = 0;
        if (
          prod.brand &&
          sourceProduct.brand &&
          prod.brand._id?.toString() === sourceProduct.brand.toString()
        ) {
          score += 3;
        }
        if (prod.tags && tags.length > 0) {
          const matchingTags = prod.tags.filter((t) => tags.includes(t));
          score += matchingTags.length * 2;
        }
        if (
          prod.category &&
          sourceProduct.category &&
          prod.category._id?.toString() === sourceProduct.category.toString()
        ) {
          score += 1;
        }
        return { prod, score };
      });

      rankedCandidates.sort((a, b) => b.score - a.score);
      const fallbackProds = rankedCandidates
        .map((rc) => rc.prod)
        .slice(0, limitCap - recommendations.length);
      recommendations = [...recommendations, ...fallbackProds];
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        recommendations,
        'Frequently bought together products fetched successfully.'
      )
    );
});

/**
 * GET /api/v1/products/recommendations
 * Fetch personalized "Recommended For You" products for authenticated user
 */
export const getRecommendedForYou = asyncHandler(async (req, res) => {
  const limitCap = parseInt(req.query.limit, 10) || 8;
  const userId = req.user._id;

  // 1. Fetch user's Cart and Wishlist items to extract interest signals
  const [cart, wishlist] = await Promise.all([
    Cart.findOne({ user: userId }).populate('items.product', 'category brand tags').lean(),
    Wishlist.findOne({ user: userId }).populate('items.product', 'category brand tags').lean(),
  ]);

  const userProductObjects = [];
  const excludeIds = [];

  if (cart && Array.isArray(cart.items)) {
    cart.items.forEach((ci) => {
      if (ci.product && typeof ci.product === 'object') {
        userProductObjects.push(ci.product);
        if (ci.product._id) excludeIds.push(ci.product._id.toString());
      }
    });
  }

  if (wishlist && Array.isArray(wishlist.items)) {
    wishlist.items.forEach((wi) => {
      if (wi.product && typeof wi.product === 'object') {
        userProductObjects.push(wi.product);
        if (wi.product._id) excludeIds.push(wi.product._id.toString());
      }
    });
  }

  let recommendations = [];

  if (userProductObjects.length > 0) {
    const categoryIds = [
      ...new Set(
        userProductObjects
          .map((p) => p.category?.toString())
          .filter(Boolean)
      ),
    ];
    const brandIds = [
      ...new Set(
        userProductObjects
          .map((p) => p.brand?.toString())
          .filter(Boolean)
      ),
    ];
    const tags = [
      ...new Set(
        userProductObjects
          .flatMap((p) => p.tags || [])
          .filter(Boolean)
      ),
    ];

    const conditions = [];
    if (categoryIds.length > 0) conditions.push({ category: { $in: categoryIds } });
    if (brandIds.length > 0) conditions.push({ brand: { $in: brandIds } });
    if (tags.length > 0) conditions.push({ tags: { $in: tags } });

    if (conditions.length > 0) {
      recommendations = await Product.find({
        _id: { $nin: excludeIds },
        isActive: true,
        stock: { $gt: 0 },
        $or: conditions,
      })
        .select(LIGHTWEIGHT_CARD_FIELDS)
        .populate('category', 'name slug')
        .populate('brand', 'name slug logo')
        .sort({ isFeatured: -1, ratingsAverage: -1, createdAt: -1 })
        .limit(limitCap)
        .lean();
    }
  }

  // Cold-start fallback: Top rated / featured products if user has no cart/wishlist history or results < limitCap
  if (recommendations.length < limitCap) {
    const existingIds = [...excludeIds, ...recommendations.map((p) => p._id.toString())];
    const fallbackItems = await Product.find({
      _id: { $nin: existingIds },
      isActive: true,
      stock: { $gt: 0 },
    })
      .select(LIGHTWEIGHT_CARD_FIELDS)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .sort({ isFeatured: -1, ratingsAverage: -1 })
      .limit(limitCap - recommendations.length)
      .lean();

    recommendations = [...recommendations, ...fallbackItems];
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        recommendations,
        'Recommended for you products fetched successfully.'
      )
    );
});

