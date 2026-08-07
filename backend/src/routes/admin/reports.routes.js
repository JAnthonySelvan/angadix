import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { reportQueryValidator } from '../../validators/admin.validator.js';
import {
  getSalesReport,
  getInventoryReport,
  getCustomerReport,
} from '../../controllers/admin/reports.controller.js';

const router = Router();

router.get('/sales', validate(reportQueryValidator), getSalesReport);
router.get('/inventory', validate(reportQueryValidator), getInventoryReport);
router.get('/customers', validate(reportQueryValidator), getCustomerReport);

export default router;
