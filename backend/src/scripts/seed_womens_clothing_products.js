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

const WOMENS_CLOTHING_CATEGORY_ID = '6a7739117481e2c7945ab9d6';

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
    name: "Nike Women's Sports Crop Top",
    sku: "NIK-WOM-001",
    stock: 34,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.NIKE,
    sellingPrice: 1799,
    originalMRP: 2299,
    description: "Lightweight women's sports crop top designed for comfortable workouts, training sessions, and active lifestyles.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=800"
  },
  {
    name: "Nike Women's Running Leggings",
    sku: "NIK-WOM-002",
    stock: 29,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.NIKE,
    sellingPrice: 2499,
    originalMRP: 3299,
    description: "Stretchable women's running leggings designed for comfortable movement during workouts and outdoor activities.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=800"
  },
  {
    name: "Nike Women's Training Track Pants",
    sku: "NIK-WOM-003",
    stock: 26,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.NIKE,
    sellingPrice: 2799,
    originalMRP: 3499,
    description: "Comfortable women's training track pants suitable for workouts, running, and casual activewear styling.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800"
  },
  {
    name: "Adidas Women's Floral Print Dress",
    sku: "ADI-WOM-004",
    stock: 22,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    sellingPrice: 2999,
    originalMRP: 3999,
    description: "Stylish women's floral print dress combining a feminine silhouette with comfortable everyday wear.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800"
  },
  {
    name: "Adidas Women's Yoga Leggings",
    sku: "ADI-WOM-005",
    stock: 37,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    sellingPrice: 2299,
    originalMRP: 2999,
    description: "Flexible women's yoga leggings designed for stretching, yoga, training, and comfortable everyday movement.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800"
  },
  {
    name: "Adidas Women's Oversized Sweatshirt",
    sku: "ADI-WOM-006",
    stock: 25,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    sellingPrice: 2799,
    originalMRP: 3699,
    description: "Soft oversized sweatshirt offering a relaxed fit for casual outings and comfortable everyday styling.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=800"
  },
  {
    name: "Puma Women's Running Shorts",
    sku: "PUM-WOM-007",
    stock: 43,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.PUMA,
    sellingPrice: 1399,
    originalMRP: 1899,
    description: "Lightweight women's running shorts designed for comfortable movement during workouts and outdoor activities.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800"
  },
  {
    name: "Puma Women's Hooded Jacket",
    sku: "PUM-WOM-008",
    stock: 19,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.PUMA,
    sellingPrice: 3499,
    originalMRP: 4499,
    description: "Modern women's hooded jacket designed for casual outdoor wear and sporty everyday styling.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800"
  },
  {
    name: "Puma Women's Ribbed Tank Top",
    sku: "PUM-WOM-009",
    stock: 41,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.PUMA,
    sellingPrice: 1199,
    originalMRP: 1599,
    description: "Comfortable ribbed tank top designed for casual outfits, workouts, and layered styling.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800"
  },
  {
    name: "Levi's Women's High Rise Skinny Jeans",
    sku: "LEV-WOM-010",
    stock: 31,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.LEVIS,
    sellingPrice: 3299,
    originalMRP: 4499,
    description: "High-rise women's skinny jeans offering a sleek silhouette and versatile styling for everyday outfits.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800"
  },
  {
    name: "Levi's Women's Denim Skirt",
    sku: "LEV-WOM-011",
    stock: 24,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.LEVIS,
    sellingPrice: 2499,
    originalMRP: 3299,
    description: "Classic denim skirt designed for versatile casual styling with tops, shirts, and jackets.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800"
  },
  {
    name: "Levi's Women's Cropped Denim Jacket",
    sku: "LEV-WOM-012",
    stock: 17,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.LEVIS,
    sellingPrice: 3999,
    originalMRP: 5299,
    description: "Contemporary cropped denim jacket designed for layering and modern casual outfits.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800"
  },
  {
    name: "H&M Women's Floral Maxi Dress",
    sku: "HNM-WOM-013",
    stock: 28,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.HM,
    sellingPrice: 2299,
    originalMRP: 2999,
    description: "Elegant floral maxi dress designed for casual outings, vacations, and relaxed occasions.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800"
  },
  {
    name: "H&M Women's Relaxed Fit Linen Trousers",
    sku: "HNM-WOM-014",
    stock: 33,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.HM,
    sellingPrice: 1999,
    originalMRP: 2699,
    description: "Lightweight relaxed-fit trousers designed for comfortable everyday wear and warm-weather styling.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800"
  },
  {
    name: "H&M Women's Embroidered Kurta",
    sku: "HNM-WOM-015",
    stock: 21,
    category: WOMENS_CLOTHING_CATEGORY_ID,
    brand: BRANDS.HM,
    sellingPrice: 2499,
    originalMRP: 3299,
    description: "Elegant embroidered kurta combining traditional-inspired details with contemporary everyday styling.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"
  }
];

const seedWomensClothingProducts = async () => {
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
    let category = await Category.findById(WOMENS_CLOTHING_CATEGORY_ID);
    if (!category) {
      category = await Category.findOne({ slug: 'womens-clothing' });
    }
    if (!category) {
      console.log(`Category ${WOMENS_CLOTHING_CATEGORY_ID} not found. Creating Women's Clothing category...`);
      category = await Category.create({
        _id: new mongoose.Types.ObjectId(WOMENS_CLOTHING_CATEGORY_ID),
        name: "Women's Clothing",
        slug: 'womens-clothing',
        description: 'Dresses, tops, activewear, jeans, and fashion for women',
        image: {
          url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600',
          publicId: 'seed_cat_womens_clothing',
        },
        isActive: true,
      });
      console.log("Created Women's Clothing category.");
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
        ratingsCount: 32,
        createdBy: adminUser._id,
        images: [
          {
            url: item.imageUrl,
            publicId: `seed_womens_${item.sku.toLowerCase()}`,
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

    console.log(`\n\x1b[32m[SUCCESS] Women's Clothing products seeded successfully!\x1b[0m`);
    console.log(`- Inserted: ${insertedCount}`);
    console.log(`- Updated: ${updatedCount}`);
    console.log(`- Total Processed: ${rawProductsData.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[ERROR] Seeding Women\'s Clothing products failed:\x1b[0m', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedWomensClothingProducts();
