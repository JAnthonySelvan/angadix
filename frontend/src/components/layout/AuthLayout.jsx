import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ShieldCheck, Sparkles, Star } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-grid-pattern">
      {/* Decorative Gradient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-primary-300/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-primary-500/20 blur-[120px] pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] relative z-10">
        
        {/* Left Side: Brand Showcase Panel (Desktop) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-900/60 rounded-full blur-3xl" />

          {/* Header Brand */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform">
                <ShoppingBag size={20} className="text-white stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                ANGADIX<span className="text-primary-300">.</span>
              </span>
            </Link>
          </div>

          {/* Hero Copy */}
          <div className="my-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-primary-100 text-xs font-semibold mb-4">
              <Sparkles size={14} />
              <span>Next-Gen Commerce Experience</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight">
              Elevate Your Everyday Shopping Standard.
            </h1>

            <p className="text-sm text-primary-100/90 mt-3 leading-relaxed">
              Join thousands of discerning customers enjoying curated luxury, instant checkout, and encrypted security.
            </p>

            {/* Testimonial Badge */}
            <div className="mt-8 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary-300 border-2 border-primary-900 flex items-center justify-center font-bold text-xs text-primary-950">
                  JD
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-400 border-2 border-primary-900 flex items-center justify-center font-bold text-xs text-primary-950">
                  AK
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-300 text-amber-300" />
                  ))}
                </div>
                <p className="text-xs text-primary-100 font-medium mt-0.5">
                  Rated 4.9/5 by over 10,000+ shoppers
                </p>
              </div>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-primary-200/80 pt-4 border-t border-white/10">
            <ShieldCheck size={16} className="text-primary-300 shrink-0" />
            <span>256-bit SSL encrypted bank-grade authentication</span>
          </div>
        </div>

        {/* Right Side: Auth Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white relative">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto"
          >
            <Outlet />
          </motion.div>
        </div>

      </div>
    </div>
  );
};
