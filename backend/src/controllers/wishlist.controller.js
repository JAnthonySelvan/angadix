import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Wishlist } from '../models/Wishlist.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { calculateAndFormatCart } from './cart.controller.js';

const getPopulatedWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }

  await wishlist.populate({
    path: 'items.product',
    select: 'name slug images price discountPrice stock ratingsAverage isActive',
  });

  return wishlist;
};

// 1. Get Wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getPopulatedWishlist(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, 'Wishlist fetched successfully.'));
});

// 2. Add Item to Wishlist (Idempotent)
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found or is currently unavailable.');
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, items: [] });
  }

  const exists = wishlist.items.some(
    (item) => item.product.toString() === productId
  );

  if (!exists) {
    wishlist.items.push({ product: productId });
    await wishlist.save();
  }

  const updatedWishlist = await getPopulatedWishlist(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedWishlist,
        exists
          ? 'Product is already in wishlist.'
          : 'Product added to wishlist successfully.'
      )
    );
});

// 3. Remove Item from Wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    throw new ApiError(404, 'Wishlist not found.');
  }

  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId
  );
  await wishlist.save();

  const updatedWishlist = await getPopulatedWishlist(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedWishlist, 'Product removed from wishlist.'));
});

// 4. Move Item from Wishlist to Cart
export const moveWishlistToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    throw new ApiError(404, 'Wishlist not found.');
  }

  const wishlistItemIndex = wishlist.items.findIndex(
    (item) => item.product.toString() === productId
  );
  if (wishlistItemIndex === -1) {
    throw new ApiError(404, 'Product not found in wishlist.');
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found or is currently unavailable.');
  }

  if (product.stock < 1) {
    throw new ApiError(
      400,
      `Cannot move to cart. '${product.name}' is currently out of stock.`
    );
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const cartItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  const effectivePrice =
    product.discountPrice !== null && product.discountPrice !== undefined
      ? product.discountPrice
      : product.price;

  if (cartItemIndex > -1) {
    const targetQty = cart.items[cartItemIndex].quantity + 1;
    if (product.stock < targetQty) {
      throw new ApiError(
        400,
        `Cannot add another unit. Only ${product.stock} units of '${product.name}' are available.`
      );
    }
    cart.items[cartItemIndex].quantity = targetQty;
    cart.items[cartItemIndex].priceAtAdd = effectivePrice;
  } else {
    cart.items.push({
      product: productId,
      quantity: 1,
      priceAtAdd: effectivePrice,
    });
  }

  // Multi-step safety: perform all checks before mutation saves
  await cart.save();

  // Remove from wishlist
  wishlist.items.splice(wishlistItemIndex, 1);
  await wishlist.save();

  const cartData = await calculateAndFormatCart(cart, req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      { cart: cartData },
      `'${product.name}' moved from wishlist to cart successfully.`
    )
  );
});
