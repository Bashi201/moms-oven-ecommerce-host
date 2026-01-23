'use client';

import Link from 'next/link';
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cartStore';
import { useAuthStore } from '@/lib/authStore';
import Image from 'next/image';

export default function Navbar() {
  const { items, loadCart } = useCartStore();
 const { initializeAuth, isLoading, user, logout } = useAuthStore();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
  initializeAuth();
}, [initializeAuth]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-amber-100' 
            : 'bg-gradient-to-b from-white via-amber-50/50 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group relative z-10"
            >
              <div className="relative w-14 h-14 flex-shrink-0">
                {/* Animated Orange Frame */}
                <div className="absolute inset-0 rounded-xl border-2 border-orange-500 animate-pulse"></div>
                <div className="absolute inset-0 rounded-xl border-2 border-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Logo Container */}
                <div className="absolute inset-1 bg-white rounded-lg shadow-md flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                  <Image
                    src="/logo.png"
                    alt="Mom's Oven"
                    width={44}
                    height={44}
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                    priority
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
                  Mom's Oven
                </span>
                <span className="text-xs text-amber-700/70 font-medium tracking-wider uppercase">
                  Baked with Love
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' }
              ].map((link, idx) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-5 py-2 text-sm font-semibold text-gray-700 hover:text-amber-600 transition-colors duration-300 group"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-3/4 transition-all duration-300"></span>
                </Link>
              ))}
              
              {/* My Orders Link - Only show if logged in and not admin */}
              {user && !isAdmin && (
                <Link
                  href="/orders"
                  className="relative px-5 py-2 text-sm font-semibold text-gray-700 hover:text-amber-600 transition-colors duration-300 group"
                >
                  My Orders
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-3/4 transition-all duration-300"></span>
                </Link>
              )}
              
              {/* Admin Dashboard Link - Desktop */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="relative px-5 py-2 text-sm font-semibold text-purple-700 hover:text-purple-600 transition-colors duration-300 group"
                >
                  Dashboard
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-violet-500 group-hover:w-3/4 transition-all duration-300"></span>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                </Link>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Cart */}
              <Link 
                href="/cart" 
                className="relative group"
              >
                <div className={`relative p-3 rounded-2xl transition-all duration-300 ${
                  scrolled 
                    ? 'bg-amber-50 hover:bg-amber-100' 
                    : 'bg-white/80 hover:bg-white shadow-lg'
                }`}>
                  <ShoppingCartIcon className="h-6 w-6 text-amber-700 group-hover:text-amber-600 transition-colors" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-500 to-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-bounce">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>

              {/* User Menu - Desktop */}
              {user ? (
                <div className="hidden lg:flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl px-4 py-2.5 shadow-md border border-amber-200/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm ${
                      isAdmin 
                        ? 'bg-gradient-to-br from-purple-500 to-violet-600' 
                        : 'bg-gradient-to-br from-amber-500 to-orange-600'
                    }`}>
                      {(user.username || user.email?.split('@')[0] || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-semibold text-sm">
                        {user.username || user.email?.split('@')[0]}
                      </span>
                      {isAdmin && (
                        <span className="text-xs text-purple-600 font-bold">Admin</span>
                      )}
                    </div>
                  </div>
                  <div className="w-px h-5 bg-amber-300"></div>
                  <button
                    onClick={() => {
                      logout();
                      router.push('/login');
                    }}
                    className="text-amber-700 hover:text-amber-900 font-semibold transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link 
                    href="/login" 
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-amber-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/80 hover:bg-white shadow-lg transition-all"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6 text-gray-700" />
                ) : (
                  <Bars3Icon className="h-6 w-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed top-20 left-0 right-0 bottom-0 z-40 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 overflow-y-auto ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <div className="space-y-1">
                {[
                  { href: '/', label: 'Home', icon: '🏠' },
                  { href: '/about', label: 'About Us', icon: '👩‍🍳' },
                  { href: '/contact', label: 'Contact', icon: '📧' },
                  { href: '/cart', label: 'Cart', icon: '🛒' }
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {link.icon}
                    </span>
                    <span className="text-lg font-semibold text-gray-800 group-hover:text-amber-600">
                      {link.label}
                    </span>
                  </Link>
                ))}
                
                {/* My Orders Link - Mobile (only for logged-in customers) */}
                {user && !isAdmin && (
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      📦
                    </span>
                    <span className="text-lg font-semibold text-gray-800 group-hover:text-amber-600">
                      My Orders
                    </span>
                  </Link>
                )}
                
                {/* Admin Dashboard Link - Mobile */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 transition-all duration-300 group border-2 border-purple-200"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      📊
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-purple-700 group-hover:text-purple-800">
                        Dashboard
                      </span>
                      <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">
                        ADMIN
                      </span>
                    </div>
                  </Link>
                )}
              </div>

              {/* User Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                {user ? (
                  <div className="space-y-3">
                    <div className={`flex items-center gap-3 p-3 rounded-2xl ${
                      isAdmin 
                        ? 'bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200' 
                        : 'bg-gradient-to-r from-amber-50 to-orange-50'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm ${
                        isAdmin 
                          ? 'bg-gradient-to-br from-purple-500 to-violet-600' 
                          : 'bg-gradient-to-br from-amber-500 to-orange-600'
                      }`}>
                        {(user.username || user.email?.split('@')[0] || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Logged in as</div>
                        <div className="font-bold text-gray-900">
                          {user.username || user.email?.split('@')[0]}
                        </div>
                        {isAdmin && (
                          <div className="text-xs text-purple-600 font-bold mt-0.5">
                            Administrator
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        router.push('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-pink-600 shadow-lg transition-all"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-6 py-2.5 bg-white text-amber-700 font-bold rounded-xl border-2 border-amber-500 hover:bg-amber-50 transition-all text-center"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-lg transition-all text-center"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-20"></div>
    </>
  );
}