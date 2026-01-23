'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import api from '@/lib/api';
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowLeftIcon,
  EyeIcon,
  ChevronDownIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface OrderItem {
  id: number;
  cake_id: number;
  cake_name: string;
  quantity: number;
  price_at_purchase: number;
}

interface Order {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  payment_method: string;
  address: string;
  created_at: string;
  items?: OrderItem[];
}

export default function ManageOrders() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const { data } = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      alert('Failed to load order details');
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
  try {
    // Call backend
    await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });

    // Update main orders list (most important!)
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    // Also update the selected order (for the modal)
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }

    // Optional: refresh full list from server (more reliable but slower)
    // await fetchOrders();

  } catch (error) {
    console.error('Failed to update order status:', error);
    alert('Failed to update order status. Please try again.');
  }
};

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + parseFloat(o.total_amount.toString()), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'processing':
        return <TruckIcon className="w-4 h-4" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ShoppingBagIcon className="w-4 h-4" />;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-700 font-semibold">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all border border-white/30"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white">Manage Orders</h1>
                <p className="text-blue-100 mt-1">Track and process customer orders</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <ShoppingBagIcon className="w-4 h-4" />
                <span className="font-medium">Total Orders</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white">{stats.total}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <ClockIcon className="w-4 h-4" />
                <span className="font-medium">Pending</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white">{stats.pending}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <TruckIcon className="w-4 h-4" />
                <span className="font-medium">Processing</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white">{stats.processing}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <CheckCircleIcon className="w-4 h-4" />
                <span className="font-medium">Completed</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white">{stats.completed}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <CurrencyDollarIcon className="w-4 h-4" />
                <span className="font-medium">Revenue</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-white">
                {stats.totalRevenue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer min-w-[200px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-blue-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-black text-lg">#{order.id}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-xl text-gray-800">
                            {order.customer_name || 'Guest Customer'}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <span>{order.customer_email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-gray-800">
                              LKR {parseFloat(order.total_amount.toString()).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[200px]" title={order.address}>
                              {order.address || 'No address provided'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                    {/* Status Update Dropdown */}
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="pl-4 pr-10 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer font-semibold text-blue-700 text-sm"
                      >
                        <option value="pending">Set Pending</option>
                        <option value="processing">Set Processing</option>
                        <option value="completed">Set Completed</option>
                        <option value="cancelled">Set Cancelled</option>
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-700 pointer-events-none" />
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => fetchOrderDetails(order.id)}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Orders will appear here once customers start purchasing'}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setShowDetailsModal(false)}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <div>
                  <h2 className="text-2xl font-black text-white">Order #{selectedOrder.id}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <XCircleIcon className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-semibold text-gray-800 mt-1">
                        {selectedOrder.customer_name || 'Guest Customer'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-semibold text-gray-800 mt-1">{selectedOrder.customer_email}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Delivery Address:</span>
                      <p className="font-semibold text-gray-800 mt-1">{selectedOrder.address}</p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-amber-600" />
                    Order Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-semibold text-gray-800 mt-1 capitalize">{selectedOrder.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Method:</span>
                      <p className="font-semibold text-gray-800 mt-1">{selectedOrder.payment_method}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <p className="font-bold text-2xl text-amber-600 mt-1">
                        LKR {parseFloat(selectedOrder.total_amount.toString()).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                      <ShoppingBagIcon className="w-5 h-5 text-gray-600" />
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{item.cake_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Quantity: {item.quantity} × LKR{' '}
                              {parseFloat(item.price_at_purchase.toString()).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800">
                              LKR{' '}
                              {(
                                parseFloat(item.price_at_purchase.toString()) * item.quantity
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Update Status Section */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <h3 className="font-bold text-lg text-gray-800 mb-4">Update Order Status</h3>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      updateOrderStatus(selectedOrder.id, e.target.value);
                    }}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer font-semibold"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}