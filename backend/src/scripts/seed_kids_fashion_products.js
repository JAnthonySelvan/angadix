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

const KIDS_FASHION_CATEGORY_ID = '6a7739117481e2c7945ab9d9';

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
    name: "Nike Kids Printed Graphic T-Shirt",
    sku: "NIK-KID-001",
    stock: 35,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.NIKE,
    sellingPrice: 1299,
    originalMRP: 1699,
    description: "Comfortable printed graphic T-shirt designed for kids with a soft feel and playful everyday style.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=800"
  },
  {
    name: "Nike Kids Sports Shorts",
    sku: "NIK-KID-002",
    stock: 42,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.NIKE,
    sellingPrice: 1499,
    originalMRP: 1999,
    description: "Lightweight sports shorts designed for active kids, outdoor activities, and everyday comfort.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?q=80&w=800"
  },
  {
    name: "Nike Kids Zip-Up Track Jacket",
    sku: "NIK-KID-003",
    stock: 20,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.NIKE,
    sellingPrice: 2499,
    originalMRP: 3299,
    description: "Sporty zip-up track jacket designed to keep kids comfortable during outdoor activities and casual outings.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?q=80&w=800"
  },
  {
    name: "Adidas Kids Printed Hoodie",
    sku: "ADI-KID-004",
    stock: 26,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    sellingPrice: 2299,
    originalMRP: 2999,
    description: "Soft printed hoodie designed for kids with a comfortable fit for casual and outdoor wear.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=800"
  },
  {
    name: "Adidas Kids Training Track Pants",
    sku: "ADI-KID-005",
    stock: 31,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    sellingPrice: 1799,
    originalMRP: 2399,
    description: "Comfortable track pants designed for kids during sports, playtime, and everyday activities.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=800"
  },
  {
    name: "Adidas Kids Polo T-Shirt",
    sku: "ADI-KID-006",
    stock: 38,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.ADIDAS,
    sellingPrice: 1599,
    originalMRP: 2099,
    description: "Classic polo T-shirt offering a smart and comfortable option for kids' casual and everyday outfits.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800"
  },
  {
    name: "Puma Kids Graphic Sweatshirt",
    sku: "PUM-KID-007",
    stock: 24,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.PUMA,
    sellingPrice: 1999,
    originalMRP: 2699,
    description: "Warm graphic sweatshirt designed for kids with a relaxed fit and comfortable everyday styling.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800"
  },
  {
    name: "Puma Kids Running Joggers",
    sku: "PUM-KID-008",
    stock: 29,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.PUMA,
    sellingPrice: 1699,
    originalMRP: 2199,
    description: "Comfortable joggers designed for active kids, sports activities, and casual everyday wear.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800"
  },
  {
    name: "Puma Kids Summer Dress",
    sku: "PUM-KID-009",
    stock: 18,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.PUMA,
    sellingPrice: 1899,
    originalMRP: 2499,
    description: "Lightweight kids' summer dress designed for comfortable movement and stylish casual outings.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800"
  },
  {
    name: "Levi's Kids Denim Overalls",
    sku: "LEV-KID-010",
    stock: 16,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.LEVIS,
    sellingPrice: 2799,
    originalMRP: 3699,
    description: "Classic denim overalls designed for kids with a practical and playful everyday style.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800"
  },
  {
    name: "Levi's Kids Casual Denim Shirt",
    sku: "LEV-KID-011",
    stock: 22,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.LEVIS,
    sellingPrice: 1999,
    originalMRP: 2599,
    description: "Versatile denim shirt designed for kids and suitable for casual outfits and layered styling.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1560506840-ec148e82a604?q=80&w=800"
  },
  {
    name: "Levi's Kids Stretch Denim Jeans",
    sku: "LEV-KID-012",
    stock: 27,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.LEVIS,
    sellingPrice: 2499,
    originalMRP: 3299,
    description: "Comfortable stretch denim jeans designed to provide kids with freedom of movement throughout the day.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800"
  },
  {
    name: "H&M Kids Cotton Printed Dress",
    sku: "HNM-KID-013",
    stock: 33,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.HM,
    sellingPrice: 1499,
    originalMRP: 1999,
    description: "Soft cotton printed dress designed for comfortable everyday wear and casual occasions.",
    featured: true,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800"
  },
  {
    name: "H&M Kids Cargo Trousers",
    sku: "HNM-KID-014",
    stock: 25,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.HM,
    sellingPrice: 1799,
    originalMRP: 2399,
    description: "Practical cargo trousers designed for kids with a comfortable fit and multiple utility pockets.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1476234251651-f353703a034d?q=80&w=800"
  },
  {
    name: "H&M Kids Printed Cotton Shirt",
    sku: "HNM-KID-015",
    stock: 30,
    category: KIDS_FASHION_CATEGORY_ID,
    brand: BRANDS.HM,
    sellingPrice: 1299,
    originalMRP: 1699,
    description: "Casual printed cotton shirt designed for kids with a lightweight and comfortable everyday fit.",
    featured: false,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?q=80&w=800"
  }
];

const seedKidsFashionProducts = async () => {
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
    let category = await Category.findById(KIDS_FASHION_CATEGORY_ID);
    if (!category) {
      category = await Category.findOne({ slug: 'kids-fashion' });
    }
    if (!category) {
      console.log(`Category ${KIDS_FASHION_CATEGORY_ID} not found. Creating Kids' Fashion category...`);
      category = await Category.create({
        _id: new mongoose.Types.ObjectId(KIDS_FASHION_CATEGORY_ID),
        name: "Kids' Fashion",
        slug: 'kids-fashion',
        description: "Comfortable and stylish apparel, dresses, shorts, and activewear for kids",
        image: {
          url: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=600',
          publicId: 'seed_cat_kids_fashion',
        },
        isActive: true,
      });
      console.log("Created Kids' Fashion category.");
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
        ratingsAverage: 4.8,
        ratingsCount: 28,
        createdBy: adminUser._id,
        images: [
          {
            url: item.imageUrl,
            publicId: `seed_kids_${item.sku.toLowerCase()}`,
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

    console.log(`\n\x1b[32m[SUCCESS] Kids' Fashion products seeded successfully!\x1b[0m`);
    console.log(`- Inserted: ${insertedCount}`);
    console.log(`- Updated: ${updatedCount}`);
    console.log(`- Total Processed: ${rawProductsData.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[ERROR] Seeding Kids\' Fashion products failed:\x1b[0m', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedKidsFashionProducts();
