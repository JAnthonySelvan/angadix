import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ShieldCheck, Sparkles, Star } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-[#f0f8ff] dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Ambient Lighting Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#0266C8]/20 dark:bg-sky-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-sky-400/20 dark:bg-[#0266C8]/15 blur-[130px] pointer-events-none" />

      {/* Main Split-Screen Luxury Card Container */}
      <div className="w-full max-w-5xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] relative z-10">
        
        {/* Left Side: Luxury Brand Showcase Panel (Desktop) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0a2540] via-[#0266C8] to-[#003c78] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#0a2540]/80 rounded-full blur-3xl" />

          {/* Header Brand Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/logo-dark.png"
                alt="Angadix Logo"
                className="h-11 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform"
              />
            </Link>
          </div>

          {/* Hero Copy & Luxury Tagline */}
          <div className="my-8 relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sky-200 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles size={14} className="text-amber-300" />
              <span>Next-Gen Premium Store</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight font-outfit">
              Elevate Your Everyday Shopping Standard.
            </h1>

            <p className="text-xs lg:text-sm text-sky-100/90 leading-relaxed font-body">
              Join thousands of discerning customers enjoying curated luxury electronics, instant checkout, and bank-grade security.
            </p>

            {/* Testimonial & Rating Badge */}
            <div className="mt-8 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3.5 shadow-inner">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-sky-300 border-2 border-[#0a2540] flex items-center justify-center font-bold text-xs text-[#0a2540]">
                  AX
                </div>
                <div className="w-8 h-8 rounded-full bg-sky-200 border-2 border-[#0a2540] flex items-center justify-center font-bold text-xs text-[#0a2540]">
                  KD
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-300 text-amber-300" />
                  ))}
                </div>
                <p className="text-xs text-white font-bold mt-0.5">
                  Rated 4.9/5 by 10,000+ happy shoppers
                </p>
              </div>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-sky-200/90 pt-4 border-t border-white/15">
            <ShieldCheck size={16} className="text-sky-300 shrink-0" />
            <span className="font-semibold">256-bit SSL Encrypted Bank-Grade Security</span>
          </div>
        </div>

        {/* Right Side: Auth Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900 relative transition-colors duration-300">
          <motion.div
            initial={{ opacity: 0, x: 15 }}
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
