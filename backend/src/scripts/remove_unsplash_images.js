import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Product } from '../models/Product.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const removeUnsplashFromProducts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is missing from environment variables');
      process.exit(1);
    }
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const products = await Product.find({});
    console.log(`Found ${products.length} products in database.`);

    let updatedProductCount = 0;
    let totalRemovedImages = 0;
    let emptyImageProductCount = 0;

    for (const product of products) {
      const originalCount = product.images ? product.images.length : 0;
      if (originalCount === 0) continue;

      const filteredImages = product.images.filter(
        (img) => !img.url || !img.url.toLowerCase().includes('unsplash')
      );

      const removedCount = originalCount - filteredImages.length;

      if (removedCount > 0) {
        totalRemovedImages += removedCount;
        product.images = filteredImages;

        // Ensure primary image exists if images array is not empty
        if (product.images.length > 0) {
          const hasPrimary = product.images.some((img) => img.isPrimary);
          if (!hasPrimary) {
            product.images[0].isPrimary = true;
          }
        } else {
          emptyImageProductCount++;
        }

        await product.save();
        updatedProductCount++;
      }
    }

    console.log('\n========================================');
    console.log('       UNSPLASH REMOVAL SUMMARY         ');
    console.log('========================================');
    console.log(`Products updated: ${updatedProductCount}`);
    console.log(`Unsplash images removed: ${totalRemovedImages}`);
    console.log(`Products left with 0 images: ${emptyImageProductCount}`);

    // Verification step
    const remainingProducts = await Product.find({});
    let remainingUnsplashCount = 0;
    remainingProducts.forEach((p) => {
      (p.images || []).forEach((img) => {
        if (img.url && img.url.toLowerCase().includes('unsplash')) {
          remainingUnsplashCount++;
        }
      });
    });

    console.log(`Remaining unsplash images in Product collection: ${remainingUnsplashCount}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error executing script:', err);
    process.exit(1);
  }
};

removeUnsplashFromProducts();
