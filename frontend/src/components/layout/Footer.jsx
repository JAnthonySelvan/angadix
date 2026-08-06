import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, CreditCard, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 5-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: About ANGADIX */}
          <div className="space-y-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black">
                <ShoppingBag size={18} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                ANGADIX<span className="text-primary-500">.</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              ANGADIX is a modern e-commerce platform delivering premium renders, top-tier consumer electronics, fashion, and lifestyle items with 100% authentic quality guarantee.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primary-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-bold">
                f
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primary-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-bold">
                t
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primary-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-bold">
                in
              </div>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/shop?category=electronics" className="hover:text-primary-400 transition-colors">Electronics & Audio</Link></li>
              <li><Link to="/shop?category=mobiles" className="hover:text-primary-400 transition-colors">Smartphones & Wearables</Link></li>
              <li><Link to="/shop?category=laptops" className="hover:text-primary-400 transition-colors">Laptops & Computers</Link></li>
              <li><Link to="/shop?category=home-kitchen" className="hover:text-primary-400 transition-colors">Home & Living</Link></li>
              <li><Link to="/shop?category=fashion" className="hover:text-primary-400 transition-colors">Fashion & Apparel</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#help" className="hover:text-primary-400 transition-colors">Help Center & FAQ</a></li>
              <li><a href="#returns" className="hover:text-primary-400 transition-colors">Track Order Status</a></li>
              <li><a href="#shipping" className="hover:text-primary-400 transition-colors">Shipping & Delivery Policy</a></li>
              <li><a href="#returns" className="hover:text-primary-400 transition-colors">30-Day Easy Returns</a></li>
              <li><a href="#privacy" className="hover:text-primary-400 transition-colors">Terms & Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 4: Quick Account */}
          <div>
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4">
              My Account
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/me" className="hover:text-primary-400 transition-colors">User Profile</Link></li>
              <li><Link to="/shop?wishlist=true" className="hover:text-primary-400 transition-colors">My Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-primary-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Sign In / Register</Link></li>
            </ul>
          </div>

          {/* Column 5: Contact Info */}
          <div>
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span>123 Innovation Park, Tech Corridor, Bangalore, KA 560100</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-primary-500 flex-shrink-0" />
                <span>+91 1800-264-2349 (Toll Free)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-primary-500 flex-shrink-0" />
                <span>support@angadix.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Payment Gateways & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ANGADIX Store. All rights reserved. Built with Node.js & React.</p>

          {/* Payment Gateway Badges */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Secured Payments:</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-extrabold text-slate-300 border border-slate-700">
                VISA
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-extrabold text-slate-300 border border-slate-700">
                MC
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-extrabold text-slate-300 border border-slate-700">
                PAYPAL
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-extrabold text-slate-300 border border-slate-700">
                STRIPE
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
