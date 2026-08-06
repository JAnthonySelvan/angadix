import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight, Plus, Minus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setCartDrawerOpen,
  removeFromCart,
  updateQuantity,
  selectCartItems,
  selectCartTotalPrice,
  clearCart,
} from '../../features/cart/cartSlice';
import { Link } from 'react-router-dom';

export const CartDrawer = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.cart.isCartOpen);
  const items = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectCartTotalPrice);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => dispatch(setCartDrawerOpen(false))}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">Your Shopping Cart</h2>
                  <p className="text-xs text-slate-500 font-medium">{items.length} items selected</p>
                </div>
              </div>

              <button
                onClick={() => dispatch(setCartDrawerOpen(false))}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                    <ShoppingBag size={36} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Your cart is empty</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs">
                    Explore our high-quality product collection and add your favorite items.
                  </p>
                </div>
              ) : (
                items.map(({ product, quantity }) => {
                  const itemPrice = product.discountPrice || product.price;
                  const itemImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800';

                  return (
                    <div
                      key={product._id}
                      className="flex gap-4 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      <img
                        src={itemImage}
                        alt={product.name}
                        className="w-20 h-20 rounded-xl object-contain bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800"
                      />

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">
                              {product.name}
                            </h4>
                            <button
                              onClick={() => dispatch(removeFromCart(product._id))}
                              className="text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                            ₹{itemPrice.toLocaleString('en-IN')}
                          </p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                            <button
                              onClick={() =>
                                dispatch(updateQuantity({ productId: product._id, quantity: quantity - 1 }))
                              }
                              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                              {quantity}
                            </span>
                            <button
                              onClick={() =>
                                dispatch(updateQuantity({ productId: product._id, quantity: quantity + 1 }))
                              }
                              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            ₹{(itemPrice * quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Shipping</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs">
                      FREE
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Total Amount</span>
                    <span className="text-primary-600 dark:text-primary-400">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => dispatch(clearCart())}
                    className="py-3 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    Clear
                  </button>

                  <button
                    onClick={() => {
                      dispatch(setCartDrawerOpen(false));
                    }}
                    className="flex-1 py-3.5 px-6 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
