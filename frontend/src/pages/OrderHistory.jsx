import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Calendar,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Download,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchMyOrders, downloadInvoice } from '../features/checkout/orderThunks';
import { selectMyOrders } from '../features/checkout/orderSlice';
import { triggerInvoiceDownload } from '../utils/invoiceFile';
import { isInvoiceAvailable, getProductImageUrl } from '../utils/orderHelpers';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export const OrderHistory = () => {
  const dispatch = useAppDispatch();
  const { items: orders, pagination, loading, error } = useAppSelector(selectMyOrders);
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders({ page, limit: 10 }));
  }, [dispatch, page]);

  const handleDownloadInvoice = async (ord) => {
    if (downloadingId) return;
    setDownloadingId(ord._id);
    try {
      const res = await dispatch(downloadInvoice(ord._id)).unwrap();
      triggerInvoiceDownload(res.blob, ord.orderNumber);
      toast.success('Invoice downloaded successfully.');
    } catch (err) {
      toast.error(err || 'Invoice is not available until payment is confirmed.');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="info">Confirmed</Badge>;
      case 'packed':
      case 'shipped':
        return <Badge variant="warning">{status === 'packed' ? 'Packed' : 'Shipped'}</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'cancelled':
      case 'returned':
      case 'refunded':
        return <Badge variant="error" className="capitalize">{status}</Badge>;
      default:
        return <Badge variant="slate">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/30">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              My Orders
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Track parcel delivery status, review order history, or request cancellations
            </p>
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          <Skeleton height={140} className="rounded-3xl" />
          <Skeleton height={140} className="rounded-3xl" />
          <Skeleton height={140} className="rounded-3xl" />
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="neu-card p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-center space-y-5 max-w-lg mx-auto shadow-xl">
          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Package size={44} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              No Orders Found
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't placed any orders with Angadix yet. Start exploring our catalog!
            </p>
          </div>
          <Link to="/shop">
            <Button variant="primary" size="md" className="rounded-xl font-bold">
              <span>Explore Shop Catalog</span>
              <ArrowRight size={16} className="ml-1.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Order Cards List */}
      {!loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((ord) => {
            const formattedDate = new Date(ord.createdAt).toLocaleDateString(
              'en-IN',
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }
            );

            const displayItems = ord.items.slice(0, 3);

            return (
              <motion.div
                key={ord._id}
                whileHover={{ scale: 1.005 }}
                className="neu-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4 shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Card Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      #{ord.orderNumber}
                    </span>
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar size={13} />
                      {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(ord.orderStatus)}
                    <Badge variant="slate" size="sm">
                      <span className="uppercase">{ord.paymentMethod}</span>
                    </Badge>
                  </div>
                </div>

                {/* Card Middle Content */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Thumbnail Avatar Stack */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3 overflow-hidden">
                      {displayItems.map((item, idx) => (
                        <img
                          key={idx}
                          src={getProductImageUrl(item.product?.images || item.image)}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&auto=format';
                          }}
                          className="inline-block h-12 w-12 rounded-xl object-cover ring-2 ring-white dark:ring-slate-900 border border-slate-200 dark:border-slate-700"
                          loading="lazy"
                        />
                      ))}
                    </div>

                    <div className="text-xs">
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
                        {ord.items[0]?.name}
                        {ord.items.length > 1 ? ` & ${ord.items.length - 1} more` : ''}
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        Total Items: {ord.items.reduce((s, i) => s + i.quantity, 0)}
                      </p>
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right mr-2">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Total Amount
                      </span>
                      <span className="text-lg font-black text-primary-600 dark:text-primary-400">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isInvoiceAvailable(ord) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={downloadingId === ord._id}
                          isDisabled={downloadingId === ord._id}
                          onClick={() => handleDownloadInvoice(ord)}
                          title="Download Invoice"
                          className="rounded-xl font-bold p-2.5 text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
                        >
                          <Download size={15} />
                        </Button>
                      )}

                      <Link to={`/orders/${ord._id}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-xl font-bold flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ChevronRight size={14} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500">
            Page <span className="font-extrabold text-slate-900 dark:text-white">{pagination.page}</span> of{' '}
            <span className="font-extrabold text-slate-900 dark:text-white">{pagination.totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              isDisabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl font-bold"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              isDisabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl font-bold"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
