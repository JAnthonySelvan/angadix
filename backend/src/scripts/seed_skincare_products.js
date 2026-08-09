import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const SKINCARE_CATEGORY_ID = '6a77b7e382a71bf7a5379a24';

const BRANDS = {
  LOREAL: '6a77b9fd82a71bf7a5379a29',
  MAYBELLINE: '6a77b9fd82a71bf7a5379a2a',
  LAKME: '6a77b9fd82a71bf7a5379a2b',
  NIVEA: '6a77b9fd82a71bf7a5379a2c',
  THE_BODY_SHOP: '6a77b9fd82a71bf7a5379a2d',
};

const rawProducts = [
  {
    name: "L'Oréal Paris Revitalift Hyaluronic Acid Serum",
    sku: "LOR-SK-001",
    stock: 30,
    category: SKINCARE_CATEGORY_ID,
    brand: BRANDS.LOREAL,
    price: 1299,
    discountPrice: 999,
    description: "Lightweight facial serum formulated for hydrated and smoother-looking skin.",
    shortDescription: "Lightweight facial serum for hydrated, smoother-looking skin.",
    isFeatured: true,
    isActive: true,
    tags: ["skincare", "serum", "hyaluronic-acid", "loreal"],
    ratingsAverage: 4.7,
    ratingsCount: 34,
  },
  {
    name: "L'Oréal Paris Revitalift Moisturizing Cream",
    sku: "LOR-SK-002",
    stock: 25,
    category: SKINCARE_CATEGORY_ID,
    brand: BRANDS.LOREAL,
    price: 1199,
    discountPrice: 899,
    description: "Daily moisturizing cream designed to leave skin feeling soft, hydrated, and refreshed.",
    shortDescription: "Daily moisturizing cream leaving skin soft and hydrated.",
    isFeatured: false,
    isActive: true,
    tags: ["skincare", "cream", "moisturizer", "loreal"],
    ratingsAverage: 4.5,
    ratingsCount: 22,
  },
  {
    name: "Maybelline Fit Me Fresh Face Cleanser",
    sku: "MAY-SK-003",
    stock: 42,
    category: SKINCARE_CATEGORY_ID,
    brand: BRANDS.MAYBELLINE,
    price: 499,
    discountPrice: 399,
    description: "Gentle daily facial cleanser designed to remove excess oil and everyday impurities.",
    shortDescription: "Gentle daily facial cleanser removing excess oil and impurities.",
    isFeatured: true,
    isActive: true,
    tags: ["skincare", "cleanser", "face-wash", "maybelline"],
    ratingsAverage: 4.6,
    ratingsCount: 40,
  },
  {
    name: "Maybelline Hydrating Face Moisturizer",
    sku: "MAY-SK-004",
    stock: 35,
    category: SKINCARE_CATEGORY_ID,
    brand: BRANDS.MAYBELLINE,
    price: 699,
    discountPrice: 549,
    description: "Lightweight moisturizer designed to provide comfortable daily hydration for the skin.",
    shortDescription: "Lightweight moisturizer providing daily hydration.",
    isFeatured: false,
    isActive: true,
    tags: ["skincare", "moisturizer", "maybelline", "face"],
    ratingsAverage: 4.4,
    ratingsCount: 29,
  },
  {
    name: "Lakmé 9 to 5 Vitamin C Face Serum",
    sku: "LAK-SK-005",
    stock: 28,
    category: SKINCARE_CATEGORY_ID,
    brand: BRANDS.LAKME,
    price: 999,
    discountPrice: 749,
    description: "Lightweight facial serum designed to support a brighter and more even-looking complexion.",
    shortDescription: "Vitamin C facial serum for a brighter complexion.",
    isFeatured: true,
    isActive: true,
    tags: ["skincare", "serum", "vitamin-c", "lakme"],
    ratingsAverage: 4.7,
    ratingsCount: 31,
  },
  {
    name: "Lakmé Peach Milk Moisturizer",
    sku: "LAK-SK-006",
    stock: 39,
    category: SKINCARE_CATEGORY_ID,
    brand: BRANDS.LAKME,
    price: 599,
    discountPrice: 449,
    description: "Everyday moisturizing lotion designed to leave skin feeling soft, smooth, and nourished.",
    shortDescription: "Everyday moisturizing lotion leaving skin soft and nourished.",
    isFeatured: false,
    isActive: true,
    tags: ["skincare", "moisturizer", "lotion", "lakme"],
    ratingsAverage: 4.6,
    ratingsCount: 55,
  },
  {
    name: "NIVEA Soft Light Moisturizing Cream",
    sku: "NIV-SK-007",
    stock: 55,
    category: SKINCARE_CATEGORY_ID,
    brand: BRANDS.NIVEA,
    price: 399,
    discountPrice: 299,
    description: "Lightweight moisturizing cream suitable for everyday face, hand, and body care.",
    shortDescription: "Lightweight moisturizing cream for face, hands, and body.",
    isFeatured: true,
    isActive: true,
    tags: ["skincare", "cream", "nivea", "moisturizer"],
    ratingsAverage: 4.8,
    ratingsCount: 82,
  },
  {
    name: "NIVEA Deep Cleansing Face Wash",
    sku: "NIV-SK-008",
    stock: 48,
    category: SKINCARE_CATEGORY_ID,
    brand: BRANDS.NIVEA,
    price: 449,
    discountPrice: 349,
    description: "Daily face wash designed to cleanse away dirt, excess oil, and impurities while leaving skin refreshed.",
    shortDescription: "Daily face wash cleansing dirt and oil for refreshed skin.",
    isFeatured: false,
    isActive: true,
    tags: ["skincare", "face-wash", "nivea", "cleanser"],
    ratingsAverage: 4.5,
    ratingsCount: 46,
  },
  {
    name: "The Body Shop Vitamin E Moisture Cream",
    sku: "TBS-SK-009",
    stock: 20,
    category: SKINCARE_CATEGORY_ID,
    brand: BRANDS.THE_BODY_SHOP,
    price: 1499,
    discountPrice: 1199,
    description: "Rich facial moisturizer designed to provide lasting hydration and a comfortable skin feel.",
    shortDescription: "Rich facial moisturizer for lasting hydration.",
    isFeatured: true,
    isActive: true,
    tags: ["skincare", "moisturizer", "vitamin-e", "the-body-shop"],
    ratingsAverage: 4.8,
    ratingsCount: 27,
  },
  {
    name: "The Body Shop Tea Tree Facial Cleanser",
    sku: "TBS-SK-010",
    stock: 24,
    category: SKINCARE_CATEGORY_ID,
    brand: BRANDS.THE_BODY_SHOP,
    price: 1199,
    discountPrice: 899,
    description: "Refreshing facial cleanser designed to remove everyday impurities and leave the skin feeling clean.",
    shortDescription: "Refreshing tea tree facial cleanser.",
    isFeatured: false,
    isActive: true,
    tags: ["skincare", "cleanser", "tea-tree", "the-body-shop"],
    ratingsAverage: 4.6,
    ratingsCount: 33,
  }
];

const seedSkincareProducts = async () => {
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
      adminUser = await User.findOne();
    }

    if (!adminUser) {
      console.error('\x1b[31m[ERROR] No user found in database.\x1b[0m');
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
    console.log('    SKINCARE PRODUCTS SEEDING COMPLETE  ');
    console.log('========================================');
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('\x1b[32m[SUCCESS] MongoDB connection closed.\x1b[0m');
  } catch (err) {
    console.error('\x1b[31m[ERROR] Failed to seed skincare products:\x1b[0m', err);
    process.exit(1);
  }
};

seedSkincareProducts();
