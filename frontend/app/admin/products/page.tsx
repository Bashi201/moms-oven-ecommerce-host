'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import api from '@/lib/api';
import Image from 'next/image';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface Cake {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  created_at: string;
}

export default function ManageProducts() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCake, setEditingCake] = useState<Cake | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchCakes();
  }, []);

  const fetchCakes = async () => {
    try {
      const { data } = await api.get('/cakes');
      setCakes(data);
    } catch (error) {
      console.error('Failed to fetch cakes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 4) {
      alert('Maximum 4 images allowed');
      return;
    }

    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('category', formData.category);

      selectedFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      if (editingCake) {
        // Update existing cake
        await api.put(`/cakes/${editingCake.id}`, formData);
      } else {
        // Create new cake
        await api.post('/cakes', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Reset and refresh
      setShowModal(false);
      setEditingCake(null);
      resetForm();
      fetchCakes();
    } catch (error: any) {
      console.error('Failed to save cake:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (cake: Cake) => {
    setEditingCake(cake);
    setFormData({
      name: cake.name,
      description: cake.description,
      price: cake.price.toString(),
      stock: cake.stock.toString(),
      category: cake.category || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/cakes/${id}`);
      fetchCakes();
    } catch (error) {
      console.error('Failed to delete cake:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const openCreateModal = () => {
    setEditingCake(null);
    resetForm();
    setShowModal(true);
  };

  // Filter cakes
  const filteredCakes = cakes.filter(cake => {
    const matchesSearch = cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cake.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || cake.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(cakes.map(c => c.category).filter(Boolean))];

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-700 font-semibold">Loading products...</p>
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
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-pink-500 shadow-2xl">
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
                <h1 className="text-3xl md:text-4xl font-black text-white">Manage Products</h1>
                <p className="text-amber-100 mt-1">Add, edit, or remove cakes from your inventory</p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-amber-50 text-amber-600 font-bold rounded-xl shadow-lg transition-all hover:scale-105"
            >
              <PlusIcon className="w-5 h-5" />
              Add Product
            </button>
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
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer min-w-[200px]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCakes.map((cake, index) => (
            <div
              key={cake.id}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-amber-200 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Image */}
              <div className="relative h-56 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
                {cake.images && cake.images.length > 0 ? (
                  <Image
                    src={`http://localhost:5000${cake.images[0]}`}
                    alt={cake.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="w-20 h-20 text-amber-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-gradient-to-br from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  LKR {cake.price}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800 mb-1 group-hover:text-amber-600 transition-colors">
                      {cake.name}
                    </h3>
                    {cake.category && (
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                        {cake.category}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {cake.description || 'No description available'}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Stock:</span>
                    <span className={`ml-2 font-bold ${cake.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {cake.stock}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Images:</span>
                    <span className="ml-2 font-bold text-gray-800">{cake.images?.length || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(cake)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cake.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCakes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhotoIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first product'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
              >
                <PlusIcon className="w-5 h-5" />
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setShowModal(false)}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <h2 className="text-2xl font-black text-white">
                  {editingCake ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="e.g., Chocolate Fantasy Cake"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors resize-none"
                    placeholder="Describe your delicious cake..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Price (LKR) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="2500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select a category</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Special Occasion">Special Occasion</option>
                    <option value="Seasonal">Seasonal</option>
                  </select>
                </div>

                {!editingCake && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Images (Max 4)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amber-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm font-semibold text-gray-600">
                          Click to upload images
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 5MB each
                        </span>
                      </label>
                    </div>

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mt-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg transition-all"
                  >
                    {editingCake ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}