import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Order } from '../models/Order.js';
import { getOrInvoicePdfUrl } from '../services/invoice.service.js';

/**
 * Stream or Redirect PDF Invoice for an Order
 * GET /api/v1/orders/:id/invoice
 */
export const downloadInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(404, 'Order not found.');
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  // Non-admins can only download invoices for their own orders (throw 404 to avoid leaking existence)
  if (
    req.user.role !== 'admin' &&
    order.user.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(404, 'Order not found.');
  }

  // Payment confirmation guard: paid or COD orders are invoiceable
  if (order.paymentStatus !== 'paid' && order.paymentMethod !== 'cod') {
    throw new ApiError(400, 'Invoice is not available until payment is confirmed.');
  }

  const result = await getOrInvoicePdfUrl(order);

  // If a cached Cloudinary URL exists, 307-redirect the client directly to the Cloudinary CDN
  if (result.url && result.cached) {
    return res.redirect(307, result.url);
  }

  // On first generation (or unconfigured Cloudinary fallback), stream the PDF buffer inline
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="Invoice-${order.orderNumber}.pdf"`
  );
  if (result.buffer) {
    res.setHeader('Content-Length', result.buffer.length);
  }

  return res.status(200).send(result.buffer);
});

/**
 * Force Regenerate PDF Invoice for an Order (Admin Only)
 * POST /api/v1/orders/:id/invoice/regenerate
 */
export const regenerateInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(404, 'Order not found.');
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  // Payment confirmation guard
  if (order.paymentStatus !== 'paid' && order.paymentMethod !== 'cod') {
    throw new ApiError(400, 'Invoice is not available until payment is confirmed.');
  }

  const result = await getOrInvoicePdfUrl(order, { forceRegenerate: true });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        url: result.url || null,
        invoice: order.invoice,
      },
      'Invoice regenerated successfully.'
    )
  );
});
