// app/orders/page.tsx (updated to fix prerender error)
'use client';

import { useEffect, useState } from 'react';
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
  SparklesIcon,
  ArrowRightIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';  // ← ADD THIS: Makes page dynamic (no static prerender)

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

export default function OrdersPage() {
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
      setError(err.response?.data?.message || 'Could not load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      // Fetch order details if not already loaded
      const order = orders.find(o => o.id === orderId);
      if (order && !order.items) {
        try {
          const { data } = await api.get(`/orders/${orderId}`);
          setOrders(orders.map(o => o.id === orderId ? data.order : o));
        } catch (err) {
          console.error('Failed to fetch order details:', err);
        }
      }
    }
    setExpandedOrders(newExpanded);
  };

  const cancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;

    setCancellingOrderId(orderId);
    try {
      await api.post(`/orders/${orderId}/cancel`);
      fetchOrders();  // Refresh list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { icon: ClockIcon, color: 'text-amber-500 bg-amber-50', label: 'Pending Confirmation' };
      case 'confirmed':
        return { icon: CheckCircleIcon, color: 'text-blue-500 bg-blue-50', label: 'Confirmed' };
      case 'preparing':
        return { icon: SparklesIcon, color: 'text-purple-500 bg-purple-50', label: 'Preparing' };
      case 'out_for_delivery':
        return { icon: TruckIcon, color: 'text-orange-500 bg-orange-50', label: 'Out for Delivery' };
      case 'delivered':
        return { icon: CheckCircleIcon, color: 'text-green-500 bg-green-50', label: 'Delivered' };
      case 'cancelled':
        return { icon: XCircleIcon, color: 'text-red-500 bg-red-50', label: 'Cancelled' };
      default:
        return { icon: ClockIcon, color: 'text-gray-500 bg-gray-50', label: status };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gray-50">
      <div className="relative">
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-amber-200"></div>
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-orange-500 absolute top-0"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl">
          📦
        </div>
      </div>
      <p className="mt-6 text-gray-600 font-medium animate-pulse">Loading your orders...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gray-50">
      <XCircleIcon className="h-24 w-24 text-red-400 mb-4" />
      <p className="text-xl font-semibold text-gray-900 mb-2">{error}</p>
      <button 
        onClick={fetchOrders}
        className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <ShoppingBagIcon className="h-9 w-9 text-amber-500" />
            Your Orders
          </h1>
          <Link
            href="/"
            className="px-6 py-3 bg-white border-2 border-amber-500 text-amber-700 rounded-xl font-bold hover:bg-amber-50 transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-amber-100">
            <ShoppingBagIcon className="h-24 w-24 text-amber-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't made any orders. Let's change that!</p>
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-2xl transition-all duration-300 text-lg inline-flex items-center gap-2"
            >
              Browse Cakes Now
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const { icon: StatusIcon, color: statusColor, label: statusLabel } = getStatusConfig(order.status);
              const isExpanded = expandedOrders.has(order.id);
              const isHighlighted = highlightedOrderId === order.id;

              return (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 transition-all duration-300 ${
                    isHighlighted ? 'border-amber-500 shadow-2xl scale-[1.02]' : 'border-amber-100'
                  }`}
                >
                  {/* Header */}
                  <div 
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-amber-50 transition-colors"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${statusColor}`}>
                        <StatusIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Order #{order.id}</h3>
                        <p className="text-gray-600">{order.item_count} items • Rs. {order.total_amount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${statusColor.replace('bg', 'text')}`}>{statusLabel}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <ChevronDownIcon className={`h-6 w-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t-2 border-amber-100 p-6">
                      {/* Items */}
                      <div className="mb-8">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <ShoppingBagIcon className="h-5 w-5 text-amber-500" />
                          Items in this Order
                        </h4>
                        <div className="space-y-4">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                              {item.images?.[0] && (
                                <img 
                                  src={item.images[0]} 
                                  alt={item.name} 
                                  className="w-20 h-20 object-cover rounded-lg shadow-md"
                                />
                              )}
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">{item.name}</h5>
                                <p className="text-gray-600">Quantity: {item.quantity}</p>
                                <p className="text-gray-600">Price: Rs. {item.price_at_purchase.toFixed(2)}</p>
                              </div>
                              <p className="font-bold text-gray-900">Rs. {(item.quantity * item.price_at_purchase).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPinIcon className="h-5 w-5 text-amber-500" />
                            Delivery Address
                          </h4>
                          <p className="text-gray-700 whitespace-pre-line">{order.address}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCardIcon className="h-5 w-5 text-amber-500" />
                            Payment Details
                          </h4>
                          <p className="text-gray-700">Method: {order.payment_method}</p>
                          <p className="text-gray-700">Total: Rs. {order.total_amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-500 mt-2">Status: Paid on Delivery</p> {/* Assuming COD */}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="mb-8">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-amber-500" />
                          Order Timeline
                        </h4>
                        <div className="relative pl-4 border-l-2 border-amber-200">
                          <div className="mb-4">
                            <div className="absolute -left-2.5 bg-white rounded-full p-1 border-2 border-amber-500">
                              <CheckCircleIcon className="h-4 w-4 text-amber-500" />
                            </div>
                            <p className="font-medium">Order Placed</p>
                            <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="mb-4">
                            <div className="absolute -left-2.5 bg-white rounded-full p-1 border-2 border-amber-500">
                              <StatusIcon className="h-4 w-4 text-amber-500" />
                            </div>
                            <p className="font-medium">{statusLabel}</p>
                            <p className="text-sm text-gray-500">Current Status</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-4 justify-end">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            disabled={cancellingOrderId === order.id}
                            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                          >
                            {cancellingOrderId === order.id ? (
                              <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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