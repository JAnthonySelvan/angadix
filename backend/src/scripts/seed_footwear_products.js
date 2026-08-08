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

const FOOTWEAR_CATEGORY_ID = '6a7739117481e2c7945ab9d7';

const BRANDS = {
  NIKE: '6a773cbb7481e2c7945ab9dc',
  ADIDAS: '6a773cbb7481e2c7945ab9dd',
  PUMA: '6a773cbb7481e2c7945ab9de',
  LEVIS: '6a773cbb7481e2c7945ab9df',
  HM: '6a773cbb7481e2c7945ab9e0',
};

const brandDetails = [
  {
    _id: BRANDS.NIKE,
    name: 'Nike',
    slug: 'nike',
    description: 'A global sportswear and fashion brand offering footwear, clothing, and lifestyle products.',
    logo: {
      url: 'https://res.cloudinary.com/wols4un8/image/upload/v1786199689/angadix/brands/jgbww8llxu3qwqxl9hee.png',
      publicId: 'angadix/brands/jgbww8llxu3qwqxl9hee',
    },
    isActive: true,
  },
  {
    _id: BRANDS.ADIDAS,
    name: 'Adidas',
    slug: 'adidas',
    description: 'A leading sportswear brand offering footwear, apparel, accessories, and lifestyle fashion products.',
    logo: {
      url: 'https://res.cloudinary.com/wols4un8/image/upload/v1786199332/angadix/brands/mwobe3p31rwkism9uidc.jpg',
      publicId: 'angadix/brands/mwobe3p31rwkism9uidc',
    },
    isActive: true,
  },
  {
    _id: BRANDS.PUMA,
    name: 'Puma',
    slug: 'puma',
    description: 'A global sports and lifestyle brand offering sneakers, clothing, sportswear, and fashion accessories.',
    logo: {
      url: 'https://res.cloudinary.com/wols4un8/image/upload/v1786199802/angadix/brands/zl1eqxmt3z8jh90c84mm.png',
      publicId: 'angadix/brands/zl1eqxmt3z8jh90c84mm',
    },
    isActive: true,
  },
  {
    _id: BRANDS.LEVIS,
    name: "Levi's",
    slug: 'levis',
    description: 'A renowned fashion brand specializing in denim, jeans, casual clothing, jackets, and lifestyle apparel.',
    logo: {
      url: 'https://res.cloudinary.com/wols4un8/image/upload/v1786199498/angadix/brands/xop4a4j8xltyjsybjmk0.jpg',
      publicId: 'angadix/brands/xop4a4j8xltyjsybjmk0',
    },
    isActive: true,
  },
  {
    _id: BRANDS.HM,
    name: 'H&M',
    slug: 'hm',
    description: 'A global fashion brand offering modern clothing, footwear, accessories, and everyday fashion for men, women, and children.',
    logo: {
      url: 'https://res.cloudinary.com/wols4un8/image/upload/v1786199402/angadix/brands/btaw8af4fpjpuoqndyzt.jpg',
      publicId: 'angadix/brands/btaw8af4fpjpuoqndyzt',
    },
    isActive: true,
  },
];

const rawProductsData = [
  {
    name: "Nike Air Max Everyday Sneakers",
    sku: "NIK-FW-001",
    stock: 24,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.NIKE,
    sellingPrice: 5499,
    originalMRP: 6999,
    description: "Modern everyday sneakers with a comfortable design suitable for casual outings and daily wear.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800"
  },
  {
    name: "Nike Revolution Running Shoes",
    sku: "NIK-FW-002",
    stock: 31,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.NIKE,
    sellingPrice: 4299,
    originalMRP: 5499,
    description: "Lightweight running shoes designed for comfortable training, jogging, and everyday active use.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800"
  },
  {
    name: "Nike Court Vision Casual Shoes",
    sku: "NIK-FW-003",
    stock: 18,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.NIKE,
    sellingPrice: 4999,
    originalMRP: 6499,
    description: "Classic casual sneakers with a clean court-inspired design for everyday outfits.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800"
  },
  {
    name: "Adidas Ultraboost Running Shoes",
    sku: "ADI-FW-004",
    stock: 16,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    sellingPrice: 7499,
    originalMRP: 9999,
    description: "Performance running shoes designed to provide responsive cushioning and comfortable movement.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800"
  },
  {
    name: "Adidas Grand Court Sneakers",
    sku: "ADI-FW-005",
    stock: 29,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    sellingPrice: 3999,
    originalMRP: 4999,
    description: "Versatile low-top sneakers with a timeless design suitable for casual everyday styling.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800"
  },
  {
    name: "Adidas Adilette Comfort Slides",
    sku: "ADI-FW-006",
    stock: 42,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    sellingPrice: 1999,
    originalMRP: 2499,
    description: "Comfortable slides designed for relaxed everyday wear, home use, and casual outings.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=800"
  },
  {
    name: "Puma Softride Walking Shoes",
    sku: "PUM-FW-007",
    stock: 27,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.PUMA,
    sellingPrice: 3499,
    originalMRP: 4499,
    description: "Comfort-focused walking shoes designed for daily walks, travel, and extended everyday use.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800"
  },
  {
    name: "Puma Smash V2 Casual Sneakers",
    sku: "PUM-FW-008",
    stock: 34,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.PUMA,
    sellingPrice: 2999,
    originalMRP: 3999,
    description: "Classic casual sneakers with a clean silhouette that pairs well with everyday outfits.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800"
  },
  {
    name: "Puma Sports Training Shoes",
    sku: "PUM-FW-009",
    stock: 21,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.PUMA,
    sellingPrice: 3799,
    originalMRP: 4999,
    description: "Versatile training shoes designed for gym workouts, fitness sessions, and active lifestyles.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=800"
  },
  {
    name: "Levi's Women's Casual Canvas Shoes",
    sku: "LEV-FW-010",
    stock: 25,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.LEVIS,
    sellingPrice: 2499,
    originalMRP: 3299,
    description: "Stylish canvas shoes designed for comfortable casual wear and everyday outfits.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800"
  },
  {
    name: "Levi's Men's Casual Lace-Up Shoes",
    sku: "LEV-FW-011",
    stock: 23,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.LEVIS,
    sellingPrice: 2999,
    originalMRP: 3999,
    description: "Classic lace-up casual shoes designed for versatile everyday styling and comfortable walking.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800"
  },
  {
    name: "Levi's Ankle Boots",
    sku: "LEV-FW-012",
    stock: 14,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.LEVIS,
    sellingPrice: 4499,
    originalMRP: 5999,
    description: "Contemporary ankle boots designed to add a rugged and stylish touch to casual outfits.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=800"
  },
  {
    name: "H&M Women's Strappy Sandals",
    sku: "HNM-FW-013",
    stock: 38,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.HM,
    sellingPrice: 1499,
    originalMRP: 1999,
    description: "Elegant strappy sandals designed for comfortable summer outfits and casual occasions.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?q=80&w=800"
  },
  {
    name: "H&M Women's Block Heel Sandals",
    sku: "HNM-FW-014",
    stock: 22,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.HM,
    sellingPrice: 2299,
    originalMRP: 2999,
    description: "Stylish block heel sandals designed for comfortable dressing and semi-formal occasions.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800"
  },
  {
    name: "H&M Unisex Casual Slip-On Shoes",
    sku: "HNM-FW-015",
    stock: 35,
    category: FOOTWEAR_CATEGORY_ID,
    brand: BRANDS.HM,
    sellingPrice: 1999,
    originalMRP: 2699,
    description: "Easy-to-wear slip-on shoes designed for comfortable everyday casual styling.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?q=80&w=800"
  }
];

const seedFootwearProducts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/angadix';
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log(`Connected to database.`);

    // 1. Ensure Admin User
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

    // 2. Ensure Category exists
    let category = await Category.findById(FOOTWEAR_CATEGORY_ID);
    if (!category) {
      category = await Category.findOne({ slug: 'footwear' });
    }
    if (!category) {
      console.log(`Category ${FOOTWEAR_CATEGORY_ID} not found. Creating Footwear category...`);
      category = await Category.create({
        _id: new mongoose.Types.ObjectId(FOOTWEAR_CATEGORY_ID),
        name: "Footwear",
        slug: 'footwear',
        description: 'Sneakers, running shoes, boots, sandals, and everyday footwear',
        image: {
          url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600',
          publicId: 'seed_cat_footwear',
        },
        isActive: true,
      });
      console.log("Created Footwear category.");
    }

    // 3. Ensure Brands exist
    for (const bData of brandDetails) {
      let b = await Brand.findById(bData._id);
      if (!b) {
        b = await Brand.findOne({ slug: bData.slug });
      }
      if (!b) {
        console.log(`Brand ${bData.name} (${bData._id}) not found. Creating brand...`);
        await Brand.create({
          _id: new mongoose.Types.ObjectId(bData._id),
          name: bData.name,
          slug: bData.slug,
          description: bData.description,
          logo: bData.logo,
          isActive: bData.isActive,
        });
        console.log(`Created brand ${bData.name}.`);
      }
    }

    // 4. Upsert Products
    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of rawProductsData) {
      // Mapping for Original MRP and Selling Price:
      // price -> originalMRP
      // discountPrice -> sellingPrice (if sellingPrice < originalMRP, else null)
      const price = Number(item.originalMRP);
      const discountPrice = Number(item.sellingPrice) < price ? Number(item.sellingPrice) : null;

      const productDoc = {
        name: item.name,
        sku: item.sku,
        stock: Number(item.stock),
        category: new mongoose.Types.ObjectId(item.category),
        brand: new mongoose.Types.ObjectId(item.brand),
        price: price,
        discountPrice: discountPrice,
        currency: 'INR',
        description: item.description,
        shortDescription: item.description,
        isFeatured: Boolean(item.featured),
        isActive: Boolean(item.isActive),
        ratingsAverage: 4.7,
        ratingsCount: 45,
        createdBy: adminUser._id,
        images: [
          {
            url: item.imageUrl,
            publicId: `seed_fw_${item.sku.toLowerCase()}`,
            isPrimary: true,
          },
        ],
      };

      const existing = await Product.findOne({ sku: item.sku });
      if (existing) {
        Object.assign(existing, productDoc);
        await existing.save();
        updatedCount++;
        console.log(`[UPDATE] Updated SKU ${item.sku}: price=${price}, discountPrice=${discountPrice}`);
      } else {
        const newProduct = new Product(productDoc);
        await newProduct.save();
        insertedCount++;
        console.log(`[INSERT] Inserted SKU ${item.sku}: price=${price}, discountPrice=${discountPrice}`);
      }
    }

    console.log(`\n\x1b[32m[SUCCESS] Footwear products seeded successfully!\x1b[0m`);
    console.log(`- Inserted: ${insertedCount}`);
    console.log(`- Updated: ${updatedCount}`);
    console.log(`- Total Processed: ${rawProductsData.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[ERROR] Seeding Footwear products failed:\x1b[0m', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedFootwearProducts();
