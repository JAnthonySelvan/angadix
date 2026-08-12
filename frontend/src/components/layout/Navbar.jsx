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
import { fetchBrands, fetchCategories, fetchProductsList, fetchSearchSuggestions } from '../../features/products/productThunks';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { MegaMenu } from '../common/MegaMenu';
import { NotificationBell } from '../common/NotificationBell';
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

  const isOverHero = location.pathname === '/' && !isScrolled;

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
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
    { name: t('home.shopByBrand', 'Shop By Brand'), path: '/brands' },
    { name: t('home.bestSellers', 'Best Sellers'), path: '/best-sellers' },
    { name: t('home.flashSale', 'Flash Sale'), path: '/flash-sale' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* 1. Top Alert Banner */}
      <TopAlertBanner isOverHero={isOverHero} />

      {/* 2. Main Header */}
      <div
        className={`w-full transition-all duration-300 ${
          isOverHero
            ? 'bg-white/20 dark:bg-slate-900/20 border-b border-white/20 dark:border-slate-800/30 py-3.5 backdrop-blur-md shadow-xs dark:shadow-none'
            : isScrolled
            ? 'glass-header shadow-lg py-2.5'
            : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <img
              src="/logo.png"
              alt="Angadix Logo"
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105 dark:hidden"
            />
            <img
              src="/logo-dark.png"
              alt="Angadix Dark Logo"
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105 hidden dark:block"
            />
          </Link>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-2xl relative mx-4">
            {/* Search Input with Live Dropdown */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                type="text"
                placeholder={t('common.searchPlaceholder', 'Search products, brands, categories...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className={`w-full pl-4 pr-10 rtl:pl-10 rtl:pr-4 py-2.5 text-xs font-medium rounded-2xl border transition-all duration-300 ${
                  isOverHero
                    ? 'bg-white/25 dark:bg-white/10 text-[#0a2540] dark:text-white placeholder-[#0a2540]/70 dark:placeholder-white/70 border-white/30 dark:border-white/20 backdrop-blur-md shadow-xs focus:bg-white/50 dark:focus:bg-white/20 focus:border-[#0266C8] dark:focus:border-sky-400 focus:outline-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none'
                }`}
              />
              <button
                type="submit"
                className={`absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                  isOverHero ? 'text-[#0266C8] dark:text-white/80 hover:text-[#0054A6] dark:hover:text-white' : 'text-slate-400 hover:text-primary-600'
                }`}
              >
                <Search size={16} />
              </button>

              {/* Live Search Preview Dropdown */}
              {isSearchFocused && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-slate-800 overflow-hidden z-50 p-2">
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

          {/* Right Action Icons (Notifications, Wishlist, Cart, Theme Toggle, Language Switcher, Profile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell Dropdown */}
            <NotificationBell isOverHero={isOverHero} />

            {/* Language Switcher */}
            <LanguageSwitcher isOverHero={isOverHero} />

            {/* Theme Toggle Button */}
            <ThemeToggle isOverHero={isOverHero} />

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className={`relative p-2.5 rounded-full transition-colors duration-300 ${
                isOverHero
                  ? 'bg-white/25 dark:bg-white/10 hover:bg-white/45 dark:hover:bg-white/20 text-[#0a2540] dark:text-white border border-white/30 dark:border-white/20 backdrop-blur-md shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
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
              className={`relative p-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                isOverHero
                  ? 'bg-[#0266C8]/75 dark:bg-white/15 hover:bg-[#0266C8]/90 dark:hover:bg-white/25 text-white border border-white/30 dark:border-white/25 shadow-md backdrop-blur-md'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/30'
              }`}
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
                  className={`flex items-center gap-2 p-1.5 pl-2.5 sm:pl-3 rtl:pr-2.5 rtl:pl-1.5 rounded-full border transition-all duration-300 ${
                    isOverHero
                      ? 'border-white/30 dark:border-white/20 bg-white/25 dark:bg-white/10 hover:bg-white/45 dark:hover:bg-white/20 text-[#0a2540] dark:text-white backdrop-blur-md shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title={user.name || 'User Profile'}
                >
                  <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className={`text-xs font-bold hidden sm:inline max-w-[100px] truncate ${
                    isOverHero ? 'text-[#0a2540] dark:text-white' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {user.name}
                  </span>
                  <ChevronDown size={14} className={isOverHero ? 'text-[#0266C8] dark:text-white/70' : 'text-slate-400'} />
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
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Package size={14} />
                        <span>{t('nav.orders', 'My Orders')}</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-xl my-1 transition-colors"
                        >
                          <Sparkles size={14} />
                          <span>{t('nav.adminDashboard', 'Admin Dashboard')}</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
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
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className={`px-2.5 sm:px-3.5 py-2 text-xs font-bold rounded-xl transition-colors duration-300 flex items-center gap-1.5 ${
                    isOverHero
                      ? 'text-[#0a2540] hover:text-[#0266C8] dark:text-white dark:hover:text-white/80'
                      : 'text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                  title={t('nav.login', 'Sign In')}
                >
                  <UserIcon size={16} className="text-primary-600 dark:text-sky-400" />
                  <span>{t('nav.login', 'Sign In')}</span>
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 text-xs font-extrabold rounded-full transition-all hidden sm:inline-block ${
                    isOverHero
                      ? 'bg-[#0266C8]/75 hover:bg-[#0266C8]/90 text-white shadow-md border border-white/30 dark:bg-white/20 dark:hover:bg-white/30 dark:text-white dark:border-white/30 backdrop-blur-md'
                      : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/30'
                  }`}
                >
                  {t('nav.register', 'Create Account')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl transition-colors duration-300 ${
                isOverHero
                  ? 'bg-white/25 dark:bg-white/10 text-[#0a2540] dark:text-white hover:bg-white/45 dark:hover:bg-white/20 border border-white/30 dark:border-white/20 backdrop-blur-md shadow-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* 2b. Mobile Live Search Input Bar */}
      <div className="lg:hidden px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder={t('common.searchPlaceholder', 'Search products, brands, categories...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full pl-3.5 pr-10 rtl:pl-10 rtl:pr-3.5 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600"
          >
            <Search size={16} />
          </button>

          {/* Mobile Live Search Preview Dropdown */}
          {isSearchFocused && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 p-2">
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

      {/* 2c. Mobile Quick Navigation Pills */}
      <div className="lg:hidden bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80 px-4 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 whitespace-nowrap text-xs font-bold">
          <Link
            to="/shop"
            className="px-3 py-1.5 rounded-full bg-primary-600 text-white shadow-xs hover:bg-primary-700 transition-all flex items-center gap-1"
          >
            <span>{t('nav.shop', 'Shop')}</span>
          </Link>

          <Link
            to="/browse"
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-all flex items-center gap-1"
          >
            <Grid size={13} className="text-primary-500" />
            <span>{t('nav.categories', 'Categories')}</span>
          </Link>

          <Link
            to="/brands"
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-all flex items-center gap-1"
          >
            <span>{t('home.shopByBrand', 'Shop By Brand')}</span>
          </Link>

          <Link
            to="/best-sellers"
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-all flex items-center gap-1"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>{t('home.bestSellers', 'Best Sellers')}</span>
          </Link>

          <Link
            to="/flash-sale"
            className="px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition-all flex items-center gap-1"
          >
            <span>🔥 {t('home.flashSale', 'Flash Sale')}</span>
          </Link>
        </div>
      </div>

      {/* 3. Navigation Sub-bar (Desktop) */}
      <div
        className={`border-b hidden lg:block transition-all duration-300 ${
          isOverHero
            ? 'bg-transparent border-transparent'
            : 'bg-slate-50/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-800/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10">
          <nav className="flex items-center gap-8">
            <MegaMenu variant="nav" isOverHero={isOverHero} />
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-bold transition-colors duration-300 tracking-wide ${
                  isOverHero
                    ? 'text-[#0a2540] hover:text-[#0266C8] dark:text-white/90 dark:hover:text-white font-extrabold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className={`text-xs font-semibold flex items-center gap-1 transition-colors duration-300 ${
            isOverHero ? 'text-[#0266C8] dark:text-sky-200' : 'text-primary-600 dark:text-primary-400'
          }`}>
            <Sparkles size={13} />
            <span>{t('home.heroTag', 'Premium Technology')}</span>
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
            className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-5 space-y-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {t('nav.menu', 'Navigation Menu')}
              </p>

              <Link
                to="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>{t('nav.shop', 'Shop All Products')}</span>
                <ChevronDown size={16} className="-rotate-90 text-slate-400" />
              </Link>

              <Link
                to="/browse"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Grid size={16} className="text-primary-600" />
                  <span>{t('nav.categories', 'Browse Categories')}</span>
                </div>
                <ChevronDown size={16} className="-rotate-90 text-slate-400" />
              </Link>

              <Link
                to="/brands"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>{t('home.shopByBrand', 'Shop By Brand')}</span>
                <ChevronDown size={16} className="-rotate-90 text-slate-400" />
              </Link>

              <Link
                to="/best-sellers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  <span>{t('home.bestSellers', 'Best Sellers')}</span>
                </div>
                <ChevronDown size={16} className="-rotate-90 text-slate-400" />
              </Link>

              <Link
                to="/flash-sale"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <span>🔥 {t('home.flashSale', 'Flash Sale')}</span>
                <ChevronDown size={16} className="-rotate-90 text-rose-400" />
              </Link>
            </div>

            {/* Account & Profile Section in Mobile Drawer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {t('nav.account', 'My Account')}
                  </p>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Package size={16} className="text-primary-600" />
                    <span>{t('nav.orders', 'My Orders')}</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Heart size={16} className="text-rose-500" />
                    <span>{t('nav.wishlist', 'My Wishlist')} ({wishlistItems.length})</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                    >
                      <Sparkles size={16} />
                      <span>{t('nav.adminDashboard', 'Admin Dashboard')}</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left rtl:text-right"
                  >
                    <LogOut size={16} />
                    <span>{t('nav.logout', 'Sign Out')}</span>
                  </button>
                </>
              ) : (
                <>
                  <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {t('nav.account', 'Account Access')}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2.5 text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UserIcon size={14} className="text-primary-600 dark:text-sky-400" />
                      <span>{t('nav.login', 'Sign In')}</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2.5 text-center text-xs font-bold rounded-xl bg-primary-600 text-white shadow-sm hover:bg-primary-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>{t('nav.register', 'Create Account')}</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
