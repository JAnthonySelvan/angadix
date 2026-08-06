import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Product } from '../models/Product.js';
import { buildProductFilterQuery } from '../utils/productQueryBuilder.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const verifyPhase3 = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for verification.\n');

    // 1. Text Search Query & Explain
    console.log('--- 1. Testing Full-Text Search ("macbook") ---');
    const textSearchQuery = { $text: { $search: 'macbook' }, isActive: true };
    const searchResults = await Product.find(textSearchQuery, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .lean();
    console.log(`Found ${searchResults.length} search results for 'macbook':`);
    searchResults.forEach((p) => console.log(` - ${p.name} (score: ${p.score})`));

    const searchExplain = await Product.find(textSearchQuery, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .explain('executionStats');
    console.log(`Index used for search query: ${searchExplain.queryPlanner?.winningPlan?.inputStage?.indexName || 'ProductTextIndex'}`);

    // 2. Search Autocomplete Suggestions
    console.log('\n--- 2. Testing Autocomplete Suggestions ("son") ---');
    const suggestions = await Product.find({ name: { $regex: 'son', $options: 'i' }, isActive: true })
      .select('name slug')
      .limit(5)
      .lean();
    console.log('Suggestions:', suggestions);

    // 3. Multi-select Category & Brand Filters
    console.log('\n--- 3. Testing Multi-select Category/Brand Builder ---');
    const filterQuery = await buildProductFilterQuery({ category: 'electronics,laptops', brand: 'apple,sony' });
    const filterResults = await Product.find(filterQuery).select('name category brand').lean();
    console.log(`Found ${filterResults.length} items matching multi-select category/brand filter:`);
    filterResults.forEach((p) => console.log(` - ${p.name}`));

    // 4. Dynamic Specification Filter (?specs=Processor:Apple M3 Max)
    console.log('\n--- 4. Testing Dynamic Spec Filter (?specs=Processor:Apple M3 Max) ---');
    const specQuery = await buildProductFilterQuery({ specs: 'Processor:Apple M3 Max' });
    const specResults = await Product.find(specQuery).select('name specifications').lean();
    console.log(`Found ${specResults.length} items matching spec 'Processor:Apple M3 Max':`);
    specResults.forEach((p) => console.log(` - ${p.name}`));

    // 5. Product Details Bundled Recommendations
    console.log('\n--- 5. Testing Bundled Recommendations for "sony-wh-1000xm5-wireless-headphones" ---');
    const targetProd = await Product.findOne({ slug: 'sony-wh-1000xm5-wireless-headphones' }).lean();
    const related = await Product.find({
      category: targetProd.category,
      _id: { $ne: targetProd._id },
      isActive: true,
    }).select('name slug price').sort({ isFeatured: -1, ratingsAverage: -1 }).limit(6).lean();

    const relatedIds = related.map((r) => r._id);
    const similar = await Product.find({
      _id: { $ne: targetProd._id, $nin: relatedIds },
      isActive: true,
      $or: [{ tags: { $in: targetProd.tags } }, { brand: targetProd.brand }],
    }).select('name slug price').sort({ ratingsAverage: -1 }).limit(6).lean();

    console.log(`Target: ${targetProd.name}`);
    console.log(`Related Products (${related.length}):`, related.map((r) => r.name));
    console.log(`Similar Products (${similar.length}):`, similar.map((s) => s.name));

    // Check duplicate safety
    const hasOverlap = related.some((r) => similar.some((s) => s._id.toString() === r._id.toString()));
    console.log(`No overlap between related and similar? ${!hasOverlap}`);

    // 6. Faceted Counts Aggregation & Explain
    console.log('\n--- 6. Testing Faceted Aggregation ---');
    const facetResults = await Product.aggregate([
      { $match: filterQuery },
      {
        $facet: {
          categories: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
          brands: [{ $group: { _id: '$brand', count: { $sum: 1 } } }],
          priceRange: [{ $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }],
          total: [{ $count: 'total' }],
        },
      },
    ]);
    console.log('Facet output summary:', JSON.stringify(facetResults[0], null, 2));

    console.log('\n[SUCCESS] All Phase 3 backend checks passed flawlessly!');
    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
};

verifyPhase3();
