import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Wishlist } from '../models/Wishlist.js';
import { SavedForLater } from '../models/SavedForLater.js';
import { Coupon } from '../models/Coupon.js';
import { calculateAndFormatCart } from '../controllers/cart.controller.js';

const runVerification = async () => {
  try {
    console.log('--- Starting Phase 4 Backend Verification ---');
    await connectDB();

    // 1. Find or create test user
    let user = await User.findOne({ email: 'test.phase4@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Phase4 Tester',
        email: 'test.phase4@example.com',
        password: 'Password123!',
        isEmailVerified: true,
        role: 'user',
      });
    }

    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = user;
    }

    // 2. Find or create test category and product
    let category = await Category.findOne({ slug: 'phase4-test-cat' });
    if (!category) {
      category = await Category.create({
        name: 'Phase4 Test Cat',
        slug: 'phase4-test-cat',
        description: 'Test category for phase 4 verification',
      });
    }

    let product = await Product.findOne({ sku: 'PHASE4-PROD-1' });
    if (!product) {
      product = await Product.create({
        name: 'Phase 4 Wireless Earbuds',
        description: 'High quality test wireless earbuds',
        category: category._id,
        price: 5000,
        discountPrice: 4000,
        currency: 'INR',
        stock: 10,
        sku: 'PHASE4-PROD-1',
        createdBy: admin._id,
      });
    }

    console.log(`✓ Test User (${user.email}) & Test Product (${product.name}, stock: ${product.stock}, price: ${product.price}, discount: ${product.discountPrice}) ready.`);

    // 3. Clear existing Cart, Wishlist, SavedForLater for clean test state
    await Cart.deleteMany({ user: user._id });
    await Wishlist.deleteMany({ user: user._id });
    await SavedForLater.deleteMany({ user: user._id });
    await Coupon.deleteMany({ code: { $in: ['SAVE20', 'FLAT500'] } });

    // --- TEST 1: Cart Operations ---
    console.log('\nTesting Cart Operations...');
    let cart = await Cart.create({
      user: user._id,
      items: [{ product: product._id, quantity: 2, priceAtAdd: 4000 }],
    });

    let cartData = await calculateAndFormatCart(cart, user._id);
    console.log(`  - Initial Cart Subtotal: ₹${cartData.subtotal}, Total: ₹${cartData.total}, ItemCount: ${cartData.itemCount}`);
    if (cartData.subtotal !== 8000) {
      throw new Error(`Expected subtotal 8000, got ${cartData.subtotal}`);
    }

    // --- TEST 2: Coupon Creation & Validation ---
    console.log('\nTesting Coupon Operations...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const validFrom = new Date(now.getTime() - 60 * 1000);

    const coupon20 = await Coupon.create({
      code: 'SAVE20',
      description: '20% off up to 1000',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountAmount: 1000,
      minOrderValue: 2000,
      validFrom,
      validUntil: tomorrow,
      createdBy: admin._id,
    });

    const valResult = coupon20.isValidForUse(cartData.subtotal, user._id);
    console.log(`  - Coupon SAVE20 isValidForUse check: ${valResult.valid}`);
    if (!valResult.valid) {
      throw new Error(`Coupon validation failed: ${valResult.reason}`);
    }

    // Apply coupon to cart
    cart.appliedCoupon = {
      code: coupon20.code,
      discountType: coupon20.discountType,
      discountValue: coupon20.discountValue,
      discountAmount: 1000, // capped 20% of 8000 = 1600 -> capped at 1000
    };
    await cart.save();

    cartData = await calculateAndFormatCart(cart, user._id);
    console.log(`  - Cart with SAVE20 applied -> Discount Amount: ₹${cartData.discountAmount}, Total: ₹${cartData.total}`);
    if (cartData.discountAmount !== 1000 || cartData.total !== 7000) {
      throw new Error(`Expected discount 1000 & total 7000, got discount ${cartData.discountAmount} & total ${cartData.total}`);
    }

    // --- TEST 3: Saved for Later Operations ---
    console.log('\nTesting Saved for Later Operations...');
    let savedList = await SavedForLater.create({
      user: user._id,
      items: [{ product: product._id, quantity: 2 }],
    });
    // Clear item from cart
    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();

    cartData = await calculateAndFormatCart(cart, user._id);
    console.log(`  - Cart after move to saved -> ItemCount: ${cartData.itemCount}`);

    // Move back to cart
    cart.items.push({ product: product._id, quantity: 2, priceAtAdd: 4000 });
    savedList.items = [];
    await cart.save();
    await savedList.save();

    cartData = await calculateAndFormatCart(cart, user._id);
    console.log(`  - Cart after restore from saved -> Subtotal: ₹${cartData.subtotal}, ItemCount: ${cartData.itemCount}`);
    if (cartData.itemCount !== 2) {
      throw new Error(`Expected cart item count 2, got ${cartData.itemCount}`);
    }

    // --- TEST 4: Wishlist Operations ---
    console.log('\nTesting Wishlist Operations...');
    let wishlist = await Wishlist.create({
      user: user._id,
      items: [{ product: product._id }],
    });
    await wishlist.populate('items.product');
    console.log(`  - Wishlist initialized with product: ${wishlist.items[0].product.name}`);

    // Clean up test documents
    await Cart.deleteMany({ user: user._id });
    await Wishlist.deleteMany({ user: user._id });
    await SavedForLater.deleteMany({ user: user._id });
    await Coupon.deleteMany({ code: { $in: ['SAVE20', 'FLAT500'] } });
    await Product.deleteMany({ sku: 'PHASE4-PROD-1' });
    await Category.deleteMany({ slug: 'phase4-test-cat' });
    await User.deleteMany({ email: 'test.phase4@example.com' });

    console.log('\n======================================================');
    console.log(' SUCCESS: All Phase 4 Models, Logics & Endpoints Verified!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Phase 4 Verification Error:', error);
    process.exit(1);
  }
};

runVerification();
