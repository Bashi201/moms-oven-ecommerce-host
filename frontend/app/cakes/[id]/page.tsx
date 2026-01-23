'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCartStore } from '@/lib/cartStore';
import {
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  MinusIcon,
  PlusIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const [cake, setCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCake(params.id as string);
    }
  }, [params.id]);

  const fetchCake = async (id: string) => {
    try {
      const { data } = await api.get(`/cakes/${id}`);
      setCake(data);
    } catch (error) {
      console.error('Failed to fetch cake:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!cake) return;
    
    setAddingToCart(true);
    try {
      await addItem({
        cakeId: cake.id,
        quantity,
        name: cake.name,
        price: cake.price,
        images: cake.images,
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (cake && quantity < cake.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-700 font-semibold">Loading deliciousness...</p>
        </div>
      </div>
    );
  }

  if (!cake) {
    return null;
  }

  const currentImage = cake.images?.[selectedImage] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white">
            <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold">Added to cart!</p>
              <p className="text-sm text-emerald-100">Ready for checkout</p>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-amber-50 rounded-xl shadow-md transition-all group"
        >
          <ArrowLeftIcon className="w-5 h-5 text-amber-600 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-gray-700">Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white group">
              {currentImage ? (
                <>
                  <img
                    src={`http://localhost:5000${currentImage}`}
                    alt={cake.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <SparklesIcon className="w-24 h-24 text-amber-300" />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <SparklesIcon className="w-24 h-24 text-amber-300" />
                </div>
              )}

              {/* Like Button */}
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-700" />
                )}
              </button>

              {/* Stock Badge */}
              {cake.stock > 0 ? (
                <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full shadow-lg text-sm">
                  ✓ In Stock
                </div>
              ) : (
                <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-full shadow-lg text-sm">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {cake.images && cake.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {cake.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                      selectedImage === index
                        ? 'ring-4 ring-amber-500 scale-105 shadow-lg'
                        : 'hover:scale-105 shadow-md opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={`http://localhost:5000${image}`}
                      alt={`${cake.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Category Badge */}
            {cake.category && (
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-bold rounded-full text-sm border-2 border-purple-200">
                {cake.category}
              </span>
            )}

            {/* Product Name */}
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              {cake.name}
            </h1>

            {/* Rating (Mock) */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${
                      i < 4 ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">(4.0 / 5.0)</span>
            </div>

            {/* Price */}
            <div className="py-6 border-y-2 border-gray-200">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  LKR {cake.price.toLocaleString()}
                </span>
                <span className="text-gray-500 text-lg line-through">
                  LKR {(cake.price * 1.2).toLocaleString()}
                </span>
                <span className="px-3 py-1 bg-red-500 text-white font-bold rounded-full text-sm">
                  -17% OFF
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {cake.description || 'A delicious handcrafted cake made with premium ingredients and lots of love. Perfect for any celebration or special occasion.'}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md border-2 border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TruckIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">Fast Delivery</p>
                  <p className="text-xs text-gray-600">2-3 Days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md border-2 border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">Quality</p>
                  <p className="text-xs text-gray-600">Guaranteed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md border-2 border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">Fresh</p>
                  <p className="text-xs text-gray-600">Baked Daily</p>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white rounded-xl shadow-md border-2 border-gray-200">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-50 rounded-l-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MinusIcon className="w-5 h-5 text-gray-700" />
                  </button>
                  <span className="px-6 font-bold text-xl text-gray-800">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= cake.stock}
                    className="p-3 hover:bg-gray-50 rounded-r-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {cake.stock > 0 ? `${cake.stock} available` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={cake.stock === 0 || addingToCart}
                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
              >
                <ShoppingCartIcon className="w-6 h-6" />
                {addingToCart ? 'Adding...' : cake.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              
              <button
                onClick={() => router.push('/cart')}
                className="w-full px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl shadow-lg transition-all border-2 border-gray-200 hover:border-amber-300"
              >
                Go to Cart
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-8 pt-6 border-t-2 border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-700">100% Fresh</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-700">Secure Payment</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <TruckIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-700">Fast Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}