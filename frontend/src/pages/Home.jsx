import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ShoppingCart, Heart, Bell, User, Menu, X,
  Truck, ShieldCheck, RefreshCw, Headphones, Star, ArrowRight,
  Play, ChevronLeft, ChevronRight, MapPin, Mail, Globe,
  Instagram, Twitter, Facebook, Youtube, Linkedin, CheckCircle,
  Package, Award, Clock, Smartphone, Monitor, Laptop, Shirt,
  Home as HomeIcon, Leaf, Dumbbell, Book, Car, PawPrint, Baby, Sparkles,
  Flame, Gift, CreditCard, RotateCcw, Apple, QrCode, Send,
  Eye, TrendingUp, Cpu, Shield, Zap, Sparkle, CheckCircle2
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchHomepageProducts, fetchCategories, fetchBrands, fetchRecommendedForYou } from '../features/products/productThunks';
import { ProductCard } from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/ProductSkeleton';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { RecentlyViewed } from '../components/common/RecentlyViewed';
import { getProductImageUrl } from '../utils/orderHelpers';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-2">{title}</h2>
      {sub && <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm font-body">{sub}</p>}
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

export const Home = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { homepage, categories, brands, recommendations, loading } = useAppSelector((state) => state.products);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [dbBanners, setDbBanners] = useState([]);

  useEffect(() => {
    dispatch(fetchHomepageProducts());
    dispatch(fetchCategories());
    dispatch(fetchBrands());
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
        tag: b.subtitle || t('home.heroTag', 'Next-Gen Technology'),
        title: b.title,
        sub: b.subtitle || t('home.heroSubtitle', 'Experience studio-grade acoustics and high-precision sensors engineered for perfection.'),
        cta1: b.ctaText || t('common.shopNow', 'Shop Now'),
        cta2: t('home.exploreCatalog', 'Explore Catalog'),
        img: b.image?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=500&fit=crop&auto=format',
        link: b.ctaLink || '/shop',
      }))
    : [
        {
          tag: t('home.heroTag', 'Next-Gen Technology'),
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

  const staticCategoryIcons = [
    { icon: Monitor, label: 'Electronics' },
    { icon: Shirt, label: 'Fashion' },
    { icon: Smartphone, label: 'Mobiles' },
    { icon: Laptop, label: 'Laptops' },
    { icon: HomeIcon, label: 'Home & Kitchen' },
    { icon: Leaf, label: 'Beauty' },
    { icon: Package, label: 'Grocery' },
    { icon: Dumbbell, label: 'Sports' },
    { icon: Book, label: 'Books' },
    { icon: Baby, label: 'Toys' },
    { icon: Car, label: 'Automotive' },
    { icon: PawPrint, label: 'Pet Care' },
  ];

  const displayCategories = categories.items.length > 0
    ? categories.items.map((cat, idx) => ({
        ...cat,
        icon: staticCategoryIcons[idx % staticCategoryIcons.length].icon,
      }))
    : staticCategoryIcons.map((c) => ({ _id: c.label, name: c.label, slug: c.label.toLowerCase().replace(/ /g, '-'), ...c }));

  const REVIEWS = [
    { id: 1, name: 'Priya Sharma', loc: 'Mumbai', rating: 5, text: 'ANGADIX is my go-to for everything. Fast delivery, genuine products, and unbeatable prices. Ordered an iPhone and got it in 2 days!', avatar: 'PS' },
    { id: 2, name: 'Rahul Verma', loc: 'Delhi', rating: 5, text: 'The customer support is incredible. Had an issue with my order and it was resolved within an hour. Highly recommend this platform!', avatar: 'RV' },
    { id: 3, name: 'Ananya Patel', loc: 'Bangalore', rating: 4, text: 'Great selection of products. I always find exactly what I am looking for. The app is smooth and checkout is super quick.', avatar: 'AP' },
  ];

  return (
    <div className="font-body bg-background text-foreground min-h-screen space-y-12 pb-16">
      
      {/* ── 1. Hero Banner Section ───────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-10 md:py-16 border-b border-border"
        style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--background) 55%, var(--muted) 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4">
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
      <section className="py-8 max-w-7xl mx-auto px-4">
        <SectionHead badge="Browse" title="Shop by Category" sub="Explore our wide range of categories and find what you need." />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {displayCategories.map((cat, idx) => {
            const IconComp = cat.icon || Monitor;
            return (
              <Link
                key={cat._id || idx}
                to={`/shop?category=${cat.slug}`}
                className="bg-gradient-to-br from-white via-[#F0F8FF] to-[#E1F5FE] dark:from-slate-800/90 dark:to-slate-900/90 border border-[#BAE6FD] dark:border-slate-700/80 rounded-xl p-4 flex flex-col items-center gap-2.5 hover:from-white hover:to-[#D8EEFE] hover:border-[#0266C8]/40 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-slate-700 group-hover:bg-[#0266C8]/10 flex items-center justify-center transition-colors shadow-xs">
                  <IconComp size={22} className="text-[#0266C8] dark:text-sky-400" />
                </div>
                <span className="font-body font-bold text-[#0a2540] dark:text-white text-xs text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 4. Flash Sale Section with Live Countdown ────────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-4">
        <div className="rounded-3xl overflow-hidden shadow-xl border border-sky-200/80 dark:border-slate-800/80 bg-gradient-to-br from-[#E0F2FE] via-[#BAE6FD] to-[#F0F9FF] dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 transition-all duration-300">
          <div className="p-6 md:p-10 text-slate-900 dark:text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <Chip variant="primary">
                  <Flame size={12} className="inline mr-1" /> Limited Time Deals
                </Chip>
                <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0a2540] dark:text-white mt-2 tracking-tight">
                  Flash Sale Countdown
                </h2>
                <p className="text-slate-700 dark:text-slate-300 text-sm mt-1 font-body">
                  Premium product deals, heavy discounts, and flash promotions.
                </p>
                <Link
                  to="/shop?sort=discount"
                  className="mt-4 inline-block bg-[#0266C8] hover:bg-[#0054A6] text-white px-6 py-2.5 rounded-xl text-sm font-bold font-body transition-all shadow-md hover:shadow-lg"
                >
                  Shop Flash Sale Now
                </Link>
              </div>

              {/* Countdown Component */}
              <div className="flex items-center gap-3">
                <CountdownTimer />
              </div>
            </div>

            {/* Flash Sale Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(homepage?.flashSale?.length > 0 ? homepage.flashSale : homepage?.trending?.slice(0, 3) || []).map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl p-4 flex gap-3.5 items-center bg-white/95 dark:bg-slate-800/90 text-slate-900 dark:text-white border border-white/80 dark:border-slate-700/60 shadow-md hover:shadow-xl transition-all"
                >
                  <img
                    src={getProductImageUrl(item.images)}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400';
                    }}
                    className="w-20 h-20 object-cover rounded-xl shrink-0 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-500 text-white font-heading shadow-xs">
                      HOT DEAL
                    </span>
                    <p className="font-heading font-bold text-slate-900 dark:text-white text-sm mt-1 truncate">{item.name}</p>
                    <p className="font-heading font-extrabold text-[#0266C8] dark:text-sky-400 text-base">
                      ₹{(item.discountPrice || item.price || 19999).toLocaleString('en-IN')}
                    </p>
                    <button
                      onClick={() => setQuickViewProduct(item)}
                      className="mt-2 w-full bg-[#0266C8] hover:bg-[#0054A6] text-white rounded-lg py-1.5 text-xs font-bold font-body transition-colors shadow-xs"
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Trending Products Grid ─────────────────────────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Chip variant="primary">
              <TrendingUp size={12} className="inline mr-1" /> Trending
            </Chip>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-1">Trending Products</h2>
          </div>
          <Link to="/shop" className="text-primary text-sm font-semibold font-body flex items-center gap-1 hover:text-primary/80">
            See all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <ProductSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {(homepage?.trending?.length > 0 ? homepage.trending : []).slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        )}
      </section>

      {/* ── 6. Best Sellers Section ───────────────────────────────────── */}
      <section className="py-12 bg-secondary/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Chip variant="accent">
                <Award size={12} className="inline mr-1" /> Best Sellers
              </Chip>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-1">Best Sellers</h2>
            </div>
            <Link to="/shop" className="text-primary text-sm font-semibold font-body flex items-center gap-1 hover:text-primary/80">
              See all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {(homepage?.bestSellers?.length > 0 ? homepage.bestSellers : homepage?.trending?.slice(0, 4) || []).map((product) => (
              <ProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. New Arrivals / Recently Added ─────────────────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Chip variant="accent">
              <Sparkles size={12} className="inline mr-1" /> Just In
            </Chip>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-1">New Arrivals</h2>
          </div>
          <Link to="/shop" className="text-primary text-sm font-semibold font-body flex items-center gap-1 hover:text-primary/80">
            See all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {(homepage?.recentlyAdded?.length > 0 ? homepage.recentlyAdded : homepage?.trending?.slice(0, 4) || []).map((product) => (
            <ProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      {/* ── 8. Featured Products Banner ────────────────────────────────── */}
      <section className="py-12 bg-[#E1F5FE]/60 dark:bg-slate-900/60 border-y border-[#BAE6FD] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHead badge="Featured" title="Featured Showcase" sub="Handpicked premium selections curated by our tech experts." />
          <div className="space-y-6">
            {(homepage?.featured?.length > 0 ? homepage.featured : homepage?.trending?.slice(0, 2) || []).map((f, i) => (
              <div
                key={f._id || i}
                className={`bg-[#E1F5FE] dark:bg-slate-800/90 border border-[#BAE6FD] dark:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } hover:shadow-lg transition-shadow`}
              >
                <div className="md:w-1/2 relative overflow-hidden bg-[#D8EEFE]/60 dark:bg-slate-900/40">
                  <img
                    src={getProductImageUrl(f.images)}
                    alt={f.name}
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=500';
                    }}
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Chip variant="primary">Editor's Choice</Chip>
                  </div>
                </div>
                <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-[#0a2540] dark:text-white mb-3">{f.name}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-body">
                    {f.description || f.shortDescription || 'Experience premium audio quality, sleek ergonomic design, and industry-leading performance.'}
                  </p>
                  <div className="flex gap-3">
                    <Link
                      to={`/products/${f.slug}`}
                      className="bg-[#0266C8] text-white px-6 py-2.5 rounded-lg font-bold font-body hover:bg-[#0054A6] transition-all text-sm shadow-md"
                    >
                      Shop Now
                    </Link>
                    <button
                      onClick={() => setQuickViewProduct(f)}
                      className="border border-[#0266C8] text-[#0266C8] dark:text-sky-400 bg-white/80 dark:bg-slate-800 px-5 py-2.5 rounded-lg font-bold font-body hover:bg-[#0266C8] hover:text-white transition-colors text-sm"
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. AI Recommended For You ───────────────────────────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Chip variant="accent">
              <Cpu size={12} className="inline mr-1" /> AI Powered
            </Chip>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0a2540] dark:text-white mt-1">AI Recommended For You</h2>
          </div>
          <Link to="/shop" className="text-[#0266C8] dark:text-sky-400 text-sm font-bold font-body flex items-center gap-1 hover:underline">
            See all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {(
            (isAuthenticated && recommendations?.recommendedForYou?.length > 0
              ? recommendations.recommendedForYou
              : homepage?.topRated?.length > 0
              ? homepage.topRated
              : homepage?.trending?.slice(0, 4) || []
            )
          ).map((product) => (
            <ProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      {/* ── Recently Viewed Section ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4">
        <RecentlyViewed onQuickView={setQuickViewProduct} />
      </div>

      {/* ── 10. Featured Brands Grid ──────────────────────────────────── */}
      <section className="py-12 bg-[#E1F5FE]/60 dark:bg-slate-900/60 border-y border-[#BAE6FD] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHead badge="Partners" title="Top Featured Brands" sub="Shop genuine products directly from official brand partners." />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {(brands.items.length > 0
              ? brands.items
              : ['Apple', 'Samsung', 'Sony', 'Nike', 'Dell', 'Bose'].map((b) => ({ _id: b, name: b }))
            ).map((brand, idx) => (
              <div
                key={brand._id || idx}
                className="bg-[#E1F5FE] dark:bg-slate-800/90 border border-[#BAE6FD] dark:border-slate-700/80 rounded-xl p-5 flex items-center justify-center text-center font-heading font-extrabold text-[#0a2540] dark:text-white text-sm hover:bg-[#D8EEFE] hover:border-[#0266C8]/40 transition-all shadow-sm"
              >
                {brand.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. Customer Reviews Section ──────────────────────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-4">
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
      </section>

      {/* ── 12. Newsletter Section ────────────────────────────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-4">
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
      </section>

      {/* Quick View Modal Trigger */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
};
