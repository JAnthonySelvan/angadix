import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { FeaturedShowcase } from '../models/FeaturedShowcase.js';
import { Product } from '../models/Product.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('[ERROR] MONGO_URI is missing from .env');
  process.exit(1);
}

const showcaseItems = [
  {
    title: 'The Pinnacle of Pro Photography',
    description: 'Triple 48MP cameras, A19 Chip, and a 6.9-inch Cinematic Display. Meet the smartphone built for creators who demand more.',
    image: { url: 'https://placehold.co/1200x900/0a2540/ffffff?text=iPhone+17+Pro+Max', publicId: '' },
    ctaText: 'Shop iPhone 17 Pro Max',
    ctaLink: '/products/apple-iphone-17-pro-max',
    linkedProduct: '6a7665d0024507aeac731011',
    productSlug: 'apple-iphone-17-pro-max',
    sortOrder: 1,
    isActive: true,
  },
  {
    title: 'Zoom Further. Shoot Sharper.',
    description: "A 200MP camera system meets Snapdragon 8 Elite Gen 5 performance in Samsung's most advanced Ultra yet.",
    image: { url: 'https://placehold.co/1200x900/0a2540/ffffff?text=Galaxy+S26+Ultra', publicId: '' },
    ctaText: 'Shop Galaxy S26 Ultra',
    ctaLink: '/products/samsung-galaxy-s26-ultra-5g',
    linkedProduct: '6a7671bc024507aeac731339',
    productSlug: 'samsung-galaxy-s26-ultra-5g',
    sortOrder: 2,
    isActive: true,
  },
  {
    title: 'Power That Fits In Your Bag',
    description: 'The Apple M4 chip delivers desktop-class performance in a fanless, all-day-battery design. Built for creators on the move.',
    image: { url: 'https://placehold.co/1200x900/0a2540/ffffff?text=MacBook+Air+M4', publicId: '' },
    ctaText: 'Shop MacBook Air M4',
    ctaLink: '/products/apple-macbook-air-m4',
    linkedProduct: '6a76df6dde10b645c0120454',
    productSlug: 'apple-macbook-air-m4',
    sortOrder: 3,
    isActive: true,
  },
  {
    title: 'Engineered for Every Mile',
    description: 'Responsive cushioning meets everyday comfort. The Air Zoom Pegasus 41 keeps you moving, run after run.',
    image: { url: 'https://placehold.co/1200x900/0a2540/ffffff?text=Nike+Air+Zoom+Pegasus+41', publicId: '' },
    ctaText: 'Shop Pegasus 41',
    ctaLink: '/products/nike-air-zoom-pegasus-41',
    linkedProduct: '6a77d3da56e158921e2d6fd8',
    productSlug: 'nike-air-zoom-pegasus-41',
    sortOrder: 4,
    isActive: true,
  },
  {
    title: 'Silence, Reimagined',
    description: 'World-class noise cancellation meets immersive sound. The QuietComfort Ultra is built to help you escape, anywhere.',
    image: { url: 'https://placehold.co/1200x900/0a2540/ffffff?text=Bose+QC+Ultra', publicId: '' },
    ctaText: 'Shop QuietComfort Ultra',
    ctaLink: '/products/bose-quietcomfort-ultra-bluetooth',
    linkedProduct: '6a76e94637749770e50c4fe9',
    productSlug: 'bose-quietcomfort-ultra-bluetooth',
    sortOrder: 5,
    isActive: true,
  },
  {
    title: 'Boost Every Stride',
    description: 'Premium responsive cushioning designed for runners who refuse to compromise on comfort or performance.',
    image: { url: 'https://placehold.co/1200x900/0a2540/ffffff?text=Adidas+Ultraboost+5', publicId: '' },
    ctaText: 'Shop Ultraboost 5',
    ctaLink: '/products/adidas-ultraboost-5',
    linkedProduct: '6a77d3db56e158921e2d6fe5',
    productSlug: 'adidas-ultraboost-5',
    sortOrder: 6,
    isActive: true,
  },
  {
    title: 'Skin That Glows From Within',
    description: 'A lightweight hyaluronic acid formula designed to visibly hydrate and smooth, for a complexion that speaks for itself.',
    image: { url: 'https://placehold.co/1200x900/0a2540/ffffff?text=L%27Or%C3%A9al+Serum', publicId: '' },
    ctaText: 'Shop the Serum',
    ctaLink: '/products/loral-paris-revitalift-hyaluronic-acid-serum',
    linkedProduct: '6a77c51665dd22354b0516cd',
    productSlug: 'loral-paris-revitalift-hyaluronic-acid-serum',
    sortOrder: 7,
    isActive: true,
  },
];

const seedFeaturedShowcase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing existing FeaturedShowcase collection...');
    await FeaturedShowcase.deleteMany({});

    console.log('Inserting seed items...');
    for (const item of showcaseItems) {
      let finalProductId = item.linkedProduct;

      if (mongoose.Types.ObjectId.isValid(finalProductId)) {
        const exists = await Product.findById(finalProductId);
        if (!exists && item.productSlug) {
          const foundBySlug = await Product.findOne({ slug: item.productSlug });
          if (foundBySlug) {
            finalProductId = foundBySlug._id;
          }
        }
      } else if (item.productSlug) {
        const foundBySlug = await Product.findOne({ slug: item.productSlug });
        if (foundBySlug) {
          finalProductId = foundBySlug._id;
        }
      }

      await FeaturedShowcase.create({
        title: item.title,
        description: item.description,
        image: item.image,
        ctaText: item.ctaText,
        ctaLink: item.ctaLink,
        linkedProduct: finalProductId && mongoose.Types.ObjectId.isValid(finalProductId) ? finalProductId : null,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      });

      console.log(`- Created: ${item.title}`);
    }

    console.log('FeaturedShowcase seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedFeaturedShowcase();
