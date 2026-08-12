import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import categoryRoutes from './routes/category.routes.js';
import brandRoutes from './routes/brand.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import savedForLaterRoutes from './routes/savedForLater.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import featuredShowcaseRoutes from './routes/featuredShowcase.routes.js';
import addressRoutes from './routes/address.routes.js';
import orderRoutes from './routes/order.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRouter from './routes/admin/index.js';
import { razorpayWebhook } from './controllers/order.controller.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { ApiResponse } from './utils/ApiResponse.js';

const app = express();

// 1. HTTP Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://checkout.razorpay.com',
          'https://*.razorpay.com',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://res.cloudinary.com',
          'https://*.razorpay.com',
        ],
        connectSrc: [
          "'self'",
          'https://api.razorpay.com',
          'https://*.razorpay.com',
        ],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: env.isProd
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  })
);

// 1.1 Response Compression (Mounted after helmet, before webhook raw-body route)
app.use(compression({ threshold: 0 }));

// 2. Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin ? origin.replace(/\/$/, '') : null;
      const allowedOrigins = env.clientUrls.map((u) => u.replace(/\/$/, ''));
      if (!origin || allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true, // Allow cookies to be sent across origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// IMPORTANT WEBHOOK MOUNT ORDERING REQUIREMENT:
// The Razorpay webhook requires raw body access to verify the HMAC signature against the raw payload bytes.
// Mounting this BEFORE express.json() ensures the request body stream is not pre-parsed into JSON.
app.post(
  '/api/v1/orders/webhook/razorpay',
  express.raw({ type: 'application/json' }),
  razorpayWebhook
);

// Global Fallback Rate Limiter (Applied AFTER raw-body webhook route and BEFORE API routers)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // Generous limit: 300 requests per 15 minutes per IP
  standardHeaders: 'draft-7',
  legacyHeaders: true,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    errors: [],
  },
});
app.use('/api/v1', globalLimiter);

// 3. Request Body Parsing
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// 4. Cookie Parser
app.use(cookieParser());

// 5. Sanitize Data Against NoSQL Injection Attacks ($ and . removal)
app.use(mongoSanitize());

// 6. Request Logging
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 7. Healthcheck Route
app.get('/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: 'UP',
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv,
      },
      'Angadix API server is running smoothly.'
    )
  );
});

// 8. API v1 Router Mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/saved-for-later', savedForLaterRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/featured-showcase', featuredShowcaseRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/orders', invoiceRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRouter);

// 9. 404 Route Handler for Unmapped Endpoints
app.use(notFound);

// 10. Global Error Handler Middleware
app.use(errorMiddleware);

export default app;
