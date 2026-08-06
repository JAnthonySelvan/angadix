import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';

/**
 * Internal helper to calculate cart totals and format cart payload
 */
export const calculateAndFormatCart = async (cart, userId) => {
  if (!cart) {
    return {
      items: [],
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      itemCount: 0,
      appliedCoupon: null,
    };
  }

  // Ensure items are populated with necessary product fields
  await cart.populate({
    path: 'items.product',
    select: 'name slug images price discountPrice stock category isActive',
  });

  let subtotal = 0;
  let itemCount = 0;
  const formattedItems = [];
  let cartNeedsSave = false;

  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isActive) {
      // Product deleted or deactivated
      formattedItems.push({
        _id: item._id,
        product: product
          ? {
              _id: product._id,
              name: product.name,
              slug: product.slug,
              images: product.images,
              price: product.price,
              discountPrice: product.discountPrice,
              stock: product.stock,
              category: product.category,
              isActive: product.isActive,
            }
          : null,
        quantity: item.quantity,
        priceAtAdd: item.priceAtAdd,
        addedAt: item.addedAt,
        unavailable: true,
      });
      continue;
    }

    const effectivePrice =
      product.discountPrice !== null && product.discountPrice !== undefined
        ? product.discountPrice
        : product.price;

    const lineTotal = effectivePrice * item.quantity;
    subtotal += lineTotal;
    itemCount += item.quantity;

    formattedItems.push({
      _id: item._id,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        category: product.category,
        isActive: product.isActive,
      },
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
      addedAt: item.addedAt,
      unavailable: false,
      lineTotal,
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;

  // Coupon discount calculation
  let discountAmount = 0;
  if (cart.appliedCoupon && cart.appliedCoupon.code) {
    const coupon = await Coupon.findOne({
      code: cart.appliedCoupon.code.toUpperCase(),
    });

    if (!coupon) {
      cart.appliedCoupon = null;
      cartNeedsSave = true;
    } else {
      const validation = coupon.isValidForUse(subtotal, userId);
      if (!validation.valid) {
        // Coupon no longer valid for updated cart subtotal
        cart.appliedCoupon = null;
        cartNeedsSave = true;
      } else {
        // Calculate eligible subtotal for category-restricted coupons
        let eligibleSubtotal = subtotal;
        if (
          coupon.applicableCategories &&
          coupon.applicableCategories.length > 0
        ) {
          const categoryIds = coupon.applicableCategories.map((catId) =>
            catId.toString()
          );
          eligibleSubtotal = formattedItems.reduce((sum, item) => {
            if (
              !item.unavailable &&
              item.product &&
              item.product.category &&
              categoryIds.includes(item.product.category.toString())
            ) {
              return sum + item.lineTotal;
            }
            return sum;
          }, 0);
        }

        if (eligibleSubtotal <= 0) {
          cart.appliedCoupon = null;
          cartNeedsSave = true;
        } else {
          let computedDiscount = 0;
          if (coupon.discountType === 'percentage') {
            computedDiscount = eligibleSubtotal * (coupon.discountValue / 100);
            if (
              coupon.maxDiscountAmount !== null &&
              coupon.maxDiscountAmount !== undefined
            ) {
              computedDiscount = Math.min(
                computedDiscount,
                coupon.maxDiscountAmount
              );
            }
          } else if (coupon.discountType === 'flat') {
            computedDiscount = Math.min(coupon.discountValue, subtotal);
          }

          discountAmount = Math.round(computedDiscount * 100) / 100;
          if (cart.appliedCoupon.discountAmount !== discountAmount) {
            cart.appliedCoupon.discountAmount = discountAmount;
            cartNeedsSave = true;
          }
        }
      }
    }
  }

  if (cartNeedsSave) {
    await cart.save();
  }

  const total = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

  return {
    items: formattedItems,
    subtotal,
    discountAmount,
    total,
    itemCount,
    appliedCoupon: cart.appliedCoupon || null,
  };
};

// 1. Get Current User Cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const cartData = await calculateAndFormatCart(cart, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cartData, 'Cart retrieved successfully.'));
});

// 2. Add Item to Cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const requestedQty = parseInt(quantity, 10);

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found or is currently unavailable.');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  let targetQuantity = requestedQty;
  if (existingItemIndex > -1) {
    targetQuantity = cart.items[existingItemIndex].quantity + requestedQty;
  }

  if (product.stock < targetQuantity) {
    throw new ApiError(
      400,
      `Only ${product.stock} units of '${product.name}' are currently in stock.`
    );
  }

  const effectivePrice =
    product.discountPrice !== null && product.discountPrice !== undefined
      ? product.discountPrice
      : product.price;

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity = targetQuantity;
    cart.items[existingItemIndex].priceAtAdd = effectivePrice;
  } else {
    cart.items.push({
      product: productId,
      quantity: targetQuantity,
      priceAtAdd: effectivePrice,
    });
  }

  await cart.save();

  const cartData = await calculateAndFormatCart(cart, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cartData, 'Item added to cart successfully.'));
});

// 3. Update Cart Item Quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const newQty = parseInt(quantity, 10);

  if (newQty < 1) {
    throw new ApiError(
      400,
      'Quantity must be at least 1. To remove an item, use the DELETE endpoint.'
    );
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found or is currently unavailable.');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, 'Cart not found.');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart.');
  }

  if (product.stock < newQty) {
    throw new ApiError(
      400,
      `Only ${product.stock} units of '${product.name}' are currently in stock.`
    );
  }

  cart.items[itemIndex].quantity = newQty;
  await cart.save();

  const cartData = await calculateAndFormatCart(cart, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cartData, 'Cart item quantity updated.'));
});

// 4. Remove Item from Cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, 'Cart not found.');
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );
  await cart.save();

  const cartData = await calculateAndFormatCart(cart, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cartData, 'Item removed from cart.'));
});

// 5. Clear Entire Cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        items: [],
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        itemCount: 0,
        appliedCoupon: null,
      },
      'Cart cleared successfully.'
    )
  );
});

// 6. Apply Coupon to Cart
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const couponCode = code.trim().toUpperCase();

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cannot apply coupon to an empty cart.');
  }

  // Calculate current cart subtotal and eligible items first
  let cartData = await calculateAndFormatCart(cart, req.user._id);
  if (cartData.subtotal <= 0) {
    throw new ApiError(400, 'Cannot apply coupon to a cart with subtotal of 0.');
  }

  const coupon = await Coupon.findOne({ code: couponCode });
  if (!coupon) {
    throw new ApiError(404, 'Invalid or non-existent coupon code.');
  }

  const validation = coupon.isValidForUse(cartData.subtotal, req.user._id);
  if (!validation.valid) {
    throw new ApiError(400, validation.reason);
  }

  // Calculate category specific subtotal if restricted
  let eligibleSubtotal = cartData.subtotal;
  if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
    const categoryIds = coupon.applicableCategories.map((c) => c.toString());
    eligibleSubtotal = cartData.items.reduce((sum, item) => {
      if (
        !item.unavailable &&
        item.product &&
        item.product.category &&
        categoryIds.includes(item.product.category.toString())
      ) {
        return sum + item.lineTotal;
      }
      return sum;
    }, 0);
  }

  if (eligibleSubtotal <= 0) {
    throw new ApiError(
      400,
      'This coupon is not applicable to any products currently in your cart.'
    );
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = eligibleSubtotal * (coupon.discountValue / 100);
    if (coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount !== undefined) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === 'flat') {
    discountAmount = Math.min(coupon.discountValue, cartData.subtotal);
  }

  discountAmount = Math.round(discountAmount * 100) / 100;

  cart.appliedCoupon = {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
  };

  await cart.save();

  cartData = await calculateAndFormatCart(cart, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cartData, `Coupon '${coupon.code}' applied successfully.`));
});

// 7. Remove Coupon from Cart
export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.appliedCoupon = null;
    await cart.save();
  }

  const cartData = await calculateAndFormatCart(cart, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cartData, 'Coupon removed from cart.'));
});

// 8. Merge Local/Guest Cart on Login
export const mergeCart = asyncHandler(async (req, res) => {
  const { items } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  for (const incomingItem of items) {
    const { productId, quantity = 1 } = incomingItem;
    const requestedQty = Math.max(1, parseInt(quantity, 10));

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      continue; // Skip invalid or inactive products during merge
    }

    const existingIndex = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );

    const effectivePrice =
      product.discountPrice !== null && product.discountPrice !== undefined
        ? product.discountPrice
        : product.price;

    if (existingIndex > -1) {
      const mergedQty = cart.items[existingIndex].quantity + requestedQty;
      cart.items[existingIndex].quantity = Math.min(mergedQty, product.stock);
      cart.items[existingIndex].priceAtAdd = effectivePrice;
    } else {
      const initialQty = Math.min(requestedQty, product.stock);
      if (initialQty > 0) {
        cart.items.push({
          product: productId,
          quantity: initialQty,
          priceAtAdd: effectivePrice,
        });
      }
    }
  }

  await cart.save();

  const cartData = await calculateAndFormatCart(cart, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cartData, 'Cart merged successfully.'));
});
