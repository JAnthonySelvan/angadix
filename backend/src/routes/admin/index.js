import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import analyticsRoutes from './analytics.routes.js';
import reportsRoutes from './reports.routes.js';
import bannerRoutes from './banner.routes.js';
import featuredShowcaseRoutes from './featuredShowcase.routes.js';
import inventoryRoutes from './inventory.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

// Enforce authentication & admin authorization for all endpoints under /api/v1/admin
router.use(protect, authorize('admin'));

router.use('/analytics', analyticsRoutes);
router.use('/reports', reportsRoutes);
router.use('/banners', bannerRoutes);
router.use('/featured-showcase', featuredShowcaseRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/users', userRoutes);

export default router;
