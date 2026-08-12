import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { GuestRoute } from '../components/common/GuestRoute';

import { Home } from '../pages/Home';
import { Shop } from '../pages/Shop';
import { ProductDetail } from '../pages/ProductDetail';
import { Cart } from '../pages/Cart';
import { Wishlist } from '../pages/Wishlist';
import { NotFound } from '../pages/NotFound';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { VerifyEmail } from '../pages/auth/VerifyEmail';
import { Checkout } from '../pages/Checkout';
import { OrderSuccess } from '../pages/OrderSuccess';
import { OrderHistory } from '../pages/OrderHistory';
import { OrderDetail } from '../pages/OrderDetail';
import { BrowseCollection } from '../pages/BrowseCollection';

import { AdminRoute } from '../components/common/AdminRoute';
import { AdminLayout } from '../components/layout/AdminLayout';

// Lazy-loaded Admin Page Modules (Route-level code splitting)
const AdminDashboard = React.lazy(() =>
  import('../pages/admin/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const ProductManagement = React.lazy(() =>
  import('../pages/admin/ProductManagement').then((m) => ({ default: m.ProductManagement }))
);
const CategoryManagement = React.lazy(() =>
  import('../pages/admin/CategoryManagement').then((m) => ({ default: m.CategoryManagement }))
);
const BrandManagement = React.lazy(() =>
  import('../pages/admin/BrandManagement').then((m) => ({ default: m.BrandManagement }))
);
const OrderManagement = React.lazy(() =>
  import('../pages/admin/OrderManagement').then((m) => ({ default: m.OrderManagement }))
);
const CouponManagement = React.lazy(() =>
  import('../pages/admin/CouponManagement').then((m) => ({ default: m.CouponManagement }))
);
const UserManagement = React.lazy(() =>
  import('../pages/admin/UserManagement').then((m) => ({ default: m.UserManagement }))
);
const BannerManagement = React.lazy(() =>
  import('../pages/admin/BannerManagement').then((m) => ({ default: m.BannerManagement }))
);
const FeaturedShowcaseManagement = React.lazy(() =>
  import('../pages/admin/FeaturedShowcaseManagement').then((m) => ({ default: m.FeaturedShowcaseManagement }))
);
const InventoryManagement = React.lazy(() =>
  import('../pages/admin/InventoryManagement').then((m) => ({ default: m.InventoryManagement }))
);
const Reports = React.lazy(() =>
  import('../pages/admin/Reports').then((m) => ({ default: m.Reports }))
);

const AdminPageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full text-slate-400 text-xs font-semibold">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
    Loading Admin Module...
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Protected Admin Control Center Routes (Lazy Loaded) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <React.Suspense fallback={<AdminPageLoader />}>
              <AdminLayout />
            </React.Suspense>
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="brands" element={<BrandManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="coupons" element={<CouponManagement />} />
        <Route path="banners" element={<BannerManagement />} />
        <Route path="featured-showcase" element={<FeaturedShowcaseManagement />} />
        <Route path="customers" element={<UserManagement />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Auth Routes Wrapped in AuthLayout and GuestRoute */}
      <Route
        element={
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        }
      >
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Main Application Routes Wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/categories" element={<BrowseCollection type="categories" />} />
        <Route path="/browse" element={<BrowseCollection type="categories" />} />
        <Route path="/brands" element={<BrowseCollection type="brands" />} />
        <Route path="/best-sellers" element={<BrowseCollection type="bestSellers" />} />
        <Route path="/flash-sale" element={<BrowseCollection type="flashSale" />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Protected User Account & Checkout Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:orderId"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/me"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />

        {/* 404 Unmapped Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
