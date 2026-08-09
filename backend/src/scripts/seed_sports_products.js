import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const SPORTS_CATEGORY_ID = '6a7508c02273829016833844';

const BRANDS = {
  NIKE: '6a773cbb7481e2c7945ab9dc',
  ADIDAS: '6a773cbb7481e2c7945ab9dd',
  PUMA: '6a773cbb7481e2c7945ab9de',
  DECATHLON: '6a77d20b82a71bf7a5379a33',
  YONEX: '6a77d20b82a71bf7a5379a34',
};

const rawProducts = [
  {
    name: "Nike Air Zoom Pegasus 41",
    sku: "NIK-SPT-001",
    stock: 18,
    category: SPORTS_CATEGORY_ID,
    brand: BRANDS.NIKE,
    price: 8995,
    discountPrice: null,
    description: "Performance running shoes designed for everyday training with responsive cushioning and a comfortable fit.",
    shortDescription: "Performance running shoes for everyday training.",
    isFeatured: true,
    isActive: true,
    tags: ["sports", "running-shoes", "nike", "pegasus"],
    ratingsAverage: 4.8,
    ratingsCount: 56,
  },
  {
    name: "Nike Revolution 7",
    sku: "NIK-SPT-002",
    stock: 26,
    category: SPORTS_CATEGORY_ID,
    brand: BRANDS.NIKE,
    price: 4995,
    discountPrice: 3695,
    description: "Lightweight running shoes designed for comfortable daily runs, walking, and active lifestyles.",
    shortDescription: "Lightweight running shoes for daily runs and walking.",
    isFeatured: false,
    isActive: true,
    tags: ["sports", "running-shoes", "nike", "revolution"],
    ratingsAverage: 4.5,
    ratingsCount: 42,
  },
  {
    name: "Adidas Ultraboost 5",
    sku: "ADI-SPT-003",
    stock: 14,
    category: SPORTS_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    price: 17999,
    discountPrice: 15999,
    description: "Premium running shoes designed with responsive cushioning for comfortable long-distance running.",
    shortDescription: "Premium running shoes with responsive cushioning.",
    isFeatured: true,
    isActive: true,
    tags: ["sports", "running-shoes", "adidas", "ultraboost"],
    ratingsAverage: 4.9,
    ratingsCount: 68,
  },
  {
    name: "Adidas Predator League Football",
    sku: "ADI-SPT-004",
    stock: 22,
    category: SPORTS_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    price: 1599,
    discountPrice: 1299,
    description: "Football designed for training and recreational play with a durable construction.",
    shortDescription: "Durable training football for recreational play.",
    isFeatured: false,
    isActive: true,
    tags: ["sports", "football", "adidas", "predator"],
    ratingsAverage: 4.6,
    ratingsCount: 37,
  },
  {
    name: "Puma UltraRide Men's Running and Gym Shoes",
    sku: "PUM-SPT-005",
    stock: 20,
    category: SPORTS_CATEGORY_ID,
    brand: BRANDS.PUMA,
    price: 8999,
    discountPrice: 4049,
    description: "Versatile running and gym shoes designed for active training and everyday athletic use.",
    shortDescription: "Versatile running and gym shoes for active training.",
    isFeatured: true,
    isActive: true,
    tags: ["sports", "running-shoes", "puma", "gym-shoes"],
    ratingsAverage: 4.6,
    ratingsCount: 45,
  },
  {
    name: "Puma Electrify NITRO 4 Men's Running Shoes",
    sku: "PUM-SPT-006",
    stock: 16,
    category: SPORTS_CATEGORY_ID,
    brand: BRANDS.PUMA,
    price: 8999,
    discountPrice: 6299,
    description: "Performance running shoes designed with responsive cushioning for daily running and training.",
    shortDescription: "Performance running shoes with responsive NITRO cushioning.",
    isFeatured: true,
    isActive: true,
    tags: ["sports", "running-shoes", "puma", "nitro"],
    ratingsAverage: 4.7,
    ratingsCount: 29,
  },
  {
    name: "Puma Cricket Square Men's Shoes",
    sku: "PUM-SPT-007",
    stock: 21,
    category: SPORTS_CATEGORY_ID,
    brand: BRANDS.PUMA,
    price: 4999,
    discountPrice: 2249,
    description: "Cricket footwear designed for stability and comfortable movement on the cricket field.",
    shortDescription: "Cricket shoes designed for field stability and comfort.",
    isFeatured: false,
    isActive: true,
    tags: ["sports", "cricket-shoes", "puma", "cricket"],
    ratingsAverage: 4.5,
    ratingsCount: 24,
  },
  {
    name: "Decathlon Kiprun KS Light Running Shoes",
    sku: "DEC-SPT-008",
    stock: 30,
    category: SPORTS_CATEGORY_ID,
    brand: BRANDS.DECATHLON,
    price: 3999,
    discountPrice: 2999,
    description: "Lightweight running shoes designed for regular training and comfortable everyday running.",
    shortDescription: "Lightweight running shoes for regular training.",
    isFeatured: false,
    isActive: true,
    tags: ["sports", "running-shoes", "decathlon", "kiprun"],
    ratingsAverage: 4.4,
    ratingsCount: 38,
  },
  {
    name: "Yonex ASTROX 99 PRO Badminton Racket",
    sku: "YON-SPT-009",
    stock: 10,
    category: SPORTS_CATEGORY_ID,
    brand: BRANDS.YONEX,
    price: 19999,
    discountPrice: 17999,
    description: "Advanced badminton racket from the ASTROX series designed for powerful attacking play.",
    shortDescription: "Advanced badminton racket designed for powerful attacks.",
    isFeatured: true,
    isActive: true,
    tags: ["sports", "badminton", "yonex", "astrox", "racket"],
    ratingsAverage: 4.9,
    ratingsCount: 41,
  },
  {
    name: "Yonex ASTROX 100ZZ Badminton Racket",
    sku: "YON-SPT-010",
    stock: 12,
    category: SPORTS_CATEGORY_ID,
    brand: BRANDS.YONEX,
    price: 22999,
    discountPrice: 19999,
    description: "High-performance badminton racket from the ASTROX series designed for aggressive and powerful play.",
    shortDescription: "High-performance badminton racket for aggressive play.",
    isFeatured: true,
    isActive: true,
    tags: ["sports", "badminton", "yonex", "astrox-100zz", "racket"],
    ratingsAverage: 4.9,
    ratingsCount: 55,
  }
];

const seedSportsProducts = async () => {
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
    console.log('       SPORTS PRODUCTS SEEDING COMPLETE  ');
    console.log('========================================');
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('\x1b[32m[SUCCESS] MongoDB connection closed.\x1b[0m');
  } catch (err) {
    console.error('\x1b[31m[ERROR] Failed to seed sports products:\x1b[0m', err);
    process.exit(1);
  }
};

seedSportsProducts();
