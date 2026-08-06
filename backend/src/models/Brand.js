import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true,
      trim: true,
      maxLength: [100, 'Brand name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxLength: [500, 'Description cannot exceed 500 characters'],
    },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
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

// Compound index for active listing
brandSchema.index({ isActive: 1, name: 1 });

// Helper function to convert string to slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// Pre-save hook for slug auto-generation
brandSchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();

  let baseSlug = slugify(this.name);
  let generatedSlug = baseSlug;
  let count = 1;

  while (await mongoose.models.Brand.exists({ slug: generatedSlug, _id: { $ne: this._id } })) {
    generatedSlug = `${baseSlug}-${count}`;
    count++;
  }

  this.slug = generatedSlug;
  next();
});

export const Brand = mongoose.model('Brand', brandSchema);
