import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, Building2, ChevronRight, Flame, Grid2X2, Sparkles, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchBrands, fetchCategories, fetchHomepageProducts } from '../features/products/productThunks';
import { ProductCard } from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/ProductSkeleton';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { PageTransition } from '../components/common/PageTransition';

const pageConfig = {
  categories: { eyebrow: 'CURATED DISCOVERY', title: 'Shop every category', description: 'Thoughtfully organized collections, ready for however you want to shop today.', icon: Grid2X2, cta: 'Explore all products' },
  brands: { eyebrow: 'AUTHENTIC BRANDS', title: 'Shop by brand', description: 'Explore trusted names and discover your next everyday favourite.', icon: Building2, cta: 'Browse the full store' },
  bestSellers: { eyebrow: 'CUSTOMER FAVOURITES', title: 'Best sellers, chosen by you', description: 'The products customers keep coming back for — highly rated, loved and in demand.', icon: Sparkles, cta: 'View all products' },
  flashSale: { eyebrow: 'LIMITED-TIME PRICES', title: 'Flash sale', description: 'Exceptional picks and exciting prices. Grab them while they are still here.', icon: Flame, cta: 'Shop all deals' },
};

const EmptyState = ({ label }) => (
  <div className="rounded-2xl border border-dashed border-[#BAE6FD] bg-white p-12 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
    {label} <Link className="text-primary-600 hover:underline" to="/shop">Browse the store</Link>
  </div>
);

export const BrowseCollection = ({ type }) => {
  const dispatch = useAppDispatch();
  const { categories, brands, homepage } = useAppSelector((state) => state.products);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const config = pageConfig[type];
  const Icon = config.icon;
  const isDirectory = type === 'categories' || type === 'brands';
  const directoryItems = type === 'categories' ? categories.items : brands.items;
  const isLoading = isDirectory ? (type === 'categories' ? categories.loading : brands.loading) : homepage.loading;
  const products = useMemo(() => {
    const primary = homepage?.[type] || [];
    return primary.length ? primary : (homepage?.trending || []);
  }, [homepage, type]);

  useEffect(() => {
    if (type === 'categories') dispatch(fetchCategories());
    if (type === 'brands') dispatch(fetchBrands());
    if (!isDirectory) dispatch(fetchHomepageProducts());
  }, [dispatch, type, isDirectory]);

  return (
    <PageTransition className="min-h-screen bg-[#f0f8ff] dark:bg-[#0A0F1D] pb-16 font-body">
      <section className="relative overflow-hidden border-b border-[#BAE6FD] dark:border-slate-800 bg-gradient-to-br from-[#0266C8] via-[#0877d9] to-[#0a2540]">
        <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20"><div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-sky-100"><Icon size={14} /> {config.eyebrow}</div>
          <h1 className="mt-5 font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-white">{config.title}</h1>
          <p className="mt-4 max-w-xl text-sm md:text-base leading-7 text-sky-100">{config.description}</p>
          <Link to="/shop" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-[#0266C8] shadow-lg transition-transform hover:-translate-y-0.5">{config.cta}<ArrowRight size={15} /></Link>
        </div></div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {isDirectory ? <>
          <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-bold text-primary-600">DISCOVER MORE</p><h2 className="mt-1 font-heading text-2xl font-extrabold text-[#0a2540] dark:text-white">Browse the collection</h2></div><span className="hidden sm:block text-xs font-semibold text-slate-500 dark:text-slate-400">{directoryItems.length} {type === 'categories' ? 'categories' : 'brands'}</span></div>
          {isLoading ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl bg-white dark:bg-slate-800" />)}</div> : directoryItems.length ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{directoryItems.map((item) => {
            const imageUrl = typeof item.logo === 'string'
              ? item.logo
              : (item.logo?.url || (typeof item.image === 'string' ? item.image : item.image?.url));
            return (
              <Link key={item._id} to={`/shop?${type === 'categories' ? 'category' : 'brand'}=${item.slug}`} className="group relative overflow-hidden rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-[0_8px_24px_rgba(2,102,200,0.07)] transition-all hover:-translate-y-1 hover:border-primary-300 hover:shadow-[0_16px_32px_rgba(2,102,200,0.15)] dark:border-slate-800 dark:bg-slate-900">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-sky-50 dark:bg-sky-950/30" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#E1F5FE] text-primary-600 dark:bg-sky-950 dark:text-sky-300 overflow-hidden border border-sky-100 dark:border-sky-900/50 p-1">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="h-full w-full object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}
                  <div className={`flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                    {type === 'categories' ? <Tag size={20} /> : <Building2 size={20} />}
                  </div>
                </div>
                <p className="relative mt-5 text-sm font-extrabold text-[#0a2540] dark:text-white">{item.name}</p>
                <span className="relative mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary-600">Shop now <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            );
          })}</div> : <EmptyState label={type === 'categories' ? 'Categories are being curated.' : 'Brands are being curated.'} />}
        </> : <>
          <div className="mb-6 flex items-center gap-2 text-xs font-extrabold text-primary-600"><BadgePercent size={15} /> HANDPICKED FOR YOU</div>
          {isLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"><ProductSkeleton count={8} /></div> : products.length ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{products.map((product) => <ProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} />)}</div> : <EmptyState label="Fresh products are on their way." />}
        </>}
      </main>
      <QuickViewModal product={quickViewProduct} isOpen={Boolean(quickViewProduct)} onClose={() => setQuickViewProduct(null)} />
    </PageTransition>
  );
};
