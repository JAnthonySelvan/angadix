import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const KITCHEN_CATEGORY_ID = '6a76f0120df34ecbc1327fd3';

const BRANDS = {
  PHILIPS: '6a76f4920df34ecbc1327fda',
  PRESTIGE: '6a76f4920df34ecbc1327fdb',
  HAVELLS: '6a76f4920df34ecbc1327fdc',
  BAJAJ: '6a76f4920df34ecbc1327fdd',
  PIGEON: '6a76f4920df34ecbc1327fde',
};

const rawProductsData = [
  {
    name: "Prestige Omega Deluxe Non-Stick Fry Pan 24cm",
    sku: "PRE-FRY-24",
    stock: 45,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PRESTIGE,
    sellingPrice: 899,
    originalMRP: 1199,
    description: "Premium non-stick fry pan designed for everyday cooking with easy food release and convenient cleaning.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=800"
  },
  {
    name: "Prestige Aluminium Pressure Cooker 3L",
    sku: "PRE-PC-3L",
    stock: 32,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PRESTIGE,
    sellingPrice: 1299,
    originalMRP: 1599,
    description: "Durable aluminium pressure cooker suitable for everyday cooking and multiple Indian recipes.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800"
  },
  {
    name: "Prestige Stainless Steel Dinner Set 24 Pcs",
    sku: "PRE-DS-24",
    stock: 18,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PRESTIGE,
    sellingPrice: 2499,
    originalMRP: 3199,
    description: "Elegant stainless steel dinner set designed for everyday dining and family occasions.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800"
  },
  {
    name: "Prestige Non-Stick Cookware Set 3 Pcs",
    sku: "PRE-CWS-3",
    stock: 25,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PRESTIGE,
    sellingPrice: 1799,
    originalMRP: 2499,
    description: "Convenient three-piece non-stick cookware set for everyday cooking.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=800"
  },
  {
    name: "Prestige Stainless Steel Kadai 2.5L",
    sku: "PRE-KAD-25",
    stock: 40,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PRESTIGE,
    sellingPrice: 1099,
    originalMRP: 1399,
    description: "Stainless steel kadai with durable construction suitable for everyday cooking.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800"
  },
  {
    name: "Pigeon Electric Kettle 1.5L",
    sku: "PIG-EK-15",
    stock: 55,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PIGEON,
    sellingPrice: 699,
    originalMRP: 999,
    description: "Compact electric kettle for quickly preparing hot water, tea, coffee, and other beverages.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?q=80&w=800"
  },
  {
    name: "Pigeon Stainless Steel Tawa 28cm",
    sku: "PIG-TAW-28",
    stock: 38,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PIGEON,
    sellingPrice: 549,
    originalMRP: 749,
    description: "Durable stainless steel tawa suitable for preparing dosas, rotis, parathas, and more.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=800"
  },
  {
    name: "Pigeon Non-Stick Fry Pan 26cm",
    sku: "PIG-FRY-26",
    stock: 42,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PIGEON,
    sellingPrice: 649,
    originalMRP: 899,
    description: "Non-stick fry pan designed for low-oil cooking and easy cleaning.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=800"
  },
  {
    name: "Pigeon Stainless Steel Cookware Set 5 Pcs",
    sku: "PIG-CWS-5",
    stock: 20,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PIGEON,
    sellingPrice: 1499,
    originalMRP: 2099,
    description: "Five-piece stainless steel cookware set designed for versatile everyday cooking.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800"
  },
  {
    name: "Pigeon Kitchen Storage Container Set 6 Pcs",
    sku: "PIG-KSC-6",
    stock: 60,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PIGEON,
    sellingPrice: 499,
    originalMRP: 699,
    description: "Practical six-piece storage container set for organizing kitchen ingredients.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800"
  },
  {
    name: "Philips Daily Collection Electric Kettle 1.5L",
    sku: "PHI-EK-15",
    stock: 35,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PHILIPS,
    sellingPrice: 1499,
    originalMRP: 1899,
    description: "Modern electric kettle designed for fast and convenient hot water preparation.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?q=80&w=800"
  },
  {
    name: "Philips Hand Blender 300W",
    sku: "PHI-HB-300",
    stock: 28,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PHILIPS,
    sellingPrice: 1799,
    originalMRP: 2299,
    description: "Compact hand blender suitable for blending soups, sauces, smoothies, and other food preparations.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800"
  },
  {
    name: "Philips Daily Collection Toaster 2 Slice",
    sku: "PHI-TST-2S",
    stock: 22,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PHILIPS,
    sellingPrice: 1299,
    originalMRP: 1699,
    description: "Two-slice toaster designed for quick and convenient breakfast preparation.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800"
  },
  {
    name: "Philips Kitchen Digital Scale 5kg",
    sku: "PHI-DS-5K",
    stock: 50,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PHILIPS,
    sellingPrice: 899,
    originalMRP: 1199,
    description: "Compact digital kitchen scale for accurate ingredient measurements.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800"
  },
  {
    name: "Philips Air Fryer 4.1L",
    sku: "PHI-AF-41",
    stock: 15,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.PHILIPS,
    sellingPrice: 5499,
    originalMRP: 6999,
    description: "Large-capacity air fryer designed for convenient low-oil cooking and crispy meals.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1626509682676-e41c49b6b7a9?q=80&w=800"
  },
  {
    name: "Bajaj Majesty Electric Kettle 1.8L",
    sku: "BAJ-EK-18",
    stock: 44,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.BAJAJ,
    sellingPrice: 849,
    originalMRP: 1199,
    description: "High-capacity electric kettle suitable for preparing hot beverages and boiling water.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?q=80&w=800"
  },
  {
    name: "Bajaj Majesty Toaster 2 Slice",
    sku: "BAJ-TST-2S",
    stock: 30,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.BAJAJ,
    sellingPrice: 999,
    originalMRP: 1299,
    description: "Two-slice toaster with convenient controls for everyday breakfast preparation.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800"
  },
  {
    name: "Bajaj Hand Blender 300W",
    sku: "BAJ-HB-300",
    stock: 26,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.BAJAJ,
    sellingPrice: 1099,
    originalMRP: 1499,
    description: "Powerful hand blender designed for blending, mixing, and preparing everyday recipes.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800"
  },
  {
    name: "Havells Aqua Plus Electric Kettle 1.2L",
    sku: "HAV-EK-12",
    stock: 33,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.HAVELLS,
    sellingPrice: 1399,
    originalMRP: 1799,
    description: "Stylish electric kettle with compact design for convenient daily use.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?q=80&w=800"
  },
  {
    name: "Havells Air Fryer Pro 4L",
    sku: "HAV-AF-4L",
    stock: 17,
    category: KITCHEN_CATEGORY_ID,
    brand: BRANDS.HAVELLS,
    sellingPrice: 4499,
    originalMRP: 5999,
    description: "Modern 4L air fryer designed for convenient cooking with reduced oil usage.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1626509682676-e41c49b6b7a9?q=80&w=800"
  }
];

const seedKitchenProducts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/angadix';
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log(`Connected to database.`);

    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne({ email: 'admin@gmail.com' });
    }
    if (!adminUser) {
      console.log('Admin user not found. Creating default admin user (admin@gmail.com)...');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'Admin@123',
        role: 'admin',
        isEmailVerified: true,
      });
      console.log('Created default admin user.');
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of rawProductsData) {
      const price = item.originalMRP || item.sellingPrice;
      const discountPrice = item.sellingPrice < price ? item.sellingPrice : null;

      const productDoc = {
        name: item.name,
        sku: item.sku,
        stock: item.stock,
        category: new mongoose.Types.ObjectId(item.category),
        brand: new mongoose.Types.ObjectId(item.brand),
        price: price,
        discountPrice: discountPrice,
        currency: 'INR',
        description: item.description,
        shortDescription: item.description,
        isFeatured: Boolean(item.featured),
        isActive: Boolean(item.isActive),
        ratingsAverage: 4.5,
        ratingsCount: 12,
        createdBy: adminUser._id,
        images: [
          {
            url: item.imageUrl,
            publicId: `seed_kitchen_${item.sku.toLowerCase()}`,
            isPrimary: true,
          },
        ],
      };

      const existing = await Product.findOne({ sku: item.sku });
      if (existing) {
        Object.assign(existing, productDoc);
        await existing.save();
        updatedCount++;
      } else {
        const newProduct = new Product(productDoc);
        await newProduct.save();
        insertedCount++;
      }
    }

    console.log(`\n\x1b[32m[SUCCESS] Kitchen & Dining products seeded successfully!\x1b[0m`);
    console.log(`- Inserted: ${insertedCount}`);
    console.log(`- Updated: ${updatedCount}`);
    console.log(`- Total Processed: ${rawProductsData.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[ERROR] Seeding kitchen products failed:\x1b[0m', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedKitchenProducts();
