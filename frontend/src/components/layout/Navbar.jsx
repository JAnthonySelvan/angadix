import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authThunks';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Logout error');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/#collections' },
    { name: 'Featured', path: '/#featured' },
    { name: 'About', path: '/#about' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled ? 'glass-nav shadow-md py-3' : 'bg-white/70 backdrop-blur-md border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-900 via-primary-800 to-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-800/30 group-hover:scale-105 transition-transform">
            <ShoppingBag size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
              ANGADIX<span className="text-primary-800">.</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-800 leading-none mt-0.5">
              PREMIUM
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-sm font-semibold text-slate-600 hover:text-primary-800 transition-colors relative py-1"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth / Action Area */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-primary-300 bg-white hover:bg-slate-50 transition-all focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary-800 text-white flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown size={16} className="text-slate-400 mr-1" />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-xl mb-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                        {user.email}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'error' : 'primary'} size="sm">
                          {user.role === 'admin' && <Shield size={10} className="mr-0.5" />}
                          {user.role.toUpperCase()}
                        </Badge>
                        <Badge variant="success" size="sm">
                          VERIFIED
                        </Badge>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/me"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary-800 transition-colors"
                      >
                        <UserIcon size={16} />
                        <span>My Account</span>
                      </Link>

                      {user.role === 'admin' && (
                        <div className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-amber-700 rounded-lg bg-amber-50/60 my-1">
                          <Sparkles size={16} />
                          <span>Admin Portal Ready</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-semantic-error rounded-lg hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden px-4 py-4"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-base font-semibold text-slate-700 hover:text-primary-800 py-2 border-b border-slate-100"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-2">
                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Button variant="danger" size="md" onClick={handleLogout} className="w-full">
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link to="/login">
                      <Button variant="outline" size="md" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="primary" size="md" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
