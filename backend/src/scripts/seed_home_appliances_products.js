import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const HOME_APPLIANCES_CATEGORY_ID = '6a76f0120df34ecbc1327fd7';

const BRANDS = {
  PHILIPS: '6a76f4920df34ecbc1327fda',
  PRESTIGE: '6a76f4920df34ecbc1327fdb',
  HAVELLS: '6a76f4920df34ecbc1327fdc',
  BAJAJ: '6a76f4920df34ecbc1327fdd',
  PIGEON: '6a76f4920df34ecbc1327fde',
};

const rawProductsData = [
  {
    name: "Philips 4.1L Digital Air Fryer",
    sku: "PHI-AF-401",
    stock: 18,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.PHILIPS,
    sellingPrice: 5499,
    originalMRP: 6999,
    description: "Digital air fryer designed for convenient low-oil cooking with multiple temperature and timer settings.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1626509682676-e41c49b6b7a9?q=80&w=800"
  },
  {
    name: "Philips 750W Mixer Grinder",
    sku: "PHI-MG-750",
    stock: 25,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.PHILIPS,
    sellingPrice: 3999,
    originalMRP: 4999,
    description: "Powerful mixer grinder suitable for grinding spices, preparing chutneys, smoothies, and everyday cooking ingredients.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=800"
  },
  {
    name: "Philips 1.5L Electric Kettle",
    sku: "PHI-EK-150",
    stock: 42,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.PHILIPS,
    sellingPrice: 1499,
    originalMRP: 1899,
    description: "Fast-boiling electric kettle with a compact design for tea, coffee, and hot water preparation.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?q=80&w=800"
  },
  {
    name: "Philips 1000W Induction Cooktop",
    sku: "PHI-IC-1000",
    stock: 30,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.PHILIPS,
    sellingPrice: 2299,
    originalMRP: 2999,
    description: "Compact induction cooktop with adjustable temperature controls for convenient everyday cooking.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
  },
  {
    name: "Philips 750W Juicer Mixer Grinder",
    sku: "PHI-JMG-750",
    stock: 20,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.PHILIPS,
    sellingPrice: 4499,
    originalMRP: 5699,
    description: "Multi-purpose juicer mixer grinder designed for preparing fresh juices, smoothies, chutneys, and spice blends.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=800"
  },
  {
    name: "Bajaj 3L Air Fryer",
    sku: "BAJ-AF-300",
    stock: 22,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.BAJAJ,
    sellingPrice: 3299,
    originalMRP: 4299,
    description: "Compact air fryer designed for quick and convenient low-oil cooking.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1626509682676-e41c49b6b7a9?q=80&w=800"
  },
  {
    name: "Bajaj 750W Mixer Grinder",
    sku: "BAJ-MG-750",
    stock: 28,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.BAJAJ,
    sellingPrice: 2999,
    originalMRP: 3999,
    description: "Powerful mixer grinder with multiple jars for blending, grinding, and food preparation.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=800"
  },
  {
    name: "Bajaj 1.8L Electric Kettle",
    sku: "BAJ-EK-180",
    stock: 45,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.BAJAJ,
    sellingPrice: 849,
    originalMRP: 1199,
    description: "High-capacity electric kettle suitable for boiling water and preparing hot beverages.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?q=80&w=800"
  },
  {
    name: "Bajaj 2 Slice Pop-Up Toaster",
    sku: "BAJ-TST-002",
    stock: 32,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.BAJAJ,
    sellingPrice: 999,
    originalMRP: 1399,
    description: "Two-slice pop-up toaster with adjustable browning controls for convenient breakfast preparation.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800"
  },
  {
    name: "Bajaj 500W Hand Blender",
    sku: "BAJ-HB-500",
    stock: 26,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.BAJAJ,
    sellingPrice: 1299,
    originalMRP: 1699,
    description: "Compact hand blender suitable for blending soups, sauces, smoothies, and other food preparations.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800"
  },
  {
    name: "Havells 5L Digital Air Fryer",
    sku: "HAV-AF-500",
    stock: 14,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.HAVELLS,
    sellingPrice: 4999,
    originalMRP: 6499,
    description: "Large-capacity digital air fryer with temperature control and timer for convenient everyday cooking.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1626509682676-e41c49b6b7a9?q=80&w=800"
  },
  {
    name: "Havells 1.2L Electric Kettle",
    sku: "HAV-EK-120",
    stock: 36,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.HAVELLS,
    sellingPrice: 1399,
    originalMRP: 1799,
    description: "Stylish compact electric kettle designed for fast boiling and convenient daily use.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?q=80&w=800"
  },
  {
    name: "Havells 750W Mixer Grinder",
    sku: "HAV-MG-750",
    stock: 24,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.HAVELLS,
    sellingPrice: 3499,
    originalMRP: 4499,
    description: "High-performance mixer grinder designed for grinding spices, blending ingredients, and preparing food.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=800"
  },
  {
    name: "Havells 2000W Induction Cooktop",
    sku: "HAV-IC-2000",
    stock: 19,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.HAVELLS,
    sellingPrice: 2799,
    originalMRP: 3499,
    description: "Powerful induction cooktop with digital controls and multiple cooking modes.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
  },
  {
    name: "Havells 2 Slice Pop-Up Toaster",
    sku: "HAV-TST-002",
    stock: 27,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.HAVELLS,
    sellingPrice: 1199,
    originalMRP: 1599,
    description: "Modern two-slice toaster with adjustable browning levels for quick breakfast preparation.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800"
  },
  {
    name: "Prestige 4.5L Air Fryer",
    sku: "PRE-AF-450",
    stock: 21,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.PRESTIGE,
    sellingPrice: 3999,
    originalMRP: 4999,
    description: "Spacious air fryer designed for healthier cooking with less oil and convenient temperature control.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1626509682676-e41c49b6b7a9?q=80&w=800"
  },
  {
    name: "Prestige 750W Mixer Grinder",
    sku: "PRE-MG-750",
    stock: 29,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.PRESTIGE,
    sellingPrice: 3299,
    originalMRP: 4299,
    description: "Durable mixer grinder with multiple jars for grinding, blending, and everyday kitchen preparation.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=800"
  },
  {
    name: "Prestige 1600W Induction Cooktop",
    sku: "PRE-IC-1600",
    stock: 23,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.PRESTIGE,
    sellingPrice: 2199,
    originalMRP: 2899,
    description: "Efficient induction cooktop with preset cooking functions and adjustable temperature controls.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
  },
  {
    name: "Pigeon 1.5L Electric Kettle",
    sku: "PIG-EK-150",
    stock: 52,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.PIGEON,
    sellingPrice: 699,
    originalMRP: 999,
    description: "Affordable electric kettle with a compact design for boiling water and preparing hot beverages.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?q=80&w=800"
  },
  {
    name: "Pigeon 750W Mixer Grinder",
    sku: "PIG-MG-750",
    stock: 34,
    category: HOME_APPLIANCES_CATEGORY_ID,
    brand: BRANDS.PIGEON,
    sellingPrice: 2499,
    originalMRP: 3299,
    description: "Reliable mixer grinder designed for blending, grinding spices, preparing chutneys, and everyday cooking.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=800"
  }
];

const seedHomeAppliancesProducts = async () => {
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
        ratingsCount: 15,
        createdBy: adminUser._id,
        images: [
          {
            url: item.imageUrl,
            publicId: `seed_home_appliances_${item.sku.toLowerCase()}`,
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

    console.log(`\n\x1b[32m[SUCCESS] Home Appliances products seeded successfully!\x1b[0m`);
    console.log(`- Inserted: ${insertedCount}`);
    console.log(`- Updated: ${updatedCount}`);
    console.log(`- Total Processed: ${rawProductsData.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[ERROR] Seeding home appliances products failed:\x1b[0m', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedHomeAppliancesProducts();
