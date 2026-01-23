'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import api from '@/lib/api';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  EyeIcon,
  XMarkIcon,
  UserIcon,
  CheckBadgeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Customer {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
}

interface CustomerDetails extends Customer {
  orders: Array<{
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    item_count: number;
  }>;
}

export default function ManageCustomers() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/admin/customers');
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId: number) => {
    try {
      const { data } = await api.get(`/admin/customers/${customerId}`);
      setSelectedCustomer(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      alert('Failed to load customer details');
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const stats = {
    total: customers.length,
    totalOrders: customers.reduce((sum, c) => sum + (c.total_orders || 0), 0),
    totalRevenue: customers.reduce((sum, c) => sum + (c.total_spent || 0), 0),
    activeCustomers: customers.filter((c) => (c.total_orders || 0) > 0).length,
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-700 font-semibold">Loading customers...</p>
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
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 shadow-2xl">
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
                <h1 className="text-3xl md:text-4xl font-black text-white">Customer Management</h1>
                <p className="text-pink-100 mt-1">View and manage your customer base</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 text-white/80 text-xs lg:text-sm mb-1">
                <UserGroupIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="font-medium">Total Customers</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white">{stats.total}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 text-white/80 text-xs lg:text-sm mb-1">
                <CheckBadgeIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="font-medium">Active Customers</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white">{stats.activeCustomers}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 text-white/80 text-xs lg:text-sm mb-1">
                <ShoppingBagIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="font-medium">Total Orders</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white">{stats.totalOrders}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 text-white/80 text-xs lg:text-sm mb-1">
                <CurrencyDollarIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="font-medium">Total Revenue</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-white">
                {stats.totalRevenue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-gray-100">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer.id}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-purple-200 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Header with Avatar */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 relative overflow-hidden">
                {/* Background Pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 20h20v20H0V20zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z'/%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                ></div>

                <div className="relative flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/40 shadow-lg">
                    <span className="text-3xl font-black text-white">
                      {customer.username ? customer.username[0].toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg truncate">{customer.username}</h3>
                    <p className="text-purple-100 text-sm">
                      {customer.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border-2 border-purple-100">
                    <div className="text-xs text-gray-600 mb-1">Orders</div>
                    <div className="text-xl font-black text-purple-700">
                      {customer.total_orders || 0}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border-2 border-emerald-100">
                    <div className="text-xs text-gray-600 mb-1">Spent</div>
                    <div className="text-lg font-black text-emerald-700">
                      {customer.total_spent
                        ? `${parseFloat(customer.total_spent.toString()).toLocaleString()}`
                        : '0'}
                    </div>
                  </div>
                </div>

                {/* Last Order */}
                {customer.last_order_date && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded-lg">
                    <ClockIcon className="w-3 h-3" />
                    <span>Last order: {new Date(customer.last_order_date).toLocaleDateString()}</span>
                  </div>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => fetchCustomerDetails(customer.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  <EyeIcon className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No customers found</h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Customers will appear here once they register'}
            </p>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
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
              <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/40 shadow-lg">
                      <span className="text-2xl font-black text-white">
                        {selectedCustomer.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">{selectedCustomer.username}</h2>
                      <p className="text-purple-100 text-sm">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-purple-600" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Account Type:</span>
                      <p className="font-semibold text-gray-800 mt-1 capitalize">
                        {selectedCustomer.role}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Member Since:</span>
                      <p className="font-semibold text-gray-800 mt-1">
                        {new Date(selectedCustomer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Orders:</span>
                      <p className="font-semibold text-gray-800 mt-1">
                        {selectedCustomer.total_orders || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Spent:</span>
                      <p className="font-semibold text-gray-800 mt-1">
                        LKR {selectedCustomer.total_spent?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <ShoppingBagIcon className="w-5 h-5 text-gray-600" />
                    Order History ({selectedCustomer.orders?.length || 0})
                  </h3>
                  {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCustomer.orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold text-gray-800">Order #{order.id}</span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  order.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : order.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : order.status === 'processing'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {order.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{order.item_count} items</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800">
                              LKR {parseFloat(order.total_amount.toString()).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No orders yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}