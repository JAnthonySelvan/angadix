import mongoose from 'mongoose';

const featuredShowcaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Showcase title is required'],
      trim: true,
      maxLength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Showcase description is required'],
      trim: true,
      maxLength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      url: {
        type: String,
        required: [true, 'Showcase image URL is required'],
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    ctaText: {
      type: String,
      trim: true,
      default: 'Shop Now',
    },
    ctaLink: {
      type: String,
      trim: true,
      default: '',
    },
    linkedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

featuredShowcaseSchema.index({ isActive: 1, sortOrder: 1 });

export const FeaturedShowcase = mongoose.model('FeaturedShowcase', featuredShowcaseSchema);
