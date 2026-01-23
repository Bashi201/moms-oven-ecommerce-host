'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCartStore } from '@/lib/cartStore';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import { CheckCircleIcon, TruckIcon, CreditCardIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { token, user } = useAuthStore();

  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Redirect if not logged in or cart empty
  useEffect(() => {
    if (!token) {
      router.push('/login?redirect=/checkout');
    } else if (items.length === 0) {
      router.push('/cart');
    }
  }, [token, items, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/orders', {
        address: formData.address.trim(),
      });

      setOrderId(response.data.orderId);
      setSuccess(true);
      clearCart();

      setTimeout(() => {
        router.push(`/orders?orderId=${response.data.orderId}`);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deliveryFee = 300;
  const finalTotal = Number(total || 0) + deliveryFee;

  // Success State
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-2 border-green-100">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircleIcon className="h-14 w-14 text-white" />
            </div>

            {/* Success Message */}
            <h1 className="text-4xl font-black text-gray-900 mb-4">
              Order Placed Successfully! 🎉
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Thank you for your order! Your delicious cakes are on their way.
            </p>

            {/* Order ID */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-8 border-2 border-amber-200">
              <p className="text-sm text-gray-600 mb-2">Your Order ID</p>
              <p className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                #{orderId || 'N/A'}
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <TruckIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-blue-900">Estimated Delivery</p>
                <p className="text-xs text-blue-700 mt-1">Within 1-2 business days</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <CreditCardIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-green-900">Payment Method</p>
                <p className="text-xs text-green-700 mt-1">Cash on Delivery</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/orders"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                View My Orders
              </Link>
              <Link
                href="/"
                className="px-8 py-4 bg-white border-2 border-amber-500 text-amber-700 rounded-2xl font-bold hover:bg-amber-50 transition-all duration-300 hover:scale-105"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Redirecting Message */}
            <p className="text-sm text-gray-500 mt-8 animate-pulse">
              Redirecting to your orders page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Form
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-3">
            Secure <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Checkout</span>
          </h1>
          <p className="text-gray-600 text-lg">Just one more step to enjoy your delicious cakes!</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                ✓
              </div>
              <span className="text-sm font-semibold text-gray-700">Cart</span>
            </div>
            <div className="flex-1 h-1 bg-amber-500 mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                2
              </div>
              <span className="text-sm font-semibold text-amber-700">Checkout</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold mb-2">
                3
              </div>
              <span className="text-sm font-semibold text-gray-500">Complete</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-r-xl flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="font-bold mb-1">Order Failed</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Details Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Info Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user?.username || 'User'}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Delivery Form */}
            <div className="bg-white rounded-2xl shadow-md p-8 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TruckIcon className="h-7 w-7 text-amber-600" />
                Delivery Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Address */}
                <div>
                  <label className="block text-gray-800 font-bold mb-2 text-sm flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-amber-600" />
                    Delivery Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-gray-900 resize-none"
                    placeholder="No 45, Peradeniya Road, Kandy, Central Province"
                  />
                  <p className="text-xs text-gray-500 mt-2">Please provide your complete delivery address</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-800 font-bold mb-2 text-sm flex items-center gap-2">
                    <PhoneIcon className="h-5 w-5 text-amber-600" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-gray-900"
                    placeholder="077 123 4567"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-gray-800 font-bold mb-2 text-sm">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-gray-900 resize-none"
                    placeholder="Special instructions for delivery..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform shadow-lg ${
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
                      Placing Your Order...
                    </span>
                  ) : (
                    'Place Order - Cash on Delivery'
                  )}
                </button>

                <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                  <span>🔒</span>
                  <span>Secure checkout process</span>
                </p>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-amber-100 sticky top-24">
              <h2 className="text-xl font-black text-gray-900 mb-6 pb-4 border-b-2 border-gray-100">
                Order Summary
              </h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.cartId ?? item.cakeId} className="flex gap-3">
                    {item.images?.[0] ? (
                      <img
                        src={`http://localhost:5000${item.images[0]}`}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center text-2xl">
                        🍰
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {item.quantity} x Rs. {Number(item.price ?? 0).toFixed(2)}
                      </p>
                      <p className="text-sm font-bold text-amber-600">
                        Rs. {(Number(item.price ?? 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 pt-4 border-t-2 border-gray-100">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">Rs. {Number(total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Delivery Fee</span>
                  <span className="font-semibold">Rs. {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t-2 border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                    Rs. {finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCardIcon className="h-6 w-6 text-green-600" />
                    <span className="font-bold text-green-900">Cash on Delivery</span>
                  </div>
                  <p className="text-xs text-green-700">
                    Pay with cash when your delicious cakes arrive at your doorstep
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}