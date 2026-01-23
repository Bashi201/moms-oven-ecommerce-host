'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  TruckIcon, 
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface OrderItem {
  id: number;
  cake_id: number;
  quantity: number;
  price_at_purchase: number;
  name?: string;
  images?: string[];
}

interface Order {
  id: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_method: string;
  address: string;
  created_at: string;
  item_count: number;
  items?: OrderItem[];
}

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuthStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [highlightedOrderId, setHighlightedOrderId] = useState<number | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login?redirect=/orders');
      return;
    }

    fetchOrders();

    // Check if there's a specific order to highlight
    const orderId = searchParams.get('orderId');
    if (orderId) {
      const id = parseInt(orderId);
      setHighlightedOrderId(id);
      setExpandedOrders(new Set([id]));
      
      // Remove highlight after 5 seconds
      setTimeout(() => setHighlightedOrderId(null), 5000);
    }
  }, [token, router, searchParams]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders');
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

    const handleCancelOrder = async (orderId: number) => {
  if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
    return;
  }

  try {
    setCancellingOrderId(orderId);
    
    await api.put(`/orders/${orderId}/cancel`);
    
    // Option 1: optimistic update (fastest)
    setOrders(prev => 
      prev.map(o => 
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      )
    );

    // Option 2: refresh full list (more reliable)
    // await fetchOrders();

    alert('Order cancelled successfully');
  } catch (err: any) {
    console.error('Cancel failed:', err);
    const msg = err.response?.data?.message || 'Failed to cancel order';
    alert(msg);
  } finally {
    setCancellingOrderId(null);
  }
};

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { 
          icon: ClockIcon, 
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
          label: 'Pending',
          description: 'Your order is being processed'
        };
      case 'confirmed':
        return { 
          icon: CheckCircleIcon, 
          color: 'text-blue-600 bg-blue-50 border-blue-200', 
          label: 'Confirmed',
          description: 'Your order has been confirmed'
        };
      case 'preparing':
        return { 
          icon: ShoppingBagIcon, 
          color: 'text-purple-600 bg-purple-50 border-purple-200', 
          label: 'Preparing',
          description: 'Your cakes are being prepared'
        };
      case 'out_for_delivery':
        return { 
          icon: TruckIcon, 
          color: 'text-orange-600 bg-orange-50 border-orange-200', 
          label: 'Out for Delivery',
          description: 'Your order is on the way'
        };
      case 'delivered':
        return { 
          icon: CheckCircleIcon, 
          color: 'text-green-600 bg-green-50 border-green-200', 
          label: 'Delivered',
          description: 'Order completed successfully'
        };
      case 'cancelled':
        return { 
          icon: XCircleIcon, 
          color: 'text-red-600 bg-red-50 border-red-200', 
          label: 'Cancelled',
          description: 'This order was cancelled'
        };
      default:
        return { 
          icon: ClockIcon, 
          color: 'text-gray-600 bg-gray-50 border-gray-200', 
          label: status,
          description: ''
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircleIcon className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">Oops!</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl mb-6">
            <ShoppingBagIcon className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-4">
            My Orders
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Track and manage all your delicious cake orders in one place
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg border-2 border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBagIcon className="h-12 w-12 text-amber-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">No Orders Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start exploring our delicious cakes and place your first order!
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Browse Cakes 🍰
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const isExpanded = expandedOrders.has(order.id);
              const isHighlighted = highlightedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl shadow-md border-2 transition-all duration-300 ${
                    isHighlighted 
                      ? 'border-amber-400 shadow-xl ring-4 ring-amber-100' 
                      : 'border-gray-100 hover:border-amber-200 hover:shadow-lg'
                  }`}
                >
                  {/* Order Header */}
                  <div
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="p-6 cursor-pointer hover:bg-gray-50/50 rounded-t-2xl transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-xl font-black text-gray-900">
                            Order #{order.id}
                          </h3>
                          <div className={`px-4 py-1.5 rounded-full border-2 ${statusInfo.color} flex items-center gap-2`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="font-bold text-sm">{statusInfo.label}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarIcon className="h-4 w-4 text-amber-600" />
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <ShoppingBagIcon className="h-4 w-4 text-amber-600" />
                            <span>{order.item_count} {order.item_count === 1 ? 'item' : 'items'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <CreditCardIcon className="h-4 w-4 text-amber-600" />
                            <span>{order.payment_method}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                          <p className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                            Rs. {Number(order.total_amount).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUpIcon className="h-6 w-6 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {isExpanded && (
                    <div className="border-t-2 border-gray-100 p-6 bg-gray-50/30">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Delivery Information */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPinIcon className="h-5 w-5 text-amber-600" />
                            Delivery Address
                          </h4>
                          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                            <p className="text-gray-700 leading-relaxed">{order.address}</p>
                          </div>
                        </div>

                        {/* Order Status */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <StatusIcon className="h-5 w-5 text-amber-600" />
                            Order Status
                          </h4>
                          <div className={`rounded-xl p-4 border-2 ${statusInfo.color}`}>
                            <p className="font-bold mb-1">{statusInfo.label}</p>
                            <p className="text-sm">{statusInfo.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items - Would need separate API call to fetch */}
                      <div className="mt-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <ShoppingBagIcon className="h-5 w-5 text-amber-600" />
                          Order Items
                        </h4>
                        <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                          <p className="text-gray-600 text-sm">
                            {order.item_count} {order.item_count === 1 ? 'item' : 'items'} in this order
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            💡 Contact us for detailed item information
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 flex flex-wrap gap-3">
                        {order.status === 'delivered' && (
                          <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                            Reorder 🔄
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
      onClick={() => handleCancelOrder(order.id)}
      disabled={cancellingOrderId === order.id}   // optional: prevent double click
      className={`px-6 py-3 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2
        ${cancellingOrderId === order.id 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-red-500 hover:bg-red-600'}`}
    >
      {cancellingOrderId === order.id ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Cancelling...
        </>
      ) : (
        'Cancel Order'
      )}
    </button>
                        )}
                        <Link
                          href="/contact"
                          className="px-6 py-3 bg-white border-2 border-amber-500 text-amber-700 rounded-xl font-bold hover:bg-amber-50 transition-all duration-300"
                        >
                          Contact Support
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-100">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">💬</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Have questions about your order? Our customer support team is here to help you!
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Contact Us
                </Link>
                <a
                  href="tel:+94XXXXXXXXX"
                  className="px-6 py-3 bg-white border-2 border-blue-500 text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300"
                >
                  Call Now: +94 XX XXX XXXX
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your orders...</p>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}