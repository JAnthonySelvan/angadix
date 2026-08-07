import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxLength: [150, 'Title cannot exceed 150 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
      maxLength: [300, 'Subtitle cannot exceed 300 characters'],
    },
    image: {
      url: {
        type: String,
        required: [true, 'Banner image URL is required'],
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    ctaText: {
      type: String,
      trim: true,
      default: '',
    },
    ctaLink: {
      type: String,
      trim: true,
      default: '',
    },
    placement: {
      type: String,
      enum: ['hero', 'promo', 'category'],
      default: 'hero',
      index: true,
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
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ placement: 1, sortOrder: 1, isActive: 1 });

export const Banner = mongoose.model('Banner', bannerSchema);
