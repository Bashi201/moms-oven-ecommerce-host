'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import api from '@/lib/api';
import {
  EnvelopeIcon,
  EnvelopeOpenIcon,
  TrashIcon,
  ArrowLeftIcon,
  ClockIcon,
  PhoneIcon,
  UserIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function ManageMessages() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/contact');
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowModal(true);

    // Mark as read
    if (message.status === 'unread') {
      try {
        await api.put(`/contact/${message.id}/read`);
        fetchMessages();
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await api.delete(`/contact/${id}`);
      fetchMessages();
      if (selectedMessage?.id === id) {
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 font-semibold">Loading messages...</p>
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
      <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all border border-white/30"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white">Contact Messages</h1>
                <p className="text-emerald-100 mt-1">View and respond to customer inquiries</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl border-2 border-white/30">
                <p className="text-white font-bold">
                  {unreadCount} New {unreadCount === 1 ? 'Message' : 'Messages'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages List */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No messages yet</h3>
              <p className="text-gray-500">Customer messages will appear here</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                  message.status === 'unread' ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-100'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Message Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                            message.status === 'unread'
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                              : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}
                        >
                          {message.status === 'unread' ? (
                            <EnvelopeIcon className="w-6 h-6 text-white" />
                          ) : (
                            <EnvelopeOpenIcon className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-xl text-gray-800">{message.name}</h3>
                            {message.status === 'unread' && (
                              <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <UserIcon className="w-4 h-4" />
                              {message.email}
                            </span>
                            {message.phone && (
                              <span className="flex items-center gap-1">
                                <PhoneIcon className="w-4 h-4" />
                                {message.phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-bold rounded-full">
                          {message.subject}
                        </span>
                      </div>

                      <p className="text-gray-700 line-clamp-2">{message.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleViewMessage(message)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all shadow-md"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all shadow-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setShowModal(false)}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white">Message Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <span className="text-white text-2xl">×</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                  <h3 className="font-bold text-lg text-gray-800 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-semibold text-gray-800">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="font-semibold text-emerald-600 hover:underline block"
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                    {selectedMessage.phone && (
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <a
                          href={`tel:${selectedMessage.phone}`}
                          className="font-semibold text-emerald-600 hover:underline block"
                        >
                          {selectedMessage.phone}
                        </a>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-600">Subject:</span>
                      <p className="font-semibold text-gray-800">{selectedMessage.subject}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Received:</span>
                      <p className="font-semibold text-gray-800">
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-3">Message</h3>
                  <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all text-center"
                  >
                    Reply via Email
                  </a>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}