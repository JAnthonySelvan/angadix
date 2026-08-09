import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MAKEUP_CATEGORY_ID = '6a77b7e382a71bf7a5379a23';

const BRANDS = {
  LOREAL: '6a77b9fd82a71bf7a5379a29',
  MAYBELLINE: '6a77b9fd82a71bf7a5379a2a',
  LAKME: '6a77b9fd82a71bf7a5379a2b',
  NIVEA: '6a77b9fd82a71bf7a5379a2c',
  THE_BODY_SHOP: '6a77b9fd82a71bf7a5379a2d',
};

const rawProducts = [
  {
    name: "L'Oréal Paris Infallible Matte Lipstick",
    sku: "LOR-MKP-001",
    stock: 32,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.LOREAL,
    price: 1199,
    discountPrice: 899,
    description: "Long-lasting matte lipstick with rich color and a comfortable finish for everyday and occasion makeup.",
    shortDescription: "Long-lasting matte lipstick with rich color and comfortable finish.",
    isFeatured: true,
    isActive: true,
    tags: ["makeup", "lipstick", "loreal", "matte"],
    ratingsAverage: 4.6,
    ratingsCount: 28,
  },
  {
    name: "L'Oréal Paris True Match Foundation",
    sku: "LOR-MKP-002",
    stock: 24,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.LOREAL,
    price: 1499,
    discountPrice: 1199,
    description: "Lightweight foundation designed to provide natural-looking coverage with a smooth finish.",
    shortDescription: "Lightweight foundation providing natural-looking coverage.",
    isFeatured: true,
    isActive: true,
    tags: ["makeup", "foundation", "loreal", "face"],
    ratingsAverage: 4.7,
    ratingsCount: 35,
  },
  {
    name: "L'Oréal Paris Voluminous Mascara",
    sku: "LOR-MKP-003",
    stock: 28,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.LOREAL,
    price: 999,
    discountPrice: 799,
    description: "Volumizing mascara designed to define and enhance the appearance of eyelashes.",
    shortDescription: "Volumizing mascara to define and enhance eyelashes.",
    isFeatured: false,
    isActive: true,
    tags: ["makeup", "mascara", "loreal", "eyes"],
    ratingsAverage: 4.5,
    ratingsCount: 19,
  },
  {
    name: "Maybelline SuperStay Matte Ink Lip Color",
    sku: "MAY-MKP-004",
    stock: 45,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.MAYBELLINE,
    price: 899,
    discountPrice: 699,
    description: "Highly pigmented liquid lip color with a long-wearing matte finish for all-day makeup looks.",
    shortDescription: "Highly pigmented liquid lip color with a long-wearing matte finish.",
    isFeatured: true,
    isActive: true,
    tags: ["makeup", "lip-color", "maybelline", "matte"],
    ratingsAverage: 4.8,
    ratingsCount: 52,
  },
  {
    name: "Maybelline Fit Me Matte Foundation",
    sku: "MAY-MKP-005",
    stock: 36,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.MAYBELLINE,
    price: 799,
    discountPrice: 649,
    description: "Lightweight matte foundation designed to provide smooth and natural-looking coverage.",
    shortDescription: "Lightweight matte foundation for smooth, natural coverage.",
    isFeatured: true,
    isActive: true,
    tags: ["makeup", "foundation", "maybelline", "face"],
    ratingsAverage: 4.6,
    ratingsCount: 44,
  },
  {
    name: "Maybelline Colossal Kajal",
    sku: "MAY-MKP-006",
    stock: 58,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.MAYBELLINE,
    price: 299,
    discountPrice: 249,
    description: "Easy-to-apply kajal designed to define the eyes with an intense and smooth finish.",
    shortDescription: "Easy-to-apply kajal defining eyes with an intense finish.",
    isFeatured: false,
    isActive: true,
    tags: ["makeup", "kajal", "maybelline", "eyes"],
    ratingsAverage: 4.7,
    ratingsCount: 68,
  },
  {
    name: "Lakmé Absolute Skin Natural Mousse",
    sku: "LAK-MKP-007",
    stock: 27,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.LAKME,
    price: 999,
    discountPrice: 799,
    description: "Lightweight mousse makeup designed to provide a smooth, natural-looking complexion.",
    shortDescription: "Lightweight mousse makeup for a smooth complexion.",
    isFeatured: true,
    isActive: true,
    tags: ["makeup", "mousse", "lakme", "face"],
    ratingsAverage: 4.6,
    ratingsCount: 31,
  },
  {
    name: "Lakmé Eyeconic Curling Mascara",
    sku: "LAK-MKP-008",
    stock: 41,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.LAKME,
    price: 499,
    discountPrice: 399,
    description: "Curling mascara designed to define lashes and create a fuller-looking eye appearance.",
    shortDescription: "Curling mascara defining lashes for fuller-looking eyes.",
    isFeatured: false,
    isActive: true,
    tags: ["makeup", "mascara", "lakme", "eyes"],
    ratingsAverage: 4.4,
    ratingsCount: 22,
  },
  {
    name: "Lakmé Absolute Matte Revolution Lip Color",
    sku: "LAK-MKP-009",
    stock: 33,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.LAKME,
    price: 899,
    discountPrice: 699,
    description: "Richly pigmented matte lipstick designed for an elegant and long-lasting lip look.",
    shortDescription: "Richly pigmented matte lipstick for long-lasting lip color.",
    isFeatured: true,
    isActive: true,
    tags: ["makeup", "lipstick", "lakme", "matte"],
    ratingsAverage: 4.7,
    ratingsCount: 39,
  },
  {
    name: "NIVEA Tinted Lip Balm",
    sku: "NIV-MKP-010",
    stock: 52,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.NIVEA,
    price: 399,
    discountPrice: 299,
    description: "Moisturizing tinted lip balm that provides a subtle touch of color while caring for the lips.",
    shortDescription: "Moisturizing tinted lip balm for subtle color and lip care.",
    isFeatured: false,
    isActive: true,
    tags: ["makeup", "lip-balm", "nivea", "lips"],
    ratingsAverage: 4.5,
    ratingsCount: 47,
  },
  {
    name: "NIVEA Natural Glow BB Cream",
    sku: "NIV-MKP-011",
    stock: 29,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.NIVEA,
    price: 699,
    discountPrice: 549,
    description: "Lightweight BB cream designed to provide a natural-looking complexion with a comfortable feel.",
    shortDescription: "Lightweight BB cream for a natural-looking complexion.",
    isFeatured: false,
    isActive: true,
    tags: ["makeup", "bb-cream", "nivea", "face"],
    ratingsAverage: 4.4,
    ratingsCount: 26,
  },
  {
    name: "The Body Shop Fresh Nude Foundation",
    sku: "TBS-MKP-012",
    stock: 18,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.THE_BODY_SHOP,
    price: 1899,
    discountPrice: 1499,
    description: "Natural-looking foundation designed to provide buildable coverage with a fresh finish.",
    shortDescription: "Natural-looking foundation providing buildable coverage.",
    isFeatured: true,
    isActive: true,
    tags: ["makeup", "foundation", "the-body-shop", "face"],
    ratingsAverage: 4.8,
    ratingsCount: 18,
  },
  {
    name: "The Body Shop Matte Lip Colour",
    sku: "TBS-MKP-013",
    stock: 23,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.THE_BODY_SHOP,
    price: 1199,
    discountPrice: 899,
    description: "Smooth matte lip color offering rich pigmentation and a comfortable finish.",
    shortDescription: "Smooth matte lip color with rich pigmentation.",
    isFeatured: false,
    isActive: true,
    tags: ["makeup", "lip-color", "the-body-shop", "matte"],
    ratingsAverage: 4.6,
    ratingsCount: 21,
  },
  {
    name: "The Body Shop Brow & Eye Definer",
    sku: "TBS-MKP-014",
    stock: 26,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.THE_BODY_SHOP,
    price: 999,
    discountPrice: 749,
    description: "Multi-purpose eye and brow defining product designed to enhance and shape your makeup look.",
    shortDescription: "Multi-purpose eye and brow defining pencil.",
    isFeatured: false,
    isActive: true,
    tags: ["makeup", "eye-definer", "the-body-shop", "brows"],
    ratingsAverage: 4.5,
    ratingsCount: 16,
  },
  {
    name: "The Body Shop Shimmer Highlighter",
    sku: "TBS-MKP-015",
    stock: 21,
    category: MAKEUP_CATEGORY_ID,
    brand: BRANDS.THE_BODY_SHOP,
    price: 1299,
    discountPrice: 999,
    description: "Light-reflecting highlighter designed to add a subtle luminous finish to the face.",
    shortDescription: "Light-reflecting highlighter for a luminous finish.",
    isFeatured: true,
    isActive: true,
    tags: ["makeup", "highlighter", "the-body-shop", "shimmer"],
    ratingsAverage: 4.7,
    ratingsCount: 25,
  }
];

const seedMakeupProducts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('\x1b[31m[ERROR] MONGO_URI is missing from environment\x1b[0m');
      process.exit(1);
    }

    console.log('\x1b[36mConnecting to MongoDB...\x1b[0m');
    await mongoose.connect(mongoUri);
    console.log('\x1b[32m[SUCCESS] Connected to MongoDB.\x1b[0m');

    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('\x1b[33mNo admin user found. Searching for any user...\x1b[0m');
      adminUser = await User.findOne();
    }

    if (!adminUser) {
      console.error('\x1b[31m[ERROR] No user found in database to assign as createdBy.\x1b[0m');
      process.exit(1);
    }

    console.log(`\x1b[36mUsing admin user ID: ${adminUser._id}\x1b[0m`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const p of rawProducts) {
      const existingProduct = await Product.findOne({ sku: p.sku });

      const productPayload = {
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription,
        category: p.category,
        brand: p.brand,
        price: p.price,
        discountPrice: p.discountPrice,
        currency: 'INR',
        stock: p.stock,
        sku: p.sku,
        images: [],
        tags: p.tags,
        ratingsAverage: p.ratingsAverage,
        ratingsCount: p.ratingsCount,
        isFeatured: p.isFeatured,
        isBestSeller: false,
        isActive: p.isActive,
        createdBy: adminUser._id,
      };

      if (existingProduct) {
        Object.assign(existingProduct, productPayload);
        await existingProduct.save();
        updatedCount++;
        console.log(`\x1b[33mUpdated product [${p.sku}]: ${p.name}\x1b[0m`);
      } else {
        await Product.create(productPayload);
        createdCount++;
        console.log(`\x1b[32mCreated product [${p.sku}]: ${p.name}\x1b[0m`);
      }
    }

    console.log('\n========================================');
    console.log('     MAKEUP PRODUCTS SEEDING COMPLETE   ');
    console.log('========================================');
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('\x1b[32m[SUCCESS] MongoDB connection closed.\x1b[0m');
  } catch (err) {
    console.error('\x1b[31m[ERROR] Failed to seed makeup products:\x1b[0m', err);
    process.exit(1);
  }
};

seedMakeupProducts();
