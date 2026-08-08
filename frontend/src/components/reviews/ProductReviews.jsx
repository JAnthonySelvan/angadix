import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  ThumbsUp,
  Plus,
  X,
  Upload,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchProductReviews,
  fetchReviewSummary,
  createProductReview,
  deleteProductReview,
} from '../../features/reviews/reviewThunks';
import {
  selectReviews,
  selectReviewSummary,
  selectReviewPagination,
  selectIsReviewLoading,
  selectIsReviewSubmitting,
} from '../../features/reviews/reviewSlice';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';

export const ProductReviews = ({ productId }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const reviews = useAppSelector(selectReviews);
  const summary = useAppSelector(selectReviewSummary);
  const pagination = useAppSelector(selectReviewPagination);
  const isLoading = useAppSelector(selectIsReviewLoading);
  const isSubmitting = useAppSelector(selectIsReviewSubmitting);

  const [sort, setSort] = useState('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductReviews({ productId, page: 1, sort }));
      dispatch(fetchReviewSummary(productId));
    }
  }, [dispatch, productId, sort]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating || !title.trim() || !comment.trim()) {
      toast.error('Please fill in all required review fields.');
      return;
    }

    const images = imageUrl.trim() ? [{ url: imageUrl.trim() }] : [];

    const result = await dispatch(
      createProductReview({
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images,
      })
    );

    if (createProductReview.fulfilled.match(result)) {
      toast.success(t('reviews.successMessage', 'Review submitted successfully!'));
      setIsModalOpen(false);
      setTitle('');
      setComment('');
      setImageUrl('');
      setRating(5);
      dispatch(fetchReviewSummary(productId));
      dispatch(fetchProductReviews({ productId, page: 1, sort }));
    } else {
      toast.error(result.payload || 'Failed to submit review.');
    }
  };

  const totalReviewsCount = summary.count || 0;

  return (
    <section className="space-y-8 pt-8 border-t border-slate-200/80 dark:border-slate-800">
      {/* Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-primary-600 dark:text-primary-400" size={24} />
            <span>{t('reviews.title', 'Customer Reviews & Ratings')}</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {t('reviews.subTitle', 'Verified feedback and ratings from authentic buyers')}
          </p>
        </div>

        {isAuthenticated ? (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            className="rounded-2xl font-bold flex items-center gap-2 self-start sm:self-center"
          >
            <Plus size={16} />
            <span>{t('reviews.writeReview', 'Write a Review')}</span>
          </Button>
        ) : (
          <p className="text-xs text-slate-400 font-semibold italic">
            {t('reviews.loginRequired', 'Log in to write a product review')}
          </p>
        )}
      </div>

      {/* Rating Summary Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Overall Score */}
        <div className="md:col-span-4 text-center md:border-r md:border-slate-100 md:dark:border-slate-800 md:pr-6">
          <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {summary.average.toFixed(1)}
          </div>

          <div className="flex items-center justify-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={
                  star <= Math.round(summary.average)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200 dark:text-slate-700'
                }
              />
            ))}
          </div>

          <p className="text-xs font-bold text-slate-500">
            {totalReviewsCount} {t('reviews.totalReviews', 'Customer Reviews')}
          </p>
        </div>

        {/* Rating Star Distribution Bar Chart */}
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.distribution[star] || 0;
            const pct = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <span>{star}</span>
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                </span>

                <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-10 text-right font-semibold text-slate-400">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {t('reviews.allReviews', 'Reviews List')} ({reviews.length})
        </span>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 border border-transparent focus:outline-none"
        >
          <option value="newest">{t('reviews.sortNewest', 'Newest First')}</option>
          <option value="highest">{t('reviews.sortHighest', 'Highest Rated')}</option>
          <option value="lowest">{t('reviews.sortLowest', 'Lowest Rated')}</option>
        </select>
      </div>

      {/* Reviews List Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400 font-semibold">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-3">
          <MessageSquare size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            {t('reviews.noReviews', 'No reviews yet for this product.')}
          </p>
          <p className="text-xs text-slate-400">
            Be the first to share your experience with other shoppers!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Author & Rating Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 font-extrabold flex items-center justify-center text-sm shadow-inner">
                      {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {rev.user?.name || 'Customer'}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60">
                            <CheckCircle2 size={11} />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Title & Comment Body */}
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {rev.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rev.comment}
                </p>

                {/* Review Images */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {rev.images.map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt="Customer review photo"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  {t('reviews.writeReview', 'Write a Review')}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating Input Selector */}
                <div className="space-y-1.5 text-center">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    {t('reviews.yourRating', 'Your Rating')}
                  </label>
                  <div className="flex items-center justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          size={28}
                          className={
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label={t('reviews.reviewTitle', 'Review Headline')}
                  placeholder="e.g. Excellent build quality & acoustic range!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {t('reviews.reviewComment', 'Detailed Review')}
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us what you loved or how this product performed..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <Input
                  label={t('reviews.imageUrl', 'Photo URL (Optional)')}
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    isDisabled={isSubmitting}
                  >
                    {t('common.cancel', 'Cancel')}
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                  >
                    {t('reviews.submit', 'Submit Review')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
