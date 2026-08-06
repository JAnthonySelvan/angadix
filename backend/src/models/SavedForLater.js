import mongoose from 'mongoose';

const savedItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const savedForLaterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    items: {
      type: [savedItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const SavedForLater = mongoose.model('SavedForLater', savedForLaterSchema);
