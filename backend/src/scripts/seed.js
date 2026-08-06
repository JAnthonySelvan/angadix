import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { Product } from '../models/Product.js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('\x1b[31m[ERROR] MONGO_URI is missing from .env\x1b[0m');
  process.exit(1);
}

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

const seedDatabase = async () => {
  try {
    console.log('\x1b[36mConnecting to MongoDB...\x1b[0m');
    await mongoose.connect(MONGO_URI);
    console.log('\x1b[32m[SUCCESS] Connected to MongoDB.\x1b[0m');

    // 1. Clear existing database collections (Category, Brand, Product)
    console.log('\x1b[33mClearing existing Categories, Brands, and Products...\x1b[0m');
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});

    // 2. Ensure Admin User Exists
    let adminUser = await User.findOne({ email: 'admin@angadix.com' });
    if (!adminUser) {
      console.log('\x1b[36mCreating Admin User (admin@angadix.com)...\x1b[0m');
      adminUser = await User.create({
        name: 'Angadix Admin',
        email: 'admin@angadix.com',
        password: 'AdminPassword123!',
        role: 'admin',
        isEmailVerified: true,
      });
    }

    // 3. Seed Categories
    console.log('\x1b[36mSeeding Categories...\x1b[0m');
    const rawCategories = [
      {
        name: 'Electronics',
        description: 'Audio, gadgets, and smart devices',
        image: {
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600',
          publicId: 'seed_cat_electronics',
        },
      },
      {
        name: 'Mobiles',
        description: 'Flagship smartphones and mobile accessories',
        image: {
          url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600',
          publicId: 'seed_cat_mobiles',
        },
      },
      {
        name: 'Laptops',
        description: 'High-performance laptops, ultrabooks, and workstations',
        image: {
          url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600',
          publicId: 'seed_cat_laptops',
        },
      },
      {
        name: 'Fashion',
        description: 'Apparel, footwear, and designer wear',
        image: {
          url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600',
          publicId: 'seed_cat_fashion',
        },
      },
      {
        name: 'Home & Kitchen',
        description: 'Modern home decor, appliances, and kitchen tools',
        image: {
          url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600',
          publicId: 'seed_cat_home',
        },
      },
      {
        name: 'Beauty',
        description: 'Skincare, makeup, and personal care products',
        image: {
          url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600',
          publicId: 'seed_cat_beauty',
        },
      },
      {
        name: 'Sports',
        description: 'Fitness gear, athletic shoes, and gym equipment',
        image: {
          url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
          publicId: 'seed_cat_sports',
        },
      },
      {
        name: 'Books',
        description: 'Bestselling fiction, technology, and self-help books',
        image: {
          url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600',
          publicId: 'seed_cat_books',
        },
      },
    ];

    const categoryMap = {};
    for (const item of rawCategories) {
      const cat = await Category.create({
        ...item,
        slug: slugify(item.name),
      });
      categoryMap[cat.name] = cat._id;
    }

    // 4. Seed Brands
    console.log('\x1b[36mSeeding Brands...\x1b[0m');
    const rawBrands = [
      {
        name: 'Apple',
        description: 'Think Different - Global innovator in premium consumer tech',
        logo: {
          url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=300',
          publicId: 'seed_brand_apple',
        },
      },
      {
        name: 'Samsung',
        description: 'Imagine the Possibilities - Leading global electronics brand',
        logo: {
          url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=300',
          publicId: 'seed_brand_samsung',
        },
      },
      {
        name: 'Sony',
        description: 'Be Moved - High fidelity audio, gaming, and imaging',
        logo: {
          url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=300',
          publicId: 'seed_brand_sony',
        },
      },
      {
        name: 'Nike',
        description: 'Just Do It - World leader in athletic footwear and apparel',
        logo: {
          url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300',
          publicId: 'seed_brand_nike',
        },
      },
      {
        name: 'Dell',
        description: 'The power to do more - High performance computers',
        logo: {
          url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=300',
          publicId: 'seed_brand_dell',
        },
      },
      {
        name: 'Bose',
        description: 'Better sound through research - World class noise cancelling headphones',
        logo: {
          url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=300',
          publicId: 'seed_brand_bose',
        },
      },
    ];

    const brandMap = {};
    for (const item of rawBrands) {
      const b = await Brand.create({
        ...item,
        slug: slugify(item.name),
      });
      brandMap[b.name] = b._id;
    }

    // 5. Seed Products
    console.log('\x1b[36mSeeding Products...\x1b[0m');
    const rawProducts = [
      {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry-leading noise cancellation with two processors and 8 microphones for unparalleled sound quality and crystal clear hands-free calling.',
        shortDescription: 'Wireless Over-Ear Noise Cancelling Headphones with 30hr battery',
        category: categoryMap['Electronics'],
        brand: brandMap['Sony'],
        price: 34990,
        discountPrice: 29990,
        currency: 'INR',
        stock: 35,
        sku: 'SONY-WH1000XM5-BLK',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
            publicId: 'seed_prod_sony_xm5_1',
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800',
            publicId: 'seed_prod_sony_xm5_2',
            isPrimary: false,
          },
        ],
        specifications: [
          { key: 'Noise Cancellation', value: 'Auto NC Optimizer' },
          { key: 'Battery Life', value: 'Up to 30 hours' },
          { key: 'Driver Unit', value: '30mm' },
          { key: 'Connectivity', value: 'Bluetooth 5.2 / 3.5mm Aux' },
        ],
        tags: ['headphones', 'sony', 'wireless', 'noise-cancelling', 'audio'],
        ratingsAverage: 4.8,
        ratingsCount: 128,
        isFeatured: true,
        isBestSeller: true,
        isActive: true,
        createdBy: adminUser._id,
      },
      {
        name: 'iPhone 15 Pro Max 256GB Titanium',
        description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
        shortDescription: 'Apple iPhone 15 Pro Max with 6.7" Super Retina XDR display',
        category: categoryMap['Mobiles'],
        brand: brandMap['Apple'],
        price: 159900,
        discountPrice: 148900,
        currency: 'INR',
        stock: 20,
        sku: 'APPLE-IPHONE15PM-256GB',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
            publicId: 'seed_prod_iphone15_1',
            isPrimary: true,
          },
        ],
        specifications: [
          { key: 'Display', value: '6.7-inch Super Retina XDR OLED' },
          { key: 'Chipset', value: 'Apple A17 Pro (3nm)' },
          { key: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto' },
          { key: 'Storage', value: '256GB' },
        ],
        tags: ['smartphone', 'apple', 'iphone', '5g', 'flagship'],
        ratingsAverage: 4.9,
        ratingsCount: 210,
        isFeatured: true,
        isBestSeller: true,
        isActive: true,
        createdBy: adminUser._id,
      },
      {
        name: 'MacBook Pro 16-inch M3 Max (36GB / 1TB)',
        description: 'The 16-inch MacBook Pro with M3 Max takes power and efficiency to new heights with up to 16-core CPU and 40-core GPU, featuring Liquid Retina XDR display.',
        shortDescription: '16" MacBook Pro with Apple M3 Max chip and 1TB SSD',
        category: categoryMap['Laptops'],
        brand: brandMap['Apple'],
        price: 349900,
        discountPrice: 329900,
        currency: 'INR',
        stock: 15,
        sku: 'APPLE-MBP16-M3MAX-1TB',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800',
            publicId: 'seed_prod_macbook_1',
            isPrimary: true,
          },
        ],
        specifications: [
          { key: 'Processor', value: 'Apple M3 Max (16-core CPU)' },
          { key: 'RAM', value: '36GB Unified Memory' },
          { key: 'Storage', value: '1TB Superfast SSD' },
          { key: 'Display', value: '16.2" Liquid Retina XDR (3024x1964)' },
        ],
        tags: ['laptop', 'macbook', 'apple', 'm3-max', 'pro-laptop'],
        ratingsAverage: 4.9,
        ratingsCount: 95,
        isFeatured: true,
        isBestSeller: false,
        isActive: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Samsung Galaxy S24 Ultra 5G (12GB RAM, 512GB)',
        description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, unleash new levels of creativity, productivity, and possibility starting with Galaxy AI.',
        shortDescription: 'Samsung Galaxy S24 Ultra with Snapdragon 8 Gen 3 and Built-in S Pen',
        category: categoryMap['Mobiles'],
        brand: brandMap['Samsung'],
        price: 139999,
        discountPrice: 129999,
        currency: 'INR',
        stock: 25,
        sku: 'SAMSUNG-S24U-512GB',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800',
            publicId: 'seed_prod_s24u_1',
            isPrimary: true,
          },
        ],
        specifications: [
          { key: 'Display', value: '6.8-inch Dynamic AMOLED 2X 120Hz' },
          { key: 'Processor', value: 'Snapdragon 8 Gen 3 for Galaxy' },
          { key: 'Camera', value: '200MP Quad Rear Camera' },
          { key: 'Battery', value: '5000 mAh' },
        ],
        tags: ['smartphone', 'samsung', 'galaxy', 's24-ultra', 'ai-phone'],
        ratingsAverage: 4.7,
        ratingsCount: 160,
        isFeatured: true,
        isBestSeller: true,
        isActive: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Dell XPS 15 9530 Touch Laptop',
        description: 'Fuel your creation with the XPS 15 featuring 13th Gen Intel Core i9 processors, NVIDIA GeForce RTX 4070 graphics, and a stunning 3.5K OLED touch display.',
        shortDescription: '15.6" 3.5K OLED Touchscreen Laptop with Intel i9 and RTX 4070',
        category: categoryMap['Laptops'],
        brand: brandMap['Dell'],
        price: 249990,
        discountPrice: 229990,
        currency: 'INR',
        stock: 12,
        sku: 'DELL-XPS15-9530-I9',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
            publicId: 'seed_prod_dell_xps_1',
            isPrimary: true,
          },
        ],
        specifications: [
          { key: 'Processor', value: '13th Gen Intel Core i9-13900H' },
          { key: 'GPU', value: 'NVIDIA GeForce RTX 4070 8GB GDDR6' },
          { key: 'RAM', value: '32GB DDR5 4800MHz' },
          { key: 'Display', value: '15.6" 3.5K (3456x2160) OLED Touch' },
        ],
        tags: ['laptop', 'dell', 'xps', 'oled', 'creator-laptop'],
        ratingsAverage: 4.6,
        ratingsCount: 54,
        isFeatured: false,
        isBestSeller: false,
        isActive: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Bose QuietComfort Ultra Headphones',
        description: 'World-class noise cancellation, quieter than ever before. Breakthrough spatialized audio for immersive listening, no matter the content or source.',
        shortDescription: 'Immersive Spatial Audio Wireless Headphones with CustomTune tech',
        category: categoryMap['Electronics'],
        brand: brandMap['Bose'],
        price: 35900,
        discountPrice: 31900,
        currency: 'INR',
        stock: 30,
        sku: 'BOSE-QC-ULTRA-BLK',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800',
            publicId: 'seed_prod_bose_qc_1',
            isPrimary: true,
          },
        ],
        specifications: [
          { key: 'Spatial Audio', value: 'Bose Immersive Audio' },
          { key: 'Battery Life', value: 'Up to 24 hours' },
          { key: 'Microphones', value: '12-Microphone Array' },
        ],
        tags: ['audio', 'bose', 'noise-cancelling', 'headphones', 'spatial-audio'],
        ratingsAverage: 4.8,
        ratingsCount: 88,
        isFeatured: true,
        isBestSeller: false,
        isActive: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Nike Air Max 270 Sneakers',
        description: "Nike's first lifestyle Air Max brings you style, comfort and big attitude in the Nike Air Max 270. The design draws inspiration from Air Max icons.",
        shortDescription: 'Men\'s Running & Lifestyle Sneakers with Max Air 270 unit',
        category: categoryMap['Fashion'],
        brand: brandMap['Nike'],
        price: 13995,
        discountPrice: 11495,
        currency: 'INR',
        stock: 45,
        sku: 'NIKE-AIRMAX270-BLK',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
            publicId: 'seed_prod_nike_airmax_1',
            isPrimary: true,
          },
        ],
        specifications: [
          { key: 'Upper Material', value: 'Textile and Synthetic' },
          { key: 'Outsole', value: 'Rubber' },
          { key: 'Cushioning', value: '270 Max Air Unit' },
        ],
        tags: ['fashion', 'shoes', 'nike', 'sneakers', 'air-max'],
        ratingsAverage: 4.7,
        ratingsCount: 310,
        isFeatured: false,
        isBestSeller: true,
        isActive: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Apple Watch Series 9 GPS + Cellular 45mm',
        description: 'Smarter, brighter, and mightier. Apple Watch Series 9 helps you stay connected, active, healthy, and safe featuring Double Tap gesture control.',
        shortDescription: '45mm Midnight Aluminum Case with Sport Band',
        category: categoryMap['Electronics'],
        brand: brandMap['Apple'],
        price: 54900,
        discountPrice: 49900,
        currency: 'INR',
        stock: 28,
        sku: 'APPLE-WATCH-S9-45MM',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
            publicId: 'seed_prod_watch_s9_1',
            isPrimary: true,
          },
        ],
        specifications: [
          { key: 'Chipset', value: 'S9 SiP with 64-bit dual-core processor' },
          { key: 'Display', value: 'Always-On Retina display (up to 2000 nits)' },
          { key: 'Sensors', value: 'ECG, Blood Oxygen, Temperature sensing' },
        ],
        tags: ['smartwatch', 'apple', 'apple-watch', 'fitness', 'wearables'],
        ratingsAverage: 4.9,
        ratingsCount: 142,
        isFeatured: true,
        isBestSeller: true,
        isActive: true,
        createdBy: adminUser._id,
      },
    ];

    for (const item of rawProducts) {
      await Product.create({
        ...item,
        slug: slugify(item.name),
      });
    }

    console.log('\x1b[32m[SUCCESS] Database seeded successfully with dummy Categories, Brands, and Products!\x1b[0m');
    console.log(`- Categories Seeded: ${rawCategories.length}`);
    console.log(`- Brands Seeded: ${rawBrands.length}`);
    console.log(`- Products Seeded: ${rawProducts.length}`);

    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[FATAL ERROR] Seeding failed:\x1b[0m', error);
    process.exit(1);
  }
};

seedDatabase();
