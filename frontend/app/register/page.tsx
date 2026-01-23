'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      const { token, user } = response.data;

      // Save to store + localStorage
      login(token, user);

      // Redirect to login page
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 py-12 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Register Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-amber-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Join Us Today!</h1>
            <p className="text-gray-600 text-lg">Create your account and start ordering</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-xl flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-gray-800 font-bold mb-2 text-sm">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">👤</span>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white text-gray-900"
                  placeholder="Your username"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-800 font-bold mb-2 text-sm">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">📧</span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white text-gray-900"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-800 font-bold mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">🔒</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-800 font-bold mb-2 text-sm">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">🔐</span>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                required
                className="w-4 h-4 mt-1 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <label className="text-sm text-gray-700">
                I agree to the <a href="#" className="text-amber-600 hover:underline font-semibold">Terms & Conditions</a> and <a href="#" className="text-amber-600 hover:underline font-semibold">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-xl hover:scale-105'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create My Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link 
              href="/login" 
              className="inline-block w-full py-4 px-6 border-2 border-amber-500 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-all duration-300 hover:scale-105"
            >
              Login to Existing Account
            </Link>
          </div>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <span>🔐</span>
              <span>Your data is secure and encrypted</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}