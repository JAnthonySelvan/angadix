import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import themeReducer from '../features/theme/themeSlice';
import productReducer from '../features/products/productSlice';
import cartReducer from '../features/cart/cartSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import savedForLaterReducer from '../features/savedForLater/savedForLaterSlice';
import recentlyViewedReducer from '../features/recentlyViewed/recentlyViewedSlice';
import addressReducer from '../features/checkout/addressSlice';
import orderReducer from '../features/checkout/orderSlice';
import adminAnalyticsReducer from '../features/admin/analyticsSlice';
import adminUsersReducer from '../features/admin/adminUsersSlice';
import adminBannersReducer from '../features/admin/bannerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    savedForLater: savedForLaterReducer,
    recentlyViewed: recentlyViewedReducer,
    address: addressReducer,
    order: orderReducer,
    adminAnalytics: adminAnalyticsReducer,
    adminUsers: adminUsersReducer,
    adminBanners: adminBannersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
