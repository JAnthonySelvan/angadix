import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, ArrowRight, ShieldCheck, Truck, Award, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useAppSelector } from '../app/hooks';

export const Home = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-grid-pattern">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-300/30 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center max-w-3xl"
          >
            {/* Announcement Badge */}
            <Badge variant="primary" size="lg" className="mb-6 shadow-sm border border-primary-200">
              <Sparkles size={14} className="text-primary-800" />
              <span>Phase 1 Architecture Live & Synchronized</span>
            </Badge>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Redefining <span className="text-gradient">Premium</span> E-Commerce Standards.
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 mt-6 leading-relaxed max-w-2xl font-normal">
              Experience flawless dual-token security, instant cookie authentication, and a curated catalog designed for the modern lifestyle.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              {isAuthenticated ? (
                <div className="flex items-center gap-3 bg-white p-2 pl-4 rounded-2xl shadow-lg border border-slate-100">
                  <div className="text-left">
                    <p className="text-xs text-slate-400 font-semibold uppercase">Authenticated as</p>
                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                  </div>
                  <Badge variant="success" size="md">
                    SESSION ACTIVE
                  </Badge>
                </div>
              ) : (
                <>
                  <Link to="/register">
                    <Button variant="primary" size="lg" className="shadow-lg shadow-primary-800/25">
                      <span>Create Account</span>
                      <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </Link>

                  <Link to="/login">
                    <Button variant="secondary" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Quality & Speed
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Built upon solid architectural foundations with enterprise-level security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="bordered" className="flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center font-bold">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Encrypted JWT Sessions</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Short-lived access tokens combined with httpOnly refresh token cookies and auto-retry interceptors.
              </p>
            </Card>

            <Card variant="bordered" className="flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center font-bold">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Vite & Redux Toolkit</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Blazing fast module bundling paired with predictable global authentication state hydration.
              </p>
            </Card>

            <Card variant="bordered" className="flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center font-bold">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Tailwind Design System</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Customized color palettes, Plus Jakarta Sans typography, and subtle micro-interactions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Catalog Skeleton Preview Section (Phase 2 Readiness) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <Badge variant="slate" size="sm" className="mb-2">
                COMING SOON IN PHASE 2
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Curated Product Catalog
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xs">
              Demonstrating Phase 2 Skeleton Loader UI layout architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-3">
                <Skeleton height="200px" className="w-full rounded-xl" />
                <Skeleton height="16px" className="w-3/4" />
                <Skeleton height="14px" className="w-1/2" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton height="20px" className="w-1/3" />
                  <Skeleton height="32px" className="w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
