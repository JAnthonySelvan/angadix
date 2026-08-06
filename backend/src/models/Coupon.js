import mongoose from 'mongoose';

const redemptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  { _id: false }
);

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
      min: [0, 'Max discount amount cannot be negative'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order value cannot be negative'],
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1 if set'],
    },
    usageLimitPerUser: {
      type: Number,
      default: 1,
      min: [1, 'Usage limit per user must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative'],
    },
    validFrom: {
      type: Date,
      required: [true, 'Valid from date is required'],
    },
    validUntil: {
      type: Date,
      required: [true, 'Valid until date is required'],
    },
    applicableCategories: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required'],
    },
    redeemedBy: {
      type: [redemptionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate check ensuring validUntil > validFrom
couponSchema.pre('validate', function (next) {
  if (this.validFrom && this.validUntil) {
    if (new Date(this.validUntil) <= new Date(this.validFrom)) {
      this.invalidate('validUntil', 'validUntil date must be strictly after validFrom date.');
    }
  }
  next();
});

/**
 * Instance method to check if coupon is valid for usage
 * @param {number} orderValue - Current cart/order subtotal
 * @param {string|mongoose.Types.ObjectId} [userId] - Optional User ID to check per-user limit
 * @returns {{ valid: boolean, reason?: string }}
 */
couponSchema.methods.isValidForUse = function (orderValue, userId = null) {
  if (!this.isActive) {
    return { valid: false, reason: 'Coupon is inactive.' };
  }

  const now = new Date();
  if (now < new Date(this.validFrom)) {
    return { valid: false, reason: 'Coupon is not yet active.' };
  }
  if (now > new Date(this.validUntil)) {
    return { valid: false, reason: 'Coupon has expired.' };
  }

  if (typeof orderValue === 'number' && orderValue < this.minOrderValue) {
    return {
      valid: false,
      reason: `Minimum order value of ${this.minOrderValue} required to apply this coupon.`,
    };
  }

  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'Coupon usage limit has been reached.' };
  }

  if (userId && this.usageLimitPerUser) {
    const userRedemptions = (this.redeemedBy || []).filter(
      (r) => r.user && r.user.toString() === userId.toString()
    ).length;
    if (userRedemptions >= this.usageLimitPerUser) {
      return {
        valid: false,
        reason: 'You have reached the maximum redemption limit for this coupon.',
      };
    }
  }

  return { valid: true };
};

export const Coupon = mongoose.model('Coupon', couponSchema);
