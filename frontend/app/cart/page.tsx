'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingBagIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/lib/cartStore';
import { getImageUrl } from '@/lib/imageUrl';
import Link from 'next/link';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, loadCart, clearCart } = useCartStore();
  const router = useRouter();
  const [removingItem, setRemovingItem] = useState<number | null>(null);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = async (cartId: number, newQty: number) => {
    if (newQty < 1) return;
    await updateQuantity(cartId, newQty);
  };

  const handleRemove = async (cartId: number) => {
    setRemovingItem(cartId);
    setTimeout(async () => {
      await removeItem(cartId);
      setRemovingItem(null);
    }, 300);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    router.push('/checkout');
  };

  const deliveryFee = 300;
  const finalTotal = Number(total || 0) + deliveryFee;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-3">
            Your Shopping <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Cart</span>
          </h1>
          <p className="text-gray-600 text-lg">Review your items and proceed to checkout</p>
        </div>

        {items.length === 0 ? (
          // Empty Cart State
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-gray-100">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingBagIcon className="h-16 w-16 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Looks like you haven't added any delicious cakes yet. Start shopping and make your moments sweeter!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span>Browse Our Cakes</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-4">
              {/* Items Header */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Cart Items <span className="text-amber-600">({items.length})</span>
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold transition-colors flex items-center gap-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Clear All
                  </button>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.cartId ?? `cart-${item.cakeId}-${item.name}-${index}`}
                    className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-amber-200 overflow-hidden ${
                      removingItem === item.cartId ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      transition: 'all 0.3s ease-out'
                    }}
                  >
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {item.images?.[0] ? (
                            <div className="relative w-32 h-32 rounded-xl overflow-hidden group">
                              <img
                                src={getImageUrl(item.images[0])}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          ) : (
                            <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                              <span className="text-5xl">🍰</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {item.name || 'Unnamed Cake'}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm text-gray-500">Price per item:</span>
                              <span className="text-lg font-bold text-amber-600">
                                Rs. {Number(item.price ?? 0).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Quantity Controls & Actions */}
                          <div className="flex flex-wrap items-center gap-4">
                            {/* Quantity Selector */}
                            <div className="flex items-center bg-amber-50 rounded-xl border-2 border-amber-200">
                              <button
                                onClick={() => handleQuantityChange(item.cartId!, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-3 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-l-xl"
                              >
                                <MinusIcon className="h-5 w-5 text-amber-700" />
                              </button>
                              <span className="px-6 py-3 font-bold text-gray-900 min-w-[60px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.cartId!, item.quantity + 1)}
                                className="p-3 hover:bg-amber-100 transition-colors rounded-r-xl"
                              >
                                <PlusIcon className="h-5 w-5 text-amber-700" />
                              </button>
                            </div>

                            {/* Item Subtotal */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                              <span className="text-sm text-gray-600">Subtotal:</span>
                              <span className="text-xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                                Rs. {(Number(item.price ?? 0) * item.quantity).toFixed(2)}
                              </span>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemove(item.cartId!)}
                              className="ml-auto p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all hover:scale-110"
                              title="Remove item"
                            >
                              <TrashIcon className="h-6 w-6" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-semibold transition-colors"
                >
                  <span>←</span>
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-amber-100 sticky top-24">
                <h2 className="text-2xl font-black text-gray-900 mb-6 pb-4 border-b-2 border-gray-100">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {/* Items Count */}
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Items ({items.length})</span>
                    <span className="font-semibold">Rs. {Number(total || 0).toFixed(2)}</span>
                  </div>

                  {/* Delivery Fee */}
                  <div className="flex justify-between text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Delivery Fee</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                        Standard
                      </span>
                    </div>
                    <span className="font-semibold">Rs. {deliveryFee.toFixed(2)}</span>
                  </div>

                  {/* Divider */}
                  <div className="border-t-2 border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total</span>
                      <span className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                        Rs. {finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg mb-4 flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </button>

                {/* Payment Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-xl">
                    <span className="text-xl">✓</span>
                    <span className="font-medium">Cash on Delivery Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-xl">
                    <span className="text-xl">🔒</span>
                    <span className="font-medium">Secure Checkout Process</span>
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3 font-semibold">Have a promo code?</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
                    />
                    <button className="px-4 py-2 bg-amber-100 text-amber-700 font-semibold rounded-xl hover:bg-amber-200 transition-colors text-sm">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}