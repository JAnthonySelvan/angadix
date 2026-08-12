import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { FloatingCart } from '../cart/FloatingCart';
import { BackToTop } from '../common/BackToTop';

export const MainLayout = () => {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-slate-50 dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <CartDrawer />
      <FloatingCart />
      <BackToTop />
      <main className="flex-grow w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
