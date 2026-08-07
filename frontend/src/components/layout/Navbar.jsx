import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronDown,
  Sparkles,
  Grid,
  Package,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authThunks';
import { toggleCartDrawer, selectCartTotalCount } from '../../features/cart/cartSlice';
import { selectWishlistItems } from '../../features/wishlist/wishlistSlice';
import { fetchCategories, fetchProductsList, fetchSearchSuggestions } from '../../features/products/productThunks';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { TopAlertBanner } from './TopAlertBanner';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  // Search Bar with Live Preview
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const cartTotalCount = useAppSelector(selectCartTotalCount);
  const wishlistItems = useAppSelector(selectWishlistItems);
  const categories = useAppSelector((state) => state.products.categories.items);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsCategoryMenuOpen(false);
    setIsSearchFocused(false);
  }, [location.pathname]);

  // Handle live search debouncing using suggestions endpoint
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await dispatch(fetchSearchSuggestions(searchQuery.trim())).unwrap();
          setSearchResults(res || []);
        } catch (err) {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success(t('toasts.loggedOut', 'Logged out successfully'));
      navigate('/');
    } catch {
      toast.error(t('common.error', 'Logout error'));
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('nav.shop', 'Shop'), path: '/shop' },
    { name: t('nav.categories', 'Categories'), path: '/#categories' },
    { name: t('home.shopByBrand', 'Brands'), path: '/#brands' },
    { name: t('home.bestSellers', 'Best Sellers'), path: '/#bestsellers' },
    { name: t('home.flashSale', 'Flash Sale'), path: '/#flashsale' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* 1. Top Alert Banner */}
      <TopAlertBanner />

      {/* 2. Main Header */}
      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'glass-header shadow-lg py-2.5'
            : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-700 via-primary-600 to-primary-500 flex items-center justify-center text-white shadow-md shadow-primary-600/30 group-hover:scale-105 transition-transform">
              <ShoppingBag size={20} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                ANGADIX<span className="text-primary-600 dark:text-primary-400">.</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 leading-none mt-0.5">
                PREMIUM STORE
              </span>
            </div>
          </Link>

          {/* Category Dropdown & Search Bar */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-2xl relative mx-4">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-l-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors border-r border-slate-200 dark:border-slate-700"
              >
                <Grid size={15} className="text-primary-600 dark:text-primary-400" />
                <span>{t('common.categories', 'Categories')}</span>
                <ChevronDown size={14} />
              </button>

              {/* Categories Menu */}
              <AnimatePresence>
                {isCategoryMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 ltr:left-0 rtl:right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 max-h-80 overflow-y-auto"
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <Link
                          key={cat._id}
                          to={`/shop?category=${cat.slug}`}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 rounded-xl transition-colors"
                          onClick={() => setIsCategoryMenuOpen(false)}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                          <span>{cat.name}</span>
                        </Link>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-slate-400 text-center">{t('common.loading', 'Loading...')}</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search Input with Live Dropdown */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                type="text"
                placeholder={t('common.searchPlaceholder', 'Search products, brands, categories...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-4 pr-10 rtl:pl-10 rtl:pr-4 py-2.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-r-xl border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors"
              >
                <Search size={16} />
              </button>

              {/* Live Search Preview Dropdown */}
              {isSearchFocused && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 p-2">
                  {isSearching ? (
                    <div className="p-4 text-xs text-slate-400 text-center">{t('common.searching', 'Searching...')}</div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t('common.suggestions', 'Suggestions')} ({searchResults.length})
                      </p>
                      {searchResults.map((item, idx) => (
                        <Link
                          key={item.slug || idx}
                          to={`/products/${item.slug}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Search size={14} className="text-primary-500 flex-shrink-0" />
                          <div className="flex-1 truncate">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {item.name}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-xs text-slate-500 text-center">{t('common.noSuggestions', 'No suggestions found')}</div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Right Action Icons (Wishlist, Cart, Theme Toggle, Language Switcher, Profile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={t('nav.wishlist', 'Wishlist')}
              aria-label="View wishlist"
            >
              <Heart size={18} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => dispatch(toggleCartDrawer())}
              className="relative p-2.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/30 transition-all focus:outline-none"
              title={t('nav.cart', 'Cart')}
              aria-label="Open shopping cart drawer"
            >
              <ShoppingBag size={18} />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center shadow-sm">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rtl:pr-3 rtl:pl-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 ltr:right-0 rtl:left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 overflow-hidden"
                    >
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl mb-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {t('auth.loginSub', 'Signed in as')}
                        </p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to="/orders"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Package size={14} />
                        <span>{t('nav.orders', 'My Orders')}</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-xl my-1 transition-colors"
                        >
                          <Sparkles size={14} />
                          <span>{t('nav.adminDashboard', 'Admin Dashboard')}</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left rtl:text-right"
                      >
                        <LogOut size={14} />
                        <span>{t('nav.logout', 'Sign Out')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {t('nav.login', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold rounded-full shadow-md shadow-primary-600/30 transition-all hidden sm:inline-block"
                >
                  {t('nav.register', 'Create Account')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navigation Sub-bar */}
      <div className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/60 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10">
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors tracking-wide"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1">
            <Sparkles size={13} />
            <span>{t('home.heroTag', 'Next-Gen Technology')}</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-100"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-slate-400">
                  <Search size={16} />
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary-600 py-2 border-b border-slate-100 dark:border-slate-800"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
