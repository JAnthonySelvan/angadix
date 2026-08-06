import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchProductBySlug } from '../features/products/productThunks';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist, selectIsInWishlist } from '../features/wishlist/wishlistSlice';
import toast from 'react-hot-toast';

export const ProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useAppDispatch();

  const { data: product, loading, error } = useAppSelector(
    (state) => state.products.selectedProduct
  );
  const isInWishlist = useAppSelector(selectIsInWishlist(product?._id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
  }, [slug, dispatch]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-bold text-sm">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Product Not Found
        </h2>
        <p className="text-xs text-slate-500">{error || 'The requested product slug does not exist.'}</p>
        <Link to="/shop" className="inline-block px-4 py-2 bg-primary-600 text-white font-bold text-xs rounded-xl">
          Return to Shop
        </Link>
      </div>
    );
  }

  const {
    name,
    description,
    shortDescription,
    price,
    discountPrice,
    currency = 'INR',
    stock = 10,
    images = [],
    ratingsAverage = 4.8,
    ratingsCount = 42,
    category,
    brand,
    specifications = [],
    tags = [],
  } = product;

  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const displayPrice = (discountPrice || price).toLocaleString('en-IN');
  const originalPrice = discountPrice ? price.toLocaleString('en-IN') : null;

  const allImages = images.length > 0
    ? images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'];

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    toast.success(`Added ${quantity} x "${name}" to Cart!`);
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
    toast.success(isInWishlist ? 'Removed from Wishlist' : 'Saved to Wishlist!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors">
        <ArrowLeft size={16} />
        <span>Back to Shop</span>
      </Link>

      <div className="neu-card p-6 sm:p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="w-full h-80 sm:h-96 rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-6 flex items-center justify-center border border-slate-100 dark:border-slate-800">
              <img
                src={allImages[selectedImage]}
                alt={name}
                className="max-h-full max-w-full object-contain drop-shadow-xl"
              />
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                      selectedImage === idx
                        ? 'border-primary-600 scale-105 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Brand */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full">
                  {category?.name || 'Category'}
                </span>
                {brand && (
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {brand.name}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(ratingsAverage) ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {ratingsAverage.toFixed(1)} ({ratingsCount} verified reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {currencySymbol}{displayPrice}
                </span>
                {originalPrice && (
                  <span className="text-lg font-semibold text-slate-400 line-through">
                    {currencySymbol}{originalPrice}
                  </span>
                )}
                {discountPrice && (
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                    SAVE {currencySymbol}{(price - discountPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                {description}
              </p>

              {/* Specifications */}
              {specifications.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Technical Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {specifications.map((spec, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-medium">{spec.key}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2.5 font-bold text-slate-600 dark:text-slate-300"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-sm text-slate-800 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    className="px-3 py-2.5 font-bold text-slate-600 dark:text-slate-300"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingBag size={18} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleWishlist}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isInWishlist
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Heart size={18} className={isInWishlist ? 'fill-white' : ''} />
                </button>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center">
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <Truck size={15} className="text-primary-500" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <ShieldCheck size={15} className="text-emerald-500" />
                  <span>Original Warranty</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <RefreshCw size={15} className="text-indigo-500" />
                  <span>30-Day Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
