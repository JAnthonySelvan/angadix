import mongoose from 'mongoose';
import crypto from 'crypto';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const shippingAddressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      type: shippingAddressSnapshotSchema,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    appliedCoupon: {
      type: {
        code: { type: String },
        discountType: { type: String },
        discountValue: { type: Number },
      },
      default: null,
    },
    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      select: false,
    },
    razorpayPaymentId: {
      type: String,
      select: false,
    },
    razorpaySignature: {
      type: String,
      select: false,
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'packed',
        'shipped',
        'delivered',
        'cancelled',
        'returned',
        'refunded',
      ],
      default: 'pending',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    cancelReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });

// Helper to generate unique order numbers
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ANG-${dateStr}-${randomHex}`;
};

// Pre-save hook to auto-generate orderNumber on creation
orderSchema.pre('validate', async function (next) {
  if (this.isNew && !this.orderNumber) {
    let orderNum = generateOrderNumber();
    let collision = await mongoose.models.Order?.exists({ orderNumber: orderNum });
    let attempts = 0;
    while (collision && attempts < 5) {
      orderNum = generateOrderNumber();
      collision = await mongoose.models.Order?.exists({ orderNumber: orderNum });
      attempts++;
    }
    this.orderNumber = orderNum;
  }
  next();
});

// Instance method to update status and push history entry
orderSchema.methods.addStatusEntry = function (status, note = '') {
  this.orderStatus = status;
  this.statusHistory.push({
    status,
    note,
    changedAt: new Date(),
  });
};

export const Order = mongoose.model('Order', orderSchema);
