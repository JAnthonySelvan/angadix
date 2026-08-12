import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ShoppingCart, Heart, Bell, User, Menu, X,
  Truck, ShieldCheck, RefreshCw, Headphones, Star, ArrowRight,
  Play, ChevronLeft, ChevronRight, MapPin, Mail, Globe,
  Instagram, Twitter, Facebook, Youtube, Linkedin, CheckCircle,
  Award, Clock, Sparkles,
  Flame, Gift, CreditCard, RotateCcw, Apple, QrCode, Send,
  Eye, TrendingUp, Cpu, Shield, Zap, Sparkle, CheckCircle2
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchHomepageProducts, fetchCategories, fetchBrands, fetchRecommendedForYou, fetchFeaturedShowcase } from '../features/products/productThunks';
import { ProductCard, PremiumProductCard } from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/ProductSkeleton';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { RecentlyViewed } from '../components/common/RecentlyViewed';
import { PageTransition } from '../components/common/PageTransition';
import { getProductImageUrl, getRawProductImageUrl, handleProductImageError } from '../utils/orderHelpers';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import './Home.samsung.css';

// ── Static Helper Components matching Figma App.tsx ──────────────────────────
function Chip({ children, variant = 'primary' }) {
  const cls = {
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-accent text-accent-foreground',
    sale: 'bg-destructive text-destructive-foreground',
    muted: 'bg-muted text-muted-foreground',
  }[variant] || 'bg-primary text-primary-foreground';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold font-body ${cls}`}>
      {children}
    </span>
  );
}

function SectionHead({ badge, title, sub }) {
  return (
    <div className="text-center mb-10">
      <Chip variant="accent">{badge}</Chip>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0a2540] dark:text-white mt-2">{title}</h2>
      {sub && <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-xl mx-auto text-sm font-body">{sub}</p>}
    </div>
  );
}

function TimeDig({ val, label }) {
  const s = String(val).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div className="bg-foreground text-background rounded-lg w-12 h-12 md:w-14 md:h-14 flex items-center justify-center font-heading text-xl md:text-2xl font-bold tabular-nums">
        {s}
      </div>
      <span className="text-[10px] text-primary-foreground/70 mt-1 uppercase tracking-wider font-body">{label}</span>
    </div>
  );
}

// Keeps the storefront's discovery row varied without changing the homepage API.
function mixProductsByCategory(productGroups, limit = 8) {
  const seenProducts = new Set();
  const categoryBuckets = new Map();

  productGroups.flat().forEach((product) => {
    if (!product?._id || seenProducts.has(product._id)) return;
    seenProducts.add(product._id);

    const category = typeof product.category === 'object'
      ? product.category?.name || product.category?._id
      : product.category;
    const key = category || 'other';

    if (!categoryBuckets.has(key)) categoryBuckets.set(key, []);
    categoryBuckets.get(key).push(product);
  });

  const mixed = [];
  while (mixed.length < limit && [...categoryBuckets.values()].some((items) => items.length)) {
    categoryBuckets.forEach((items) => {
      if (items.length && mixed.length < limit) mixed.push(items.shift());
    });
  }

  return mixed;
}

export const Home = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { homepage, categories, brands, recommendations, featuredShowcase, loading } = useAppSelector((state) => state.products);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [dbBanners, setDbBanners] = useState([]);
  const aiScrollRef = useRef(null);

  const handleAiScroll = (direction) => {
    if (aiScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      aiScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const sectionAnimation = {
    initial: { opacity: 1, y: 0 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.05 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  };

  useEffect(() => {
    dispatch(fetchHomepageProducts());
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    dispatch(fetchFeaturedShowcase());
    if (isAuthenticated) {
      dispatch(fetchRecommendedForYou());
    }

    // Fetch active storefront banners from backend
    api.get('/banners?isActive=true')
      .then((res) => {
        if (res.data?.data) {
          setDbBanners(res.data.data);
        }
      })
      .catch(() => {});
  }, [dispatch, isAuthenticated]);

  const activeHeroBanners = dbBanners.filter((b) => b.placement === 'hero');

  const HERO_SLIDES = activeHeroBanners.length > 0
    ? activeHeroBanners.map((b) => ({
        tag: b.subtitle || t('home.heroTag', 'Premium Technology'),
        title: b.title,
        sub: b.subtitle || t('home.heroSubtitle', 'Experience studio-grade acoustics and high-precision sensors engineered for perfection.'),
        cta1: b.ctaText || t('common.shopNow', 'Shop Now'),
        cta2: t('home.exploreCatalog', 'Explore Catalog'),
        img: b.image?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=500&fit=crop&auto=format',
        link: b.ctaLink || '/shop',
      }))
    : [
        {
          tag: t('home.heroTag', 'Premium Technology'),
          title: `${t('home.heroTitle1', 'Ultimate Audio &')} ${t('home.heroTitle2', 'Smart Wearables')}`,
          sub: t('home.heroSubtitle', 'Experience studio-grade acoustics and high-precision sensors engineered for perfection.'),
          cta1: t('common.shopNow', 'Shop Now'),
          cta2: t('home.exploreCatalog', 'Explore Catalog'),
          img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=500&fit=crop&auto=format',
        },
        {
          tag: t('home.trendingNow', 'Trending Now'),
          title: t('home.heroTitle1', 'Innovation at Your Fingertips'),
          sub: t('home.browseCategoriesSub', 'Explore our curated collection of high-tech gear'),
          cta1: t('common.shopNow', 'Shop Now'),
          cta2: t('common.viewAll', 'View All'),
          img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&h=500&fit=crop&auto=format',
        },
      ];

  // Hero carousel auto advance
  useEffect(() => {
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, [HERO_SLIDES.length]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      toast.success(t('footer.subscribedSuccess', 'Thank you for subscribing!'));
      setNewsletterEmail('');
    }
  };

  // Some legacy brand uploads include a light checkerboard instead of real
  // transparency. Remove only light, low-saturation pixels so the logo mark
  // itself keeps its original colour and sharpness.
  const cleanBrandLogoBackground = (event) => {
    const image = event.currentTarget;
    if (image.dataset.backgroundCleaned || !image.naturalWidth || !image.naturalHeight) return;

    try {
      const maxDimension = 480;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, width, height);

      const pixels = context.getImageData(0, 0, width, height);
      for (let pixel = 0; pixel < pixels.data.length; pixel += 4) {
        const red = pixels.data[pixel];
        const green = pixels.data[pixel + 1];
        const blue = pixels.data[pixel + 2];
        const brightness = (red + green + blue) / 3;
        const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);
        if (brightness > 172 && saturation < 20) pixels.data[pixel + 3] = 0;
      }
      context.putImageData(pixels, 0, 0);
      image.dataset.backgroundCleaned = 'true';
      image.src = canvas.toDataURL('image/png');
    } catch {
      // Cross-origin images without canvas permission continue to render normally.
    }
  };

  const displayCategories = categories.items.length > 0 ? categories.items : [];

  const REVIEWS = [
    { id: 1, name: 'Priya Sharma', loc: 'Mumbai', rating: 5, text: 'ANGADIX is my go-to for everything. Fast delivery, genuine products, and unbeatable prices. Ordered an iPhone and got it in 2 days!', avatar: 'PS' },
    { id: 2, name: 'Rahul Verma', loc: 'Delhi', rating: 5, text: 'The customer support is incredible. Had an issue with my order and it was resolved within an hour. Highly recommend this platform!', avatar: 'RV' },
    { id: 3, name: 'Ananya Patel', loc: 'Bangalore', rating: 4, text: 'Great selection of products. I always find exactly what I am looking for. The app is smooth and checkout is super quick.', avatar: 'AP' },
  ];
  const mixedTrendingProducts = mixProductsByCategory([
    homepage?.trending || [],
    homepage?.bestSellers || [],
    homepage?.recentlyAdded || [],
    homepage?.featured || [],
    homepage?.topRated || [],
  ]);
  return (
    <PageTransition className="samsung-home font-body bg-background text-foreground min-h-screen space-y-12 pb-16">
      
      {/* ── 1. Hero Banner Section ───────────────────────────────────── */}
      <section
        className="hero-section relative overflow-hidden border-b border-border"
      >
        {/* Top gradient overlay to guarantee text/icon contrast for floating transparent navbar */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10 min-h-[360px]">
            <div className="flex-1 space-y-5">
              <Chip variant="accent">{HERO_SLIDES[heroIdx].tag}</Chip>
              <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
                {HERO_SLIDES[heroIdx].title}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-md font-body">
                {HERO_SLIDES[heroIdx].sub}
              </p>
              <div className="flex gap-3 flex-wrap pt-2">
                <Link
                  to="/shop"
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold font-body hover:bg-primary/90 transition-all shadow-md"
                >
                  {HERO_SLIDES[heroIdx].cta1}
                </Link>
                <Link
                  to="/shop"
                  className="border border-primary text-primary px-6 py-3 rounded-lg font-semibold font-body hover:bg-secondary transition-colors"
                >
                  {HERO_SLIDES[heroIdx].cta2}
                </Link>
              </div>
              <div className="flex gap-2 pt-3">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIdx(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === heroIdx ? 'bg-primary w-6' : 'bg-muted w-2 hover:bg-primary/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md">
                <div
                  className="absolute inset-0 rounded-2xl blur-2xl opacity-20"
                  style={{ background: 'var(--primary)' }}
                />
                <img
                  src={HERO_SLIDES[heroIdx].img}
                  alt="Hero product"
                  className="relative rounded-2xl shadow-2xl w-full object-cover h-64 md:h-80 transition-all duration-500"
                />
                <div className="absolute -bottom-4 -right-2 sm:-right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-[#0266C8]/30 dark:border-sky-500/40 rounded-2xl px-5 py-3 shadow-2xl transition-transform hover:scale-105">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[#0266C8]/10 text-[#0266C8] dark:bg-sky-500/20 dark:text-sky-400">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#0a2540] dark:text-slate-200 font-heading">
                        Starting from
                      </p>
                      <p className="font-heading font-extrabold text-[#0266C8] dark:text-sky-400 text-lg sm:text-xl leading-none mt-0.5">
                        ₹2,999
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Service Highlights ─────────────────────────────────────── */}
      <section className="py-8 border-y border-[#BAE6FD] dark:border-slate-800 bg-[#E1F5FE]/60 dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-xl font-bold text-[#0a2540] dark:text-white text-center mb-6">Service Highlights</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', sub: 'Free nationwide delivery and free returns on all orders.' },
              { icon: Shield, title: 'Secure Payment', sub: 'Modern encryption ensures your payment data is protected.' },
              { icon: RefreshCw, title: 'Easy Returns', sub: 'Easy customer-friendly 30-day easy returns and refunds.' },
              { icon: Headphones, title: '24/7 Support', sub: '24/7 outstanding customer support available anytime.' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-white via-[#F0F8FF] to-[#E1F5FE] dark:from-slate-800/90 dark:to-slate-900/90 border border-[#BAE6FD] dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                  <Icon size={20} className="text-[#0266C8] dark:text-sky-400" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-[#0a2540] dark:text-white text-sm">{title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed font-body">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Shop By Category Grid ─────────────────────────────────── */}
      <motion.section {...sectionAnimation} className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHead badge="Browse" title="Shop by Category" sub="Explore our wide range of categories and find what you need." />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayCategories.map((cat, idx) => {
            const categoryImage = typeof cat.image === 'string' ? cat.image : cat.image?.url;
            return (
              <Link
                key={cat._id || idx}
                to={`/shop?category=${cat.slug}`}
                className="group relative isolate min-h-40 sm:min-h-52 overflow-hidden rounded-2xl bg-slate-900 border border-slate-200/70 dark:border-white/10 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#0266C8]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0266C8] focus-visible:ring-offset-2"
              >
                {categoryImage && (
                  <img
                    src={categoryImage}
                    alt={cat.name}
                    className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#031627]/95 via-[#031627]/35 to-[#031627]/5 transition-opacity duration-500 group-hover:from-[#013d79]/95 group-hover:via-[#013d79]/35" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <span className="block font-heading text-base sm:text-lg font-extrabold tracking-tight text-white drop-shadow-md">
                    {cat.name}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200 opacity-0 transition-all duration-300 -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100">
                    Explore collection <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.section>

      {/* ── 4. Flash Sale Section with Live Countdown ────────────────── */}
      <motion.section {...sectionAnimation} className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-none border border-[#BAE6FD] dark:border-sky-500/20 bg-gradient-to-br from-[#E0F2FE] via-[#D0EAFF] to-[#F0F8FF] dark:from-[#061224] dark:via-[#091830] dark:to-[#040914] text-[#0a2540] dark:text-white shadow-xl dark:shadow-[0_25px_60px_-15px_rgba(2,102,200,0.35)] transition-all duration-300">
          {/* Ambient Background Lighting Glows */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0266C8]/15 dark:bg-[#0266C8]/25 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-400/15 dark:bg-sky-400/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-10 lg:p-12">
            {/* Header & Urgency Bar */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10 pb-8 border-b border-[#BAE6FD]/80 dark:border-sky-500/20">
              <div className="space-y-3 max-w-2xl">
                {/* Live Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] uppercase tracking-[0.2em]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <Flame size={13} className="text-rose-500 dark:text-rose-400" />
                  <span>Limited Time Offers</span>
                </div>

                <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#0a2540] dark:text-white leading-tight">
                  Flash Sale Countdown
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-body leading-relaxed">
                  Deep discounts on flagship tech and exclusive gear. Quantities are strictly limited—grab yours before the timer expires.
                </p>

                <div className="pt-2">
                  <Link
                    to="/shop?sort=discount"
                    className="inline-flex items-center gap-2 rounded-none bg-[#0266C8] hover:bg-[#0054A6] text-white px-6 py-3 font-heading font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg dark:shadow-[0_0_20px_rgba(2,102,200,0.4)] dark:hover:shadow-[0_0_30px_rgba(2,102,200,0.7)] border border-sky-400/40 group"
                  >
                    <span>Shop All Flash Deals</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Countdown Timer Block */}
              <div className="flex flex-col items-start lg:items-end gap-2 bg-white/80 dark:bg-[#040c1a]/80 p-5 border border-[#BAE6FD] dark:border-sky-500/25 backdrop-blur-md rounded-none shadow-lg">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#0266C8] dark:text-sky-400 flex items-center gap-1.5">
                  <Clock size={12} className="text-[#0266C8] dark:text-sky-400 animate-pulse" />
                  Offer Expires In
                </span>
                <CountdownTimer variant="sharp" />
              </div>
            </div>

            {/* Flash Sale Product Cards Grid (Compact Sharp Cards: border-radius: 0) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {(homepage?.flashSale?.length > 0 ? homepage.flashSale : homepage?.trending?.slice(0, 4) || []).map((item) => {
                const itemImage = getProductImageUrl(item.images);
                const itemRawImage = getRawProductImageUrl(item.images);
                const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                const finalPrice = hasDiscount ? item.discountPrice : item.price;
                const discountPercent = hasDiscount ? Math.round(((item.price - item.discountPrice) / item.price) * 100) : 0;

                return (
                  <div
                    key={item._id}
                    className="rounded-none bg-white dark:bg-[#050e1c]/95 border border-[#BAE6FD] dark:border-sky-500/20 hover:border-[#0266C8]/50 dark:hover:border-sky-400/60 p-3.5 sm:p-4 flex flex-col justify-between group/card transition-all duration-300 shadow-sm hover:shadow-lg dark:hover:shadow-[0_12px_28px_rgba(2,102,200,0.22)] relative overflow-hidden h-full"
                  >
                    {/* Top Badge Overlay */}
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[9px] font-extrabold uppercase tracking-wider bg-rose-600 text-white font-heading shadow-xs">
                        <Flame size={10} /> HOT DEAL
                      </span>
                      {discountPercent > 0 && (
                        <span className="inline-block px-1.5 py-0.5 rounded-none text-[9px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Image Wrapper (Compact sharp container & transparent image) */}
                    <div className="relative w-full h-36 sm:h-40 p-2 sm:p-3 flex items-center justify-center bg-transparent mb-3 border-b border-[#BAE6FD]/60 dark:border-sky-500/15 rounded-none overflow-hidden">
                      <Link to={`/products/${item.slug}`} className="w-full h-full flex items-center justify-center">
                        <img
                          src={itemImage}
                          alt={item.name}
                          onError={(e) => handleProductImageError(e, itemRawImage)}
                          className="w-full h-full max-h-32 sm:max-h-36 object-contain bg-transparent mix-blend-multiply dark:mix-blend-normal group-hover/card:scale-105 transition-transform duration-500 rounded-none"
                        />
                      </Link>
                    </div>

                    {/* Info & Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5">
                          {typeof item.category === 'object' ? item.category?.name : (item.category || 'SPECIAL EDITION')}
                        </p>
                        <Link to={`/products/${item.slug}`}>
                          <h3 className="font-heading font-bold text-[#0a2540] dark:text-white text-xs sm:text-sm leading-snug line-clamp-2 group-hover/card:text-[#0266C8] dark:group-hover/card:text-sky-300 transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-sky-500/15 flex items-end justify-between gap-1.5">
                        <div>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Flash Price</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-heading font-black text-[#0266C8] dark:text-sky-400 text-base sm:text-lg">
                              ₹{finalPrice.toLocaleString('en-IN')}
                            </span>
                            {hasDiscount && (
                              <span className="text-[11px] text-slate-400 line-through font-body">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setQuickViewProduct(item)}
                          className="px-2.5 py-1.5 rounded-none bg-[#0266C8] hover:bg-[#0054A6] text-white font-heading font-bold text-[10px] uppercase tracking-wider transition-all border border-[#0266C8] shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Eye size={12} />
                          <span>Quick View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 5. Trending Products Grid ─────────────────────────────────── */}
      <motion.section {...sectionAnimation} className="py-16 sm:py-24 bg-white dark:bg-[#1d1d1f] border-b border-slate-100 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400 font-body block mb-2">
                TRENDING
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#0a2540] dark:text-white">
                Trending Products
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-body mt-2">
                Explore the tech items everyone is talking about.
              </p>
            </div>
            <Link to="/shop" className="text-[#0266C8] dark:text-sky-400 text-sm font-semibold font-body inline-flex items-center gap-1 hover:underline">
              <span>{t('common.viewAll', 'See all')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <ProductSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
              {mixedTrendingProducts.map((product) => (
                <PremiumProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ── 6. Best Sellers Section ───────────────────────────────────── */}
      <motion.section {...sectionAnimation} className="py-16 sm:py-24 bg-[#fafafa] dark:bg-[#161617] border-b border-slate-200/50 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400 font-body block mb-2">
                MOST POPULAR
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#0a2540] dark:text-white">
                Best Sellers
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-body mt-2">
                Tried, tested, and loved by our community.
              </p>
            </div>
            <Link to="/shop" className="text-[#0266C8] dark:text-sky-400 text-sm font-semibold font-body inline-flex items-center gap-1 hover:underline">
              <span>{t('common.viewAll', 'See all')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {(homepage?.bestSellers?.length > 0 ? homepage.bestSellers : homepage?.trending?.slice(0, 4) || []).map((product) => (
              <PremiumProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 7. New Arrivals / Recently Added ─────────────────────────── */}
      <motion.section {...sectionAnimation} className="py-16 sm:py-24 bg-white dark:bg-[#1d1d1f] border-b border-slate-100 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400 font-body block mb-2">
                JUST ARRIVED
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#0a2540] dark:text-white">
                New Arrivals
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-body mt-2">
                The latest releases and top-tier technological innovations.
              </p>
            </div>
            <Link to="/shop" className="text-[#0266C8] dark:text-sky-400 text-sm font-semibold font-body inline-flex items-center gap-1 hover:underline">
              <span>{t('common.viewAll', 'See all')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {(homepage?.recentlyAdded?.length > 0 ? homepage.recentlyAdded : homepage?.trending?.slice(0, 4) || []).map((product) => (
              <PremiumProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 8. Featured Showcase Section ────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-[#F0F8FF] via-[#E1F5FE]/40 to-[#F0F8FF] dark:from-[#030712] dark:via-[#09111e] dark:to-[#030712] text-[#0a2540] dark:text-white border-y border-[#BAE6FD] dark:border-slate-800/80 relative overflow-hidden transition-colors duration-300">
        {/* Subtle Ambient Background Lighting Glows */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-[#0266C8]/10 dark:bg-[#0266C8]/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 -right-32 w-[600px] h-[600px] bg-sky-400/10 dark:bg-sky-500/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#0266C8] dark:text-sky-400 mb-2 block">
              Curated Excellence
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-[#0a2540] dark:text-white tracking-tight">
              Spotlight Showcase
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mt-3 font-body font-normal leading-relaxed">
              Handcrafted tech moments and flagship innovations, curated for extraordinary performance.
            </p>
          </div>

          <div className="space-y-16 lg:space-y-24">
            {(
              featuredShowcase && featuredShowcase.length > 0
                ? featuredShowcase
                : (homepage?.featured?.length > 0 ? homepage.featured : homepage?.trending?.slice(0, 2) || [])
            ).map((f, i) => {
              const isAdminShowcase = Boolean(f.title);
              const cardTitle = isAdminShowcase ? f.title : f.name;
              const cardDesc = isAdminShowcase
                ? f.description
                : (f.description || f.shortDescription || 'Experience premium audio quality, sleek ergonomic design, and industry-leading performance.');
              const cardImage = isAdminShowcase
                ? (typeof f.image === 'string' ? f.image : (f.image?.url || getProductImageUrl(f.linkedProduct?.images || f.linkedProduct?.image)))
                : getProductImageUrl(f.images);
              const cardCtaText = isAdminShowcase ? (f.ctaText || 'Shop Now') : 'Shop Now';
              const cardCtaLink = isAdminShowcase
                ? (f.ctaLink || (f.linkedProduct?.slug ? `/products/${f.linkedProduct.slug}` : '/shop'))
                : `/products/${f.slug}`;
              const linkedProd = f.linkedProduct && typeof f.linkedProduct === 'object' && f.linkedProduct.name ? f.linkedProduct : null;

              return (
                <div
                  key={f._id || i}
                  className="group relative rounded-3xl overflow-hidden bg-white/90 dark:bg-slate-900/80 border border-[#BAE6FD] dark:border-slate-800/90 backdrop-blur-xl shadow-xl dark:shadow-2xl transition-all duration-700 hover:border-[#0266C8]/40 dark:hover:border-slate-700 hover:shadow-[#0266C8]/10"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center overflow-hidden">
                    {/* Hero Photography Container (Column 1) */}
                    <div
                      className={`lg:col-span-7 relative min-h-[380px] sm:min-h-[480px] md:min-h-[540px] lg:min-h-[580px] overflow-hidden bg-slate-900 dark:bg-slate-950 ${
                        i % 2 === 1 ? 'lg:order-last' : ''
                      }`}
                    >
                      {/* Background Ambient Blur Fallback */}
                      <div
                        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-125 z-0"
                        style={{ backgroundImage: `url(${cardImage})` }}
                      />
                      
                      {/* Main Full-Cover Photography */}
                      <img
                        src={cardImage}
                        alt={cardTitle}
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=500';
                        }}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out z-10"
                      />

                      {/* Vignette & Gradient Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-15 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30 z-15 pointer-events-none" />

                      {/* Top Floating Kicker Badge */}
                      <div className="absolute top-6 left-6 z-20">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-black/60 backdrop-blur-md text-white border border-white/15 shadow-xl">
                          <Sparkles size={12} className="text-sky-400" />
                          <span>Editor's Choice</span>
                        </span>
                      </div>

                      {/* Floating Glassmorphism Product Spotlight Panel (Overlapping Photography) */}
                      {linkedProd && (
                        <div
                          className="absolute bottom-6 left-6 right-6 sm:right-auto sm:left-6 z-30 bg-white/95 dark:bg-slate-950/90 text-[#0a2540] dark:text-white backdrop-blur-xl border border-[#BAE6FD] dark:border-white/15 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 max-w-sm hover:border-[#0266C8]/60 transition-all group/glass"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={getProductImageUrl(linkedProd.images || linkedProd.image)}
                              alt={linkedProd.name}
                              onError={(e) => handleProductImageError(e, getRawProductImageUrl(linkedProd.images || linkedProd.image))}
                              className="w-12 h-12 rounded-xl object-contain flex-shrink-0 bg-transparent mix-blend-multiply dark:mix-blend-normal group-hover/glass:scale-105 transition-transform"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0266C8] dark:text-sky-400 block truncate">
                                Featured Product
                              </span>
                              <Link
                                to={`/products/${linkedProd.slug || ''}`}
                                className="text-xs font-bold text-[#0a2540] dark:text-white truncate block hover:underline hover:text-[#0266C8] dark:hover:text-sky-300"
                              >
                                {linkedProd.name}
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                  ₹{(linkedProd.discountPrice || linkedProd.salePrice || linkedProd.price || 0).toLocaleString('en-IN')}
                                </span>
                                {linkedProd.discountPrice && linkedProd.discountPrice < linkedProd.price && (
                                  <span className="text-[11px] text-slate-400 line-through">
                                    ₹{linkedProd.price.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setQuickViewProduct(linkedProd)}
                            className="w-9 h-9 rounded-xl bg-[#0266C8]/10 text-[#0266C8] hover:bg-[#0266C8] hover:text-white dark:bg-white/10 dark:text-white dark:hover:bg-[#0266C8] flex items-center justify-center transition-all flex-shrink-0 border border-[#BAE6FD] dark:border-white/10 hover:border-transparent cursor-pointer"
                            title="Quick View Item"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Editorial Content Container (Column 2) */}
                    <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 flex flex-col justify-between self-stretch z-20 space-y-6 bg-white/60 dark:bg-slate-900/40">
                      <div className="space-y-4">
                        <span className="text-xs font-black uppercase tracking-[0.25em] text-[#0266C8] dark:text-sky-400 block">
                          Flagship Highlight
                        </span>
                        <h3 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a2540] dark:text-white tracking-tight leading-[1.1]">
                          {cardTitle}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed font-body font-normal pt-2">
                          {cardDesc}
                        </p>
                      </div>

                      {/* Editorial Actions */}
                      <div className="flex flex-wrap items-center gap-5 pt-4">
                        <Link
                          to={cardCtaLink}
                          className="inline-flex items-center gap-3 bg-[#0266C8] hover:bg-[#0054A6] text-white px-8 py-4 rounded-2xl font-extrabold font-body text-sm transition-all duration-300 shadow-xl shadow-[#0266C8]/25 hover:scale-105 active:scale-95"
                        >
                          <span>{cardCtaText}</span>
                          <ArrowRight size={18} />
                        </Link>
                        {linkedProd ? (
                          <button
                            type="button"
                            onClick={() => setQuickViewProduct(linkedProd)}
                            className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-[#0266C8] dark:hover:text-white font-extrabold text-sm transition-colors group/link py-2 cursor-pointer"
                          >
                            <Eye size={16} className="text-[#0266C8] dark:text-sky-400 group-hover/link:text-[#0054A6] dark:group-hover/link:text-sky-300 transition-colors" />
                            <span>Quick View Product</span>
                            <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                          </button>
                        ) : !isAdminShowcase && (
                          <button
                            type="button"
                            onClick={() => setQuickViewProduct(f)}
                            className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-[#0266C8] dark:hover:text-white font-extrabold text-sm transition-colors group/link py-2 cursor-pointer"
                          >
                            <Eye size={16} className="text-[#0266C8] dark:text-sky-400 group-hover/link:text-[#0054A6] dark:group-hover/link:text-sky-300 transition-colors" />
                            <span>Quick View</span>
                            <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 9. AI Recommended For You ───────────────────────────────────── */}
      <motion.section {...sectionAnimation} className="py-16 sm:py-24 bg-[#fafafa] dark:bg-[#161617] border-y border-slate-200/50 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400 font-body block mb-2">
                CURATED FOR YOU
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#0a2540] dark:text-white">
                AI Recommended For You
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-body mt-2">
                Tailored suggestions based on your personal taste and browsing.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAiScroll('left')}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-xs"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => handleAiScroll('right')}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-xs"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
              <Link to="/shop" className="text-[#0266C8] dark:text-sky-400 text-sm font-semibold font-body inline-flex items-center gap-1 hover:underline ml-2">
                <span>{t('common.viewAll', 'See all')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div
            ref={aiScrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-2 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {(
              (isAuthenticated && recommendations?.recommendedForYou?.length > 0
                ? recommendations.recommendedForYou
                : homepage?.topRated?.length > 0
                ? homepage.topRated
                : homepage?.trending?.slice(0, 8) || []
              )
            ).map((product) => (
              <div key={product._id} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
                <PremiumProductCard product={product} onQuickView={setQuickViewProduct} />
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Recently Viewed Section ───────────────────────────────────── */}
      <RecentlyViewed onQuickView={setQuickViewProduct} />

      {/* ── 10. Featured Brands Grid ──────────────────────────────────── */}
      <motion.section {...sectionAnimation} className="brand-showcase py-16 sm:py-20 bg-[#E1F5FE]/60 dark:bg-slate-900/60 border-y border-[#BAE6FD] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead badge="Partners" title="Top Featured Brands" sub="Shop genuine products directly from official brand partners." />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {(brands.items.length > 0
              ? brands.items
              : ['Apple', 'Samsung', 'Sony', 'Nike', 'Dell', 'Bose'].map((b) => ({ _id: b, name: b }))
            ).map((brand, idx) => {
              const logoUrl = typeof brand.logo === 'string'
                ? brand.logo
                : (brand.logo?.url || (typeof brand.image === 'string' ? brand.image : brand.image?.url));
              return (
                <Link
                  key={brand._id || idx}
                  to={brand.slug ? `/shop?brand=${brand.slug}` : '/shop'}
                  className="brand-showcase__card group relative flex min-h-[132px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#0266C8]/50 hover:shadow-xl hover:shadow-[#0266C8]/10 dark:border-white/10 dark:bg-slate-900/90"
                >
                  <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#0266C8]/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={brand.name}
                      crossOrigin="anonymous"
                      onLoad={cleanBrandLogoBackground}
                      onError={(event) => { event.currentTarget.style.display = 'none'; }}
                      className="h-14 w-full max-w-[150px] object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <span className="font-heading text-lg font-extrabold text-[#0a2540] dark:text-white">{brand.name}</span>
                  )}
                  <span className="mt-3 max-w-full truncate font-body text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 transition-colors group-hover:text-[#0266C8] dark:text-slate-400 dark:group-hover:text-sky-400">
                    {logoUrl ? brand.name : 'Featured Partner'}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ── 11. Customer Reviews Section ──────────────────────────────── */}
      <motion.section {...sectionAnimation} className="py-8 max-w-7xl mx-auto px-4">
        <SectionHead badge="Testimonials" title="Customer Reviews" sub="See what verified buyers are saying about their shopping experience." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div key={rev.id} className="bg-[#E1F5FE] dark:bg-slate-800/90 border border-[#BAE6FD] dark:border-slate-700/80 rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center text-amber-400 gap-1">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <p className="text-sm text-[#0a2540] dark:text-slate-200 font-body leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-[#BAE6FD] dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-[#0266C8]/10 text-[#0266C8] dark:text-sky-400 font-heading font-extrabold flex items-center justify-center">
                  {rev.avatar}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#0a2540] dark:text-white">{rev.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-body">{rev.loc}, Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── 12. Newsletter Section ────────────────────────────────────── */}
      <motion.section {...sectionAnimation} className="py-8 max-w-7xl mx-auto px-4">
        <div className="rounded-3xl p-8 md:p-12 text-center shadow-xl border border-[#BAE6FD] dark:border-slate-800 bg-gradient-to-br from-[#E1F5FE] via-[#E0F2FE]/70 to-[#F0F8FF] dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 transition-all duration-300">
          <div className="max-w-xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold font-heading bg-[#0266C8]/10 text-[#0266C8] dark:bg-sky-500/20 dark:text-sky-300">
              <Mail size={13} /> Exclusive Updates
            </span>
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-[#0a2540] dark:text-white tracking-tight">
              Stay Updated with Exclusive Deals
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-body leading-relaxed">
              Subscribe to get notified about flash sales, new flagship arrivals, and secret discount coupons directly in your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 pt-3">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 text-[#0a2540] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-body text-sm border border-[#BAE6FD] dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0266C8] dark:focus:ring-sky-500 shadow-xs transition-all"
              />
              <button
                type="submit"
                className="bg-[#0266C8] hover:bg-[#0054A6] text-white px-7 py-3.5 rounded-xl font-bold font-body transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm shrink-0"
              >
                <Send size={16} />
                <span>Subscribe</span>
              </button>
            </form>
          </div>
        </div>
      </motion.section>

      {/* Quick View Modal Trigger */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </PageTransition>
  );
};
