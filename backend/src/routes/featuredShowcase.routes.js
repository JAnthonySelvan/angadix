import { Router } from 'express';
import { getFeaturedShowcases } from '../controllers/admin/featuredShowcase.controller.js';

const router = Router();

// Public route for storefront featured showcases
router.get('/', getFeaturedShowcases);

export default router;
