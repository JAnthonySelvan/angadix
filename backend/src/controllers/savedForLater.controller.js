import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { SavedForLater } from '../models/SavedForLater.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { calculateAndFormatCart } from './cart.controller.js';

const getPopulatedSavedForLater = async (userId) => {
  let savedList = await SavedForLater.findOne({ user: userId });
  if (!savedList) {
    savedList = await SavedForLater.create({ user: userId, items: [] });
  }

  await savedList.populate({
    path: 'items.product',
    select: 'name slug images price discountPrice stock ratingsAverage isActive',
  });

  return savedList;
};

// 1. Get Saved For Later List
export const getSavedForLater = asyncHandler(async (req, res) => {
  const savedList = await getPopulatedSavedForLater(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, savedList, 'Saved for later list retrieved.'));
});

// 2. Move Item from Cart to Saved for Later
export const moveToSavedForLater = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, 'Cart not found.');
  }

  const cartItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (cartItemIndex === -1) {
    throw new ApiError(404, 'Product not found in cart.');
  }

  const cartItem = cart.items[cartItemIndex];
  const itemQty = cartItem.quantity;

  let savedList = await SavedForLater.findOne({ user: req.user._id });
  if (!savedList) {
    savedList = new SavedForLater({ user: req.user._id, items: [] });
  }

  const existingSavedIndex = savedList.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingSavedIndex > -1) {
    savedList.items[existingSavedIndex].quantity += itemQty;
  } else {
    savedList.items.push({
      product: productId,
      quantity: itemQty,
    });
  }

  // Remove from cart
  cart.items.splice(cartItemIndex, 1);

  await cart.save();
  await savedList.save();

  const updatedSavedList = await getPopulatedSavedForLater(req.user._id);
  const updatedCart = await calculateAndFormatCart(cart, req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      { savedForLater: updatedSavedList, cart: updatedCart },
      'Item moved from cart to Saved for Later.'
    )
  );
});

// 3. Move Item from Saved for Later back to Cart
export const moveSavedToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const savedList = await SavedForLater.findOne({ user: req.user._id });
  if (!savedList) {
    throw new ApiError(404, 'Saved for Later list not found.');
  }

  const savedIndex = savedList.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (savedIndex === -1) {
    throw new ApiError(404, 'Product not found in Saved for Later list.');
  }

  const savedItem = savedList.items[savedIndex];
  const requestedQty = savedItem.quantity;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found or is currently unavailable.');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const cartIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  let targetQty = requestedQty;
  if (cartIndex > -1) {
    targetQty = cart.items[cartIndex].quantity + requestedQty;
  }

  if (product.stock < targetQty) {
    throw new ApiError(
      400,
      `Cannot move item back to cart. Only ${product.stock} units of '${product.name}' are available.`
    );
  }

  const effectivePrice =
    product.discountPrice !== null && product.discountPrice !== undefined
      ? product.discountPrice
      : product.price;

  if (cartIndex > -1) {
    cart.items[cartIndex].quantity = targetQty;
    cart.items[cartIndex].priceAtAdd = effectivePrice;
  } else {
    cart.items.push({
      product: productId,
      quantity: targetQty,
      priceAtAdd: effectivePrice,
    });
  }

  // Multi-step safety
  await cart.save();

  savedList.items.splice(savedIndex, 1);
  await savedList.save();

  const updatedCart = await calculateAndFormatCart(cart, req.user._id);
  const updatedSavedList = await getPopulatedSavedForLater(req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      { cart: updatedCart, savedForLater: updatedSavedList },
      `'${product.name}' moved back to cart.`
    )
  );
});

// 4. Remove Item from Saved for Later Permanently
export const removeFromSavedForLater = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const savedList = await SavedForLater.findOne({ user: req.user._id });
  if (!savedList) {
    throw new ApiError(404, 'Saved for Later list not found.');
  }

  savedList.items = savedList.items.filter(
    (item) => item.product.toString() !== productId
  );
  await savedList.save();

  const updatedSavedList = await getPopulatedSavedForLater(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSavedList, 'Item removed from Saved for Later.'));
});
