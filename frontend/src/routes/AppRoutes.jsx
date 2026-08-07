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

export const AppRoutes = () => {
  return (
    <Routes>
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
