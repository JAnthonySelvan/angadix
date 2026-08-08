import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const FURNITURE_CATEGORY_ID = '6a76f0120df34ecbc1327fd5';

const BRANDS = {
  IKEA: '6a7704fc0df34ecbc1327fe4',
  GODREJ: '6a7704fc0df34ecbc1327fe5',
  WAKEFIT: '6a7704fc0df34ecbc1327fe6',
  NILKAMAL: '6a7704fc0df34ecbc1327fe7',
  DURIAN: '6a7704fc0df34ecbc1327fe8',
};

const rawProductsData = [
  {
    name: "IKEA LACK Modern Coffee Table",
    sku: "IKEA-CT-001",
    stock: 25,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.IKEA,
    sellingPrice: 2499,
    originalMRP: 3299,
    description: "Minimalist modern coffee table with a clean design, perfect for living rooms and compact spaces.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800"
  },
  {
    name: "IKEA MALM 4 Drawer Chest",
    sku: "IKEA-DC-002",
    stock: 15,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.IKEA,
    sellingPrice: 8999,
    originalMRP: 10999,
    description: "Modern four-drawer storage chest with a sleek design suitable for bedrooms and dressing areas.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800"
  },
  {
    name: "IKEA LINNMON Study Table",
    sku: "IKEA-ST-003",
    stock: 30,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.IKEA,
    sellingPrice: 3999,
    originalMRP: 4999,
    description: "Simple and functional study table designed for home offices, students, and everyday work.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800"
  },
  {
    name: "IKEA POANG Lounge Chair",
    sku: "IKEA-LC-004",
    stock: 12,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.IKEA,
    sellingPrice: 7499,
    originalMRP: 8999,
    description: "Comfortable lounge chair with a modern frame designed for relaxing and reading.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1580481072645-022f9a6d1276?q=80&w=800"
  },
  {
    name: "IKEA KALLAX Storage Shelf",
    sku: "IKEA-SS-005",
    stock: 20,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.IKEA,
    sellingPrice: 5999,
    originalMRP: 7499,
    description: "Versatile open storage shelf suitable for books, decor, accessories, and household organization.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800"
  },
  {
    name: "Godrej Interio Slimline 2 Door Wardrobe",
    sku: "GOD-WD-006",
    stock: 10,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.GODREJ,
    sellingPrice: 14999,
    originalMRP: 18999,
    description: "Durable two-door wardrobe offering practical storage for clothes and household essentials.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800"
  },
  {
    name: "Godrej Interio Office Study Desk",
    sku: "GOD-DS-007",
    stock: 18,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.GODREJ,
    sellingPrice: 6999,
    originalMRP: 8499,
    description: "Professional study and office desk with a spacious work surface and contemporary design.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800"
  },
  {
    name: "Godrej Interio Ergonomic Office Chair",
    sku: "GOD-OC-008",
    stock: 22,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.GODREJ,
    sellingPrice: 8499,
    originalMRP: 10999,
    description: "Ergonomic office chair designed to provide comfortable seating during long working hours.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1580481072645-022f9a6d1276?q=80&w=800"
  },
  {
    name: "Godrej Interio 3 Seater Sofa",
    sku: "GOD-SF-009",
    stock: 8,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.GODREJ,
    sellingPrice: 24999,
    originalMRP: 29999,
    description: "Spacious three-seater sofa with a contemporary design suitable for modern living rooms.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800"
  },
  {
    name: "Godrej Interio Bedside Table",
    sku: "GOD-BT-010",
    stock: 25,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.GODREJ,
    sellingPrice: 2999,
    originalMRP: 3999,
    description: "Compact bedside table with convenient storage for bedrooms.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800"
  },
  {
    name: "Wakefit Orthopedic Bed Frame",
    sku: "WAK-BF-011",
    stock: 14,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.WAKEFIT,
    sellingPrice: 11999,
    originalMRP: 14999,
    description: "Strong and modern bed frame designed for comfortable and reliable everyday use.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800"
  },
  {
    name: "Wakefit Engineered Wood Study Table",
    sku: "WAK-ST-012",
    stock: 20,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.WAKEFIT,
    sellingPrice: 4499,
    originalMRP: 5999,
    description: "Compact engineered wood study table ideal for bedrooms, study rooms, and home offices.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800"
  },
  {
    name: "Wakefit Fabric Lounge Chair",
    sku: "WAK-LC-013",
    stock: 16,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.WAKEFIT,
    sellingPrice: 7999,
    originalMRP: 9999,
    description: "Stylish fabric lounge chair designed for comfortable seating and modern interiors.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1580481072645-022f9a6d1276?q=80&w=800"
  },
  {
    name: "Wakefit 2 Seater Fabric Sofa",
    sku: "WAK-SF-014",
    stock: 10,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.WAKEFIT,
    sellingPrice: 15999,
    originalMRP: 19999,
    description: "Comfortable two-seater fabric sofa with a contemporary design for compact living spaces.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800"
  },
  {
    name: "Wakefit Bedside Table with Drawer",
    sku: "WAK-BT-015",
    stock: 28,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.WAKEFIT,
    sellingPrice: 2499,
    originalMRP: 3299,
    description: "Compact bedside table featuring a drawer for convenient storage and organization.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800"
  },
  {
    name: "Nilkamal Plastic Storage Cabinet",
    sku: "NIL-SC-016",
    stock: 35,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.NILKAMAL,
    sellingPrice: 4999,
    originalMRP: 6499,
    description: "Lightweight and durable storage cabinet suitable for bedrooms, kitchens, and utility areas.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800"
  },
  {
    name: "Nilkamal Dining Chair Set of 2",
    sku: "NIL-DC-017",
    stock: 40,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.NILKAMAL,
    sellingPrice: 2999,
    originalMRP: 3999,
    description: "Durable dining chair set designed for comfortable everyday seating.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1580481072645-022f9a6d1276?q=80&w=800"
  },
  {
    name: "Durian Contemporary 3 Door Wardrobe",
    sku: "DUR-WD-018",
    stock: 7,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.DURIAN,
    sellingPrice: 21999,
    originalMRP: 27999,
    description: "Premium three-door wardrobe offering generous storage with a sophisticated contemporary finish.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800"
  },
  {
    name: "Durian Modern Recliner Chair",
    sku: "DUR-RC-019",
    stock: 9,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.DURIAN,
    sellingPrice: 17999,
    originalMRP: 22999,
    description: "Premium recliner chair designed for comfortable relaxation with a modern living-room appearance.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1580481072645-022f9a6d1276?q=80&w=800"
  },
  {
    name: "Durian Premium Dining Table 6 Seater",
    sku: "DUR-DT-020",
    stock: 6,
    category: FURNITURE_CATEGORY_ID,
    brand: BRANDS.DURIAN,
    sellingPrice: 24999,
    originalMRP: 31999,
    description: "Elegant six-seater dining table designed for spacious dining areas and family gatherings.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=800"
  }
];

const seedFurnitureProducts = async () => {
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
        ratingsAverage: 4.6,
        ratingsCount: 18,
        createdBy: adminUser._id,
        images: [
          {
            url: item.imageUrl,
            publicId: `seed_furniture_${item.sku.toLowerCase()}`,
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

    console.log(`\n\x1b[32m[SUCCESS] Furniture products seeded successfully!\x1b[0m`);
    console.log(`- Inserted: ${insertedCount}`);
    console.log(`- Updated: ${updatedCount}`);
    console.log(`- Total Processed: ${rawProductsData.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[ERROR] Seeding furniture products failed:\x1b[0m', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedFurnitureProducts();
