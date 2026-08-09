import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const FRAGRANCES_CATEGORY_ID = '6a77b7e382a71bf7a5379a26';

const BRANDS = {
  LOREAL: '6a77b9fd82a71bf7a5379a29',
  MAYBELLINE: '6a77b9fd82a71bf7a5379a2a',
  LAKME: '6a77b9fd82a71bf7a5379a2b',
  NIVEA: '6a77b9fd82a71bf7a5379a2c',
  THE_BODY_SHOP: '6a77b9fd82a71bf7a5379a2d',
};

const rawProducts = [
  {
    name: "British Rose Eau De Toilette",
    sku: "TBS-FRG-001",
    stock: 25,
    category: FRAGRANCES_CATEGORY_ID,
    brand: BRANDS.THE_BODY_SHOP,
    price: 1995,
    discountPrice: null,
    description: "A fresh floral eau de toilette inspired by the elegant scent of British roses.",
    shortDescription: "Fresh floral eau de toilette inspired by British roses.",
    isFeatured: true,
    isActive: true,
    tags: ["fragrances", "perfume", "eau-de-toilette", "the-body-shop", "rose"],
    ratingsAverage: 4.8,
    ratingsCount: 38,
  },
  {
    name: "Blue Musk Eau De Toilette",
    sku: "TBS-FRG-002",
    stock: 20,
    category: FRAGRANCES_CATEGORY_ID,
    brand: BRANDS.THE_BODY_SHOP,
    price: 2995,
    discountPrice: null,
    description: "An aromatic and woody musk fragrance with a fresh character.",
    shortDescription: "Aromatic and woody musk fragrance with a fresh character.",
    isFeatured: true,
    isActive: true,
    tags: ["fragrances", "musk", "perfume", "the-body-shop", "woody"],
    ratingsAverage: 4.7,
    ratingsCount: 24,
  },
  {
    name: "White Musk Eau De Toilette",
    sku: "TBS-FRG-003",
    stock: 24,
    category: FRAGRANCES_CATEGORY_ID,
    brand: BRANDS.THE_BODY_SHOP,
    price: 2295,
    discountPrice: null,
    description: "A fresh floral musk fragrance with a soft and clean character.",
    shortDescription: "Fresh floral musk fragrance with a soft and clean scent.",
    isFeatured: true,
    isActive: true,
    tags: ["fragrances", "musk", "perfume", "the-body-shop", "floral"],
    ratingsAverage: 4.9,
    ratingsCount: 52,
  },
  {
    name: "Black Musk Eau De Toilette",
    sku: "TBS-FRG-004",
    stock: 19,
    category: FRAGRANCES_CATEGORY_ID,
    brand: BRANDS.THE_BODY_SHOP,
    price: 2295,
    discountPrice: null,
    description: "A deep and sensual musk fragrance with a rich aromatic character.",
    shortDescription: "Deep and sensual musk fragrance with rich aromatic notes.",
    isFeatured: true,
    isActive: true,
    tags: ["fragrances", "musk", "perfume", "the-body-shop", "sensual"],
    ratingsAverage: 4.8,
    ratingsCount: 29,
  },
  {
    name: "NIVEA Fresh Natural Deodorant Spray 150ml",
    sku: "NIV-FRG-005",
    stock: 40,
    category: FRAGRANCES_CATEGORY_ID,
    brand: BRANDS.NIVEA,
    price: 349,
    discountPrice: 299,
    description: "Fresh Natural deodorant spray with a light refreshing scent and up to 48 hours of odor protection.",
    shortDescription: "Deodorant spray with up to 48h odor protection.",
    isFeatured: true,
    isActive: true,
    tags: ["fragrances", "deodorant", "nivea", "fresh"],
    ratingsAverage: 4.6,
    ratingsCount: 65,
  },
  {
    name: "NIVEA MEN Fresh Active Deodorant 150ml",
    sku: "NIV-FRG-006",
    stock: 35,
    category: FRAGRANCES_CATEGORY_ID,
    brand: BRANDS.NIVEA,
    price: 349,
    discountPrice: 299,
    description: "Men's deodorant spray with a fresh fragrance and up to 48 hours of odor protection.",
    shortDescription: "Men's deodorant spray with 48h fresh odor protection.",
    isFeatured: true,
    isActive: true,
    tags: ["fragrances", "deodorant", "nivea-men", "active"],
    ratingsAverage: 4.7,
    ratingsCount: 78,
  },
  {
    name: "NIVEA MEN Fresh Ocean Deodorant 150ml",
    sku: "NIV-FRG-007",
    stock: 32,
    category: FRAGRANCES_CATEGORY_ID,
    brand: BRANDS.NIVEA,
    price: 349,
    discountPrice: 299,
    description: "Men's deodorant with a refreshing ocean-inspired scent and up to 48 hours of odor protection.",
    shortDescription: "Men's ocean-inspired deodorant with 48h protection.",
    isFeatured: false,
    isActive: true,
    tags: ["fragrances", "deodorant", "nivea-men", "ocean"],
    ratingsAverage: 4.5,
    ratingsCount: 41,
  },
  {
    name: "L'Oréal Paris Men Expert Carbon Protect Deodorant",
    sku: "LOR-FRG-008",
    stock: 30,
    category: FRAGRANCES_CATEGORY_ID,
    brand: BRANDS.LOREAL,
    price: 499,
    discountPrice: 399,
    description: "Men Expert deodorant designed to provide long-lasting freshness and odor protection.",
    shortDescription: "Men Expert deodorant providing long-lasting freshness.",
    isFeatured: true,
    isActive: true,
    tags: ["fragrances", "deodorant", "loreal", "men-expert"],
    ratingsAverage: 4.6,
    ratingsCount: 33,
  },
  {
    name: "L'Oréal Paris Men Expert Deodorant Roll On",
    sku: "LOR-FRG-009",
    stock: 28,
    category: FRAGRANCES_CATEGORY_ID,
    brand: BRANDS.LOREAL,
    price: 399,
    discountPrice: 299,
    description: "Men Expert roll-on deodorant designed for convenient daily freshness and underarm protection.",
    shortDescription: "Roll-on deodorant for convenient daily freshness.",
    isFeatured: false,
    isActive: true,
    tags: ["fragrances", "roll-on", "deodorant", "loreal"],
    ratingsAverage: 4.4,
    ratingsCount: 22,
  },
  {
    name: "L'Oréal Paris Men Expert Carbon Protect Roll On",
    sku: "LOR-FRG-010",
    stock: 25,
    category: FRAGRANCES_CATEGORY_ID,
    brand: BRANDS.LOREAL,
    price: 399,
    discountPrice: 299,
    description: "Men Expert Carbon Protect roll-on designed for everyday odor protection and lasting freshness.",
    shortDescription: "Carbon protect roll-on for everyday odor protection.",
    isFeatured: true,
    isActive: true,
    tags: ["fragrances", "roll-on", "carbon-protect", "loreal"],
    ratingsAverage: 4.7,
    ratingsCount: 30,
  }
];

const seedFragranceProducts = async () => {
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
    console.log('    FRAGRANCES PRODUCTS SEEDING COMPLETE');
    console.log('========================================');
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('\x1b[32m[SUCCESS] MongoDB connection closed.\x1b[0m');
  } catch (err) {
    console.error('\x1b[31m[ERROR] Failed to seed fragrance products:\x1b[0m', err);
    process.exit(1);
  }
};

seedFragranceProducts();
