import crypto from 'crypto';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { env } from '../config/env.js';
import razorpayInstance, { razorpayConfig } from '../config/razorpay.js';
import { Order } from '../models/Order.js';
import { Address } from '../models/Address.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Payment } from '../models/Payment.js';
import { calculateAndFormatCart } from './cart.controller.js';

// 1. Create Order (Checkout Entrypoint)
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddressId, paymentMethod } = req.body;

  // Load user's cart and calculate formatted totals
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Your cart is empty. Cannot proceed to checkout.');
  }

  const cartData = await calculateAndFormatCart(cart, req.user._id);

  if (cartData.items.length === 0) {
    throw new ApiError(400, 'Your cart contains no valid items.');
  }

  // Verify no cart items are unavailable or exceed stock
  for (const item of cartData.items) {
    if (item.unavailable || !item.product) {
      throw new ApiError(
        400,
        'One or more items in your cart are no longer available. Please update your cart.'
      );
    }
    if (item.product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for '${item.product.name}'. Available: ${item.product.stock}, requested: ${item.quantity}.`
      );
    }
  }

  // Load & verify shipping address ownership
  const address = await Address.findById(shippingAddressId);
  if (!address) {
    throw new ApiError(404, 'Selected shipping address not found.');
  }
  if (address.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to use this shipping address.');
  }

  // Snapshot cart items and address
  const orderItems = cartData.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image:
      item.product.images && item.product.images.length > 0
        ? item.product.images[0]
        : '',
    price:
      item.product.discountPrice !== null &&
      item.product.discountPrice !== undefined
        ? item.product.discountPrice
        : item.product.price,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  }));

  const shippingAddressSnapshot = {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || '',
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country || 'India',
  };

  const subtotal = cartData.subtotal;
  const discountAmount = cartData.discountAmount || 0;
  const appliedCoupon = cartData.appliedCoupon
    ? {
        code: cartData.appliedCoupon.code,
        discountType: cartData.appliedCoupon.discountType,
        discountValue: cartData.appliedCoupon.discountValue,
      }
    : null;

  const shippingCharge = 0; // Flat 0 for free shipping
  const taxAmount = 0; // GST logic expansion spot
  const totalAmount = Math.max(
    0,
    Math.round((subtotal - discountAmount + shippingCharge + taxAmount) * 100) / 100
  );

  // Check payment gateway availability for Razorpay
  if (paymentMethod === 'razorpay' && !razorpayConfig.isConfigured()) {
    throw new ApiError(
      503,
      'Payment gateway is not configured. Please use Cash on Delivery or contact support.'
    );
  }

  // Handle COD Path
  if (paymentMethod === 'cod') {
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: shippingAddressSnapshot,
      subtotal,
      discountAmount,
      appliedCoupon,
      shippingCharge,
      taxAmount,
      totalAmount,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'confirmed',
    });

    order.addStatusEntry('confirmed', 'Order placed with Cash on Delivery');
    await order.save();

    // Atomic decrement product stock
    await Promise.all(
      orderItems.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        })
      )
    );

    // Clear user cart
    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          order,
          'Order placed successfully with Cash on Delivery.'
        )
      );
  }

  // Handle Razorpay Path
  const order = new Order({
    user: req.user._id,
    items: orderItems,
    shippingAddress: shippingAddressSnapshot,
    subtotal,
    discountAmount,
    appliedCoupon,
    shippingCharge,
    taxAmount,
    totalAmount,
    paymentMethod: 'razorpay',
    paymentStatus: 'pending',
    orderStatus: 'pending',
  });

  order.addStatusEntry('pending', 'Order created, awaiting Razorpay payment');
  await order.save();

  // Create Razorpay SDK Order
  let razorpayOrder;
  try {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: order._id.toString() },
    });
  } catch (err) {
    // If Razorpay order creation fails, cleanup pending order and throw
    await Order.findByIdAndDelete(order._id);
    throw new ApiError(
      500,
      `Razorpay order creation failed: ${err.message || 'Unknown error'}`
    );
  }

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  // Create Payment audit log entry
  await Payment.create({
    order: order._id,
    user: req.user._id,
    razorpayOrderId: razorpayOrder.id,
    amount: totalAmount,
    currency: 'INR',
    status: 'created',
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        order,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: env.razorpay.keyId,
        },
      },
      'Order created successfully. Please complete payment.'
    )
  );
});

// 2. Verify Razorpay Payment
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } =
    req.body;

  // Validate Razorpay signature using HMAC-SHA256
  const generatedSignature = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'failed',
        errorCode: 'INVALID_SIGNATURE',
        errorDescription: 'Payment verification failed due to invalid signature.',
      }
    );
    throw new ApiError(400, 'Payment verification failed. Invalid signature.');
  }

  const order = await Order.findById(orderId).select('+razorpayOrderId');
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to verify this payment.');
  }

  if (order.razorpayOrderId !== razorpay_order_id) {
    throw new ApiError(400, 'Razorpay order ID mismatch.');
  }

  // Idempotency check: if already paid, return early
  if (order.paymentStatus === 'paid') {
    return res
      .status(200)
      .json(new ApiResponse(200, order, 'Payment has already been verified.'));
  }

  // Update Order payment and status
  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  order.addStatusEntry('confirmed', 'Payment verified successfully');
  await order.save();

  // Commit stock decrement for each item
  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      })
    )
  );

  // Clear user's cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();
  }

  // Update Payment audit document
  await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      status: 'captured',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        order,
        'Payment verified and order confirmed successfully.'
      )
    );
});

// 3. Razorpay Webhook Handler
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = env.razorpay.webhookSecret;

  if (!signature || !webhookSecret) {
    return res.status(400).json({ status: 'ignored', message: 'Webhook secret or signature missing' });
  }

  // req.body is raw Buffer when routed through express.raw()
  const rawBody = req.body;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({ status: 'invalid_signature' });
  }

  const payload = JSON.parse(rawBody.toString());
  const event = payload.event;

  if (event === 'payment.captured') {
    const razorpayPayment = payload.payload.payment.entity;
    const razorpayOrderId = razorpayPayment.order_id;

    const order = await Order.findOne({ razorpayOrderId }).select('+razorpayOrderId');
    if (order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpayPayment.id;
      order.addStatusEntry('confirmed', 'Payment captured via Razorpay webhook');
      await order.save();

      // Decrement stock if not already done
      await Promise.all(
        order.items.map((item) =>
          Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          })
        )
      );

      // Clear cart
      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [], appliedCoupon: null }
      );
    }

    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        status: 'captured',
        razorpayPaymentId: razorpayPayment.id,
        method: razorpayPayment.method || '',
        rawWebhookPayload: payload,
      },
      { upsert: true }
    );
  } else if (event === 'payment.failed') {
    const razorpayPayment = payload.payload.payment.entity;
    const razorpayOrderId = razorpayPayment.order_id;

    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        status: 'failed',
        errorCode: razorpayPayment.error_code || '',
        errorDescription: razorpayPayment.error_description || '',
        rawWebhookPayload: payload,
      }
    );
  }

  return res.status(200).json({ status: 'ok' });
});

// 4. Get My Orders (Paginated)
export const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(total / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      'User orders retrieved successfully.'
    )
  );
});

// 5. Get Order By ID
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(404, 'Order not found.');
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  // Non-admins can only fetch their own orders (throw 404 to avoid leaking existence)
  if (
    req.user.role !== 'admin' &&
    order.user.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(404, 'Order not found.');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, 'Order retrieved successfully.'));
});

// 6. Cancel Order (User / Admin)
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason = '' } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(404, 'Order not found.');
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  if (
    req.user.role !== 'admin' &&
    order.user.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(404, 'Order not found.');
  }

  if (!['pending', 'confirmed'].includes(order.orderStatus)) {
    throw new ApiError(
      400,
      `Order cannot be cancelled as it is already '${order.orderStatus}'.`
    );
  }

  // Restore Product stock
  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      })
    )
  );

  order.cancelReason = reason || 'Cancelled by user';
  order.addStatusEntry('cancelled', reason || 'Order cancelled by user');

  if (order.paymentStatus === 'paid') {
    order.paymentStatus = 'refunded';
    // TODO: integrate razorpay.payments.refund() in a later phase
  }

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, 'Order cancelled successfully.'));
});

// 7. Update Order Status (Admin Only)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { orderStatus, note = '' } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(404, 'Order not found.');
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['packed', 'cancelled'],
    packed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['returned', 'refunded'],
    cancelled: [],
    returned: ['refunded'],
    refunded: [],
  };

  const validNextStates = allowedTransitions[order.orderStatus] || [];
  if (!validNextStates.includes(orderStatus) && order.orderStatus !== orderStatus) {
    throw new ApiError(
      400,
      `Cannot transition order status from '${order.orderStatus}' to '${orderStatus}'. Allowed transitions: [${validNextStates.join(
        ', '
      )}]`
    );
  }

  // If status is transitioning to cancelled, restore stock if order was confirmed
  if (orderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
    await Promise.all(
      order.items.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        })
      )
    );
    order.cancelReason = note || 'Cancelled by admin';
  }

  order.addStatusEntry(orderStatus, note || `Status updated to ${orderStatus} by admin`);
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, 'Order status updated successfully.'));
});

// 8. Get All Orders (Admin Only)
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.orderStatus) {
    filter.orderStatus = req.query.orderStatus;
  }
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) {
      filter.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(total / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      'All orders retrieved successfully.'
    )
  );
});
