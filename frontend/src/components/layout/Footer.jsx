import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, Headphones, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Value Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-900/60 text-primary-400 rounded-xl border border-primary-800/40">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Express Worldwide Shipping</h4>
              <p className="text-xs text-slate-400 mt-1">Complimentary shipping on orders over $150.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-900/60 text-primary-400 rounded-xl border border-primary-800/40">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Authenticity Guaranteed</h4>
              <p className="text-xs text-slate-400 mt-1">100% verified premium items sourced direct.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-900/60 text-primary-400 rounded-xl border border-primary-800/40">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">30-Day Effortless Returns</h4>
              <p className="text-xs text-slate-400 mt-1">Hassle-free return and exchange policy.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-900/60 text-primary-400 rounded-xl border border-primary-800/40">
              <Headphones size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">24/7 Dedicated Concierge</h4>
              <p className="text-xs text-slate-400 mt-1">Expert support whenever you need assistance.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 py-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white">
                <ShoppingBag size={20} className="stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                ANGADIX<span className="text-primary-400">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Angadix is a modern, luxury e-commerce platform curating high-performance fashion, electronics, and lifestyle products. Crafted for individuals who demand perfection.
            </p>
            {/* Newsletter */}
            <div className="mt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Subscribe for Exclusive Releases
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                />
                <Button variant="primary" size="md" className="shrink-0">
                  <ArrowRight size={18} />
                </Button>
              </form>
            </div>
          </div>

          {/* Quick Links Columns */}
          <div>
            <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Store Catalog</h5>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li><a href="#new" className="hover:text-white transition-colors">New Arrivals</a></li>
              <li><a href="#bestsellers" className="hover:text-white transition-colors">Best Sellers</a></li>
              <li><a href="#electronics" className="hover:text-white transition-colors">Tech & Devices</a></li>
              <li><a href="#apparel" className="hover:text-white transition-colors">Apparel & Footwear</a></li>
              <li><a href="#accessories" className="hover:text-white transition-colors">Luxury Accessories</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Company</h5>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li><a href="#about" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#sustainability" className="hover:text-white transition-colors">Sustainability</a></li>
              <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#press" className="hover:text-white transition-colors">Press & Media</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Support & Legal</h5>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li><a href="#help" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#returns" className="hover:text-white transition-colors">Returns & Refunds</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Angadix Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms</span>
            <span className="hover:text-slate-400 cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
