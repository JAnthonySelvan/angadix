import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  searchProducts,
  getSearchSuggestions,
  getProductFacets,
  getRelatedProducts,
  getSimilarProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getHomepageProducts,
} from '../controllers/product.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadProductMedia } from '../middlewares/upload.middleware.js';
import {
  createProductValidator,
  updateProductValidator,
  updateStockValidator,
  searchProductsValidator,
  searchSuggestionsValidator,
  getProductsQueryValidator,
} from '../validators/product.validator.js';

const router = Router();

// Public Routes
router.get('/homepage', getHomepageProducts);
router.get('/search/suggestions', validate(searchSuggestionsValidator), getSearchSuggestions);
router.get('/search', validate(searchProductsValidator), searchProducts);
router.get('/facets', getProductFacets);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/similar', getSimilarProducts);
router.get('/', validate(getProductsQueryValidator), getProducts);
router.get('/:slug', getProductBySlug);

// Admin-only Routes
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadProductMedia(),
  validate(createProductValidator),
  createProduct
);

router.patch(
  '/:id/stock',
  protect,
  authorize('admin'),
  validate(updateStockValidator),
  updateProductStock
);

router.patch(
  '/:id',
  protect,
  authorize('admin'),
  uploadProductMedia(),
  validate(updateProductValidator),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteProduct
);

export default router;

