import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const HAIR_CARE_CATEGORY_ID = '6a77b7e382a71bf7a5379a25';

const BRANDS = {
  LOREAL: '6a77b9fd82a71bf7a5379a29',
  MAYBELLINE: '6a77b9fd82a71bf7a5379a2a',
  LAKME: '6a77b9fd82a71bf7a5379a2b',
  NIVEA: '6a77b9fd82a71bf7a5379a2c',
  THE_BODY_SHOP: '6a77b9fd82a71bf7a5379a2d',
};

const rawProducts = [
  {
    name: "L'Oréal Paris Total Repair 5 Shampoo",
    sku: "LOR-HC-001",
    stock: 35,
    category: HAIR_CARE_CATEGORY_ID,
    brand: BRANDS.LOREAL,
    price: 599,
    discountPrice: 449,
    description: "Nourishing shampoo designed for damaged and dry-looking hair, helping leave hair feeling smoother and healthier.",
    shortDescription: "Nourishing shampoo for damaged and dry-looking hair.",
    isFeatured: true,
    isActive: true,
    tags: ["haircare", "shampoo", "loreal", "hair-repair"],
    ratingsAverage: 4.6,
    ratingsCount: 42,
  },
  {
    name: "L'Oréal Paris Dream Lengths Conditioner",
    sku: "LOR-HC-002",
    stock: 28,
    category: HAIR_CARE_CATEGORY_ID,
    brand: BRANDS.LOREAL,
    price: 649,
    discountPrice: 499,
    description: "Conditioner designed to nourish lengths and help leave hair soft, smooth, and manageable.",
    shortDescription: "Conditioner nourishing hair lengths for smooth and manageable hair.",
    isFeatured: false,
    isActive: true,
    tags: ["haircare", "conditioner", "loreal", "smooth"],
    ratingsAverage: 4.5,
    ratingsCount: 26,
  },
  {
    name: "Maybelline Hair Care Nourishing Hair Serum",
    sku: "MAY-HC-003",
    stock: 24,
    category: HAIR_CARE_CATEGORY_ID,
    brand: BRANDS.MAYBELLINE,
    price: 799,
    discountPrice: 599,
    description: "Lightweight hair serum designed to add smoothness and shine while helping control frizz.",
    shortDescription: "Lightweight hair serum for smoothness and frizz control.",
    isFeatured: true,
    isActive: true,
    tags: ["haircare", "hair-serum", "maybelline", "frizz-control"],
    ratingsAverage: 4.7,
    ratingsCount: 31,
  },
  {
    name: "Maybelline Daily Hair Repair Mask",
    sku: "MAY-HC-004",
    stock: 19,
    category: HAIR_CARE_CATEGORY_ID,
    brand: BRANDS.MAYBELLINE,
    price: 899,
    discountPrice: 699,
    description: "Deep-conditioning hair mask designed to provide nourishment and improve the feel of dry and rough hair.",
    shortDescription: "Deep-conditioning hair mask for dry and rough hair.",
    isFeatured: false,
    isActive: true,
    tags: ["haircare", "hair-mask", "maybelline", "deep-conditioning"],
    ratingsAverage: 4.4,
    ratingsCount: 18,
  },
  {
    name: "Lakmé Nourishing Hair Oil",
    sku: "LAK-HC-005",
    stock: 42,
    category: HAIR_CARE_CATEGORY_ID,
    brand: BRANDS.LAKME,
    price: 449,
    discountPrice: 349,
    description: "Lightweight nourishing hair oil designed for regular scalp and hair care.",
    shortDescription: "Lightweight hair oil for regular scalp and hair nourishment.",
    isFeatured: false,
    isActive: true,
    tags: ["haircare", "hair-oil", "lakme", "scalp-care"],
    ratingsAverage: 4.6,
    ratingsCount: 50,
  },
  {
    name: "Lakmé Smooth & Shine Hair Serum",
    sku: "LAK-HC-006",
    stock: 31,
    category: HAIR_CARE_CATEGORY_ID,
    brand: BRANDS.LAKME,
    price: 599,
    discountPrice: 449,
    description: "Smoothening hair serum designed to reduce the appearance of frizz and add a glossy finish.",
    shortDescription: "Smoothening hair serum for frizz reduction and glossy shine.",
    isFeatured: true,
    isActive: true,
    tags: ["haircare", "serum", "lakme", "shine"],
    ratingsAverage: 4.5,
    ratingsCount: 29,
  },
  {
    name: "NIVEA Nourishing Hair Shampoo",
    sku: "NIV-HC-007",
    stock: 46,
    category: HAIR_CARE_CATEGORY_ID,
    brand: BRANDS.NIVEA,
    price: 499,
    discountPrice: 399,
    description: "Gentle everyday shampoo designed to cleanse hair while maintaining a soft and comfortable feel.",
    shortDescription: "Gentle everyday shampoo leaving hair soft and clean.",
    isFeatured: false,
    isActive: true,
    tags: ["haircare", "shampoo", "nivea", "everyday"],
    ratingsAverage: 4.6,
    ratingsCount: 64,
  },
  {
    name: "NIVEA Hair Repair Conditioner",
    sku: "NIV-HC-008",
    stock: 34,
    category: HAIR_CARE_CATEGORY_ID,
    brand: BRANDS.NIVEA,
    price: 549,
    discountPrice: 429,
    description: "Conditioner designed to improve hair softness and manageability for everyday styling.",
    shortDescription: "Conditioner improving hair softness and manageability.",
    isFeatured: false,
    isActive: true,
    tags: ["haircare", "conditioner", "nivea", "repair"],
    ratingsAverage: 4.4,
    ratingsCount: 38,
  },
  {
    name: "The Body Shop Ginger Scalp Care Shampoo",
    sku: "TBS-HC-009",
    stock: 22,
    category: HAIR_CARE_CATEGORY_ID,
    brand: BRANDS.THE_BODY_SHOP,
    price: 1299,
    discountPrice: 999,
    description: "Refreshing scalp-care shampoo designed to gently cleanse the hair and scalp.",
    shortDescription: "Refreshing ginger scalp-care shampoo.",
    isFeatured: true,
    isActive: true,
    tags: ["haircare", "shampoo", "ginger", "the-body-shop", "scalp-care"],
    ratingsAverage: 4.8,
    ratingsCount: 35,
  },
  {
    name: "The Body Shop Shea Hair Mask",
    sku: "TBS-HC-010",
    stock: 18,
    category: HAIR_CARE_CATEGORY_ID,
    brand: BRANDS.THE_BODY_SHOP,
    price: 1499,
    discountPrice: 1199,
    description: "Rich hair treatment designed to nourish dry-looking hair and leave it feeling soft and conditioned.",
    shortDescription: "Rich shea hair treatment nourishing dry hair.",
    isFeatured: true,
    isActive: true,
    tags: ["haircare", "hair-mask", "shea", "the-body-shop"],
    ratingsAverage: 4.7,
    ratingsCount: 23,
  }
];

const seedHairCareProducts = async () => {
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
    console.log('   HAIR CARE PRODUCTS SEEDING COMPLETE  ');
    console.log('========================================');
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('\x1b[32m[SUCCESS] MongoDB connection closed.\x1b[0m');
  } catch (err) {
    console.error('\x1b[31m[ERROR] Failed to seed hair care products:\x1b[0m', err);
    process.exit(1);
  }
};

seedHairCareProducts();
