import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { bulkUpdateStockValidator } from '../../validators/admin.validator.js';
import {
  getLowStockAlerts,
  bulkUpdateStock,
} from '../../controllers/admin/inventory.controller.js';

const router = Router();

router.get('/low-stock-alerts', getLowStockAlerts);
router.patch('/bulk-update', validate(bulkUpdateStockValidator), bulkUpdateStock);

export default router;
