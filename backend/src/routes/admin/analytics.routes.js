import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  salesGraphQueryValidator,
  topProductsQueryValidator,
} from '../../validators/admin.validator.js';
import {
  getOverview,
  getSalesGraph,
  getTopProducts,
  getInventoryStatus,
  getCustomerInsights,
} from '../../controllers/admin/analytics.controller.js';

const router = Router();

router.get('/overview', getOverview);
router.get('/sales-graph', validate(salesGraphQueryValidator), getSalesGraph);
router.get('/top-products', validate(topProductsQueryValidator), getTopProducts);
router.get('/inventory-status', getInventoryStatus);
router.get('/customer-insights', getCustomerInsights);

export default router;
