import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxLength: [100, 'Category name cannot exceed 100 characters'],
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
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
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

// Compound index for optimized active listing
categorySchema.index({ isActive: 1, name: 1 });

// Helper function to convert string to slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove non-word characters
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

// Pre-save hook: auto-generate slug from name if modified
categorySchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();

  let baseSlug = slugify(this.name);
  let generatedSlug = baseSlug;
  let count = 1;

  // Ensure slug uniqueness
  while (await mongoose.models.Category.exists({ slug: generatedSlug, _id: { $ne: this._id } })) {
    generatedSlug = `${baseSlug}-${count}`;
    count++;
  }

  this.slug = generatedSlug;
  next();
});

export const Category = mongoose.model('Category', categorySchema);
