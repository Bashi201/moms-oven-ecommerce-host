'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import api from '@/lib/api';
import Link from 'next/link';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CakeIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  unreadMessages?: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-700 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `LKR ${stats?.totalRevenue?.toLocaleString() || '0'}`,
      icon: CurrencyDollarIcon,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      change: '+12.5%',
      trend: 'up',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBagIcon,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      change: '+8.2%',
      trend: 'up',
    },
    {
      title: 'Customers',
      value: stats?.totalCustomers || 0,
      icon: UserGroupIcon,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      change: '+15.3%',
      trend: 'up',
    },
    {
      title: 'Products',
      value: stats?.totalProducts || 0,
      icon: CakeIcon,
      gradient: 'from-rose-500 to-red-600',
      bgGradient: 'from-rose-50 to-red-50',
      change: '+5',
      trend: 'up',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Products',
      description: 'Add, edit, or remove cakes',
      icon: CakeIcon,
      href: '/admin/products',
      color: 'from-amber-500 to-orange-500',
      hoverColor: 'from-amber-600 to-orange-600',
    },
    {
      title: 'View Orders',
      description: 'Process and track orders',
      icon: ShoppingBagIcon,
      href: '/admin/orders',
      color: 'from-blue-500 to-indigo-500',
      hoverColor: 'from-blue-600 to-indigo-600',
    },
    {
      title: 'Customer Management',
      description: 'View customer details',
      icon: UserGroupIcon,
      href: '/admin/customers',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Contact Messages',
      description: 'View customer inquiries',
      icon: EnvelopeIcon,
      href: '/admin/messages',
      color: 'from-emerald-500 to-teal-500',
      hoverColor: 'from-emerald-600 to-teal-600',
      badge: stats?.unreadMessages,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
      {/* Header with Decorative Elements */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-pink-500 shadow-2xl">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl border-2 border-white/30 shadow-lg">
                  🍰
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Admin Dashboard
                  </h1>
                  <p className="text-amber-100 font-medium mt-1">
                    Welcome back, {user.username || 'Admin'}! 👋
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold rounded-xl transition-all duration-300 border-2 border-white/30 hover:scale-105"
            >
              <span>Back to Store</span>
              <span>→</span>
            </Link>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 text-white/80 text-xs lg:text-sm mb-1">
                <ClockIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="font-medium">Pending Orders</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white">
                {stats?.pendingOrders || 0}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 text-white/80 text-xs lg:text-sm mb-1">
                <CheckCircleIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="font-medium">Completed</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white">
                {stats?.completedOrders || 0}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 text-white/80 text-xs lg:text-sm mb-1">
                <ArrowTrendingUpIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="font-medium">Growth</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white">+12.5%</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 text-white/80 text-xs lg:text-sm mb-1">
                <TruckIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="font-medium">In Transit</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white">
                {((stats?.totalOrders || 0) - (stats?.completedOrders || 0) - (stats?.pendingOrders || 0)) || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#FFF8F0"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-10">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
              <div className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-3xl p-6 shadow-lg border-2 border-white/60 hover:border-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                  </div>
                </div>
                <h3 className="text-gray-600 font-semibold text-sm mb-2">{stat.title}</h3>
                <p className="text-3xl font-black bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                href={action.href}
                className="group relative overflow-hidden bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100 hover:border-amber-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-amber-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                  <div className={`inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${action.color} bg-clip-text text-transparent`}>
                    View Details
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <ShoppingBagIcon className="w-6 h-6" />
              Recent Orders
            </h2>
          </div>
          <div className="p-6">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.slice(0, 5).map((order: any, index: number) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-100 hover:border-amber-300 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                        #{order.id}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{order.customerName || 'Guest Customer'}</p>
                        <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">LKR {order.total?.toLocaleString() || '0'}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 font-semibold">No orders yet</p>
                <p className="text-gray-500 text-sm mt-1">Orders will appear here once customers start purchasing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}