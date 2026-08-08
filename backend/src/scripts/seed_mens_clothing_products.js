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

const MENS_CLOTHING_CATEGORY_ID = '6a7739117481e2c7945ab9d5';

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
    name: "Nike Dri-FIT Sports T-Shirt",
    sku: "NIK-MEN-001",
    stock: 45,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.NIKE,
    sellingPrice: 1999,
    originalMRP: 2499,
    description: "Lightweight men's sports T-shirt featuring moisture-wicking fabric for comfortable everyday and workout wear.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800"
  },
  {
    name: "Nike Club Fleece Hoodie",
    sku: "NIK-MEN-002",
    stock: 28,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.NIKE,
    sellingPrice: 3999,
    originalMRP: 4999,
    description: "Soft fleece hoodie designed for comfortable casual wear with a classic sporty look.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800"
  },
  {
    name: "Nike Academy Training Jacket",
    sku: "NIK-MEN-003",
    stock: 18,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.NIKE,
    sellingPrice: 4499,
    originalMRP: 5999,
    description: "Lightweight men's training jacket designed for active lifestyles and outdoor workouts.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800"
  },
  {
    name: "Adidas Essentials Cotton T-Shirt",
    sku: "ADI-MEN-004",
    stock: 52,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    sellingPrice: 1499,
    originalMRP: 1999,
    description: "Classic cotton T-shirt with a comfortable fit suitable for everyday casual wear.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800"
  },
  {
    name: "Adidas Essentials Fleece Hoodie",
    sku: "ADI-MEN-005",
    stock: 24,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    sellingPrice: 3499,
    originalMRP: 4499,
    description: "Warm fleece hoodie with a modern athletic design for casual and outdoor wear.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=800"
  },
  {
    name: "Adidas Performance Polo Shirt",
    sku: "ADI-MEN-006",
    stock: 36,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    sellingPrice: 2299,
    originalMRP: 2999,
    description: "Versatile men's polo shirt combining sporty styling with comfortable everyday wear.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1625910513413-72213554625b?q=80&w=800"
  },
  {
    name: "Puma Essentials Logo T-Shirt",
    sku: "PUM-MEN-007",
    stock: 48,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.PUMA,
    sellingPrice: 1299,
    originalMRP: 1799,
    description: "Comfortable everyday T-shirt featuring a clean logo design and relaxed casual styling.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800"
  },
  {
    name: "Puma Active Training T-Shirt",
    sku: "PUM-MEN-008",
    stock: 41,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.PUMA,
    sellingPrice: 1699,
    originalMRP: 2199,
    description: "Breathable training T-shirt designed for workouts, running, and active everyday use.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800"
  },
  {
    name: "Puma Classic Casual Hoodie",
    sku: "PUM-MEN-009",
    stock: 21,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.PUMA,
    sellingPrice: 2999,
    originalMRP: 3999,
    description: "Classic casual hoodie with a comfortable fit for everyday outdoor and leisure wear.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800"
  },
  {
    name: "Levi's 511 Slim Fit Jeans",
    sku: "LEV-MEN-010",
    stock: 32,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.LEVIS,
    sellingPrice: 3499,
    originalMRP: 4999,
    description: "Modern slim-fit men's jeans designed with a versatile silhouette for everyday styling.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1542272604-780c36856d66?q=80&w=800"
  },
  {
    name: "Levi's Classic Denim Trucker Jacket",
    sku: "LEV-MEN-011",
    stock: 16,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.LEVIS,
    sellingPrice: 4999,
    originalMRP: 6999,
    description: "Classic denim jacket with a timeless design suitable for casual layering and everyday outfits.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800"
  },
  {
    name: "Levi's Regular Fit Cotton Shirt",
    sku: "LEV-MEN-012",
    stock: 29,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.LEVIS,
    sellingPrice: 2299,
    originalMRP: 2999,
    description: "Regular-fit cotton shirt designed for comfortable everyday casual styling.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800"
  },
  {
    name: "H&M Regular Fit Cotton Shirt",
    sku: "HNM-MEN-013",
    stock: 38,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.HM,
    sellingPrice: 1599,
    originalMRP: 2199,
    description: "Clean and versatile regular-fit cotton shirt suitable for casual and smart-casual occasions.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800"
  },
  {
    name: "H&M Relaxed Fit Sweatshirt",
    sku: "HNM-MEN-014",
    stock: 31,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.HM,
    sellingPrice: 1999,
    originalMRP: 2699,
    description: "Soft relaxed-fit sweatshirt designed for comfortable everyday casual wear.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800"
  },
  {
    name: "H&M Slim Fit Chino Trousers",
    sku: "HNM-MEN-015",
    stock: 27,
    category: MENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.HM,
    sellingPrice: 2499,
    originalMRP: 3299,
    description: "Modern slim-fit chino trousers offering a versatile option for casual and smart-casual outfits.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800"
  }
];

const seedMensClothingProducts = async () => {
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
    let category = await Category.findById(MENS_CLOTHING_CATEGORY_ID);
    if (!category) {
      category = await Category.findOne({ slug: 'mens-clothing' });
    }
    if (!category) {
      console.log(`Category ${MENS_CLOTHING_CATEGORY_ID} not found. Creating Men's Clothing category...`);
      category = await Category.create({
        _id: new mongoose.Types.ObjectId(MENS_CLOTHING_CATEGORY_ID),
        name: "Men's Clothing",
        slug: 'mens-clothing',
        description: 'Apparel, activewear, jeans, jackets, and fashion for men',
        image: {
          url: 'https://images.unsplash.com/photo-1490578474895-699bc4e2cf59?q=80&w=600',
          publicId: 'seed_cat_mens_clothing',
        },
        isActive: true,
      });
      console.log("Created Men's Clothing category.");
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
      // Correct Mapping for Original MRP and Selling Price:
      // price -> originalMRP (e.g. 2499)
      // discountPrice -> sellingPrice (e.g. 1999) if sellingPrice < originalMRP, else null
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
        ratingsAverage: 4.6,
        ratingsCount: 24,
        createdBy: adminUser._id,
        images: [
          {
            url: item.imageUrl,
            publicId: `seed_mens_${item.sku.toLowerCase()}`,
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

    console.log(`\n\x1b[32m[SUCCESS] Men's Clothing products seeded successfully!\x1b[0m`);
    console.log(`- Inserted: ${insertedCount}`);
    console.log(`- Updated: ${updatedCount}`);
    console.log(`- Total Processed: ${rawProductsData.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[ERROR] Seeding Men\'s Clothing products failed:\x1b[0m', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedMensClothingProducts();
