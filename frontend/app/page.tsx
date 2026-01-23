// frontend/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useCartStore } from '@/lib/cartStore';
import { SparklesIcon, HeartIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface Cake {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: string;
}

export default function Home() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);

  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchCakes = async () => {
      try {
        const { data } = await api.get('/cakes');
        setCakes(data);
      } catch (err: any) {
        console.error('Failed to fetch cakes:', err);
        setError('Could not load cakes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCakes();
  }, []);

  const handleAddToCart = (cake: Cake) => {
    addItem({
      cakeId: cake.id,
      quantity: 1,
      name: cake.name,
      price: cake.price,
      images: cake.images,
    });
    setAddedToCart(cake.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[80vh]">
      <div className="relative">
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-amber-200"></div>
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-orange-500 absolute top-0"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl">
          🍰
        </div>
      </div>
      <p className="mt-6 text-gray-600 font-medium animate-pulse">Loading delicious cakes...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] text-center px-4">
      <div className="text-6xl mb-6">😞</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
      <p className="text-gray-600 mb-6 max-w-md">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:shadow-xl transition-all hover:scale-105"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 py-20 md:py-32">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8 animate-bounce">
              <SparklesIcon className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-bold text-gray-800">Fresh from the Oven Daily</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
                Cakes Baked
              </span>
              <br />
              <span className="text-gray-900">With Love & Care</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
              Every slice tells a story. Handcrafted with premium ingredients to make your moments unforgettable.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#cakes"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg"
              >
                Explore Our Cakes
              </a>
              <a 
                href="/contact"
                className="px-8 py-4 bg-white text-gray-800 font-bold rounded-2xl border-2 border-gray-300 hover:border-amber-500 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg"
              >
                Custom Orders
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: HeartIcon, title: 'Made with Love', desc: 'Every cake is crafted with passion' },
              { icon: SparklesIcon, title: 'Premium Quality', desc: 'Only the finest ingredients' },
              { icon: TruckIcon, title: 'Fast Delivery', desc: 'Fresh cakes delivered quickly' },
              { icon: ShieldCheckIcon, title: 'Satisfaction', desc: '100% quality guaranteed' }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="text-center p-6 rounded-3xl hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 transition-all duration-300 group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="inline-flex p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cakes Grid Section */}
      <section id="cakes" className="py-20 bg-gradient-to-b from-white to-amber-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Our Signature <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Collection</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of artisanal cakes, each one a masterpiece
            </p>
          </div>

          {cakes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">🧁</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Our Ovens Are Preheating!
              </h3>
              <p className="text-gray-600 text-lg">
                New delicious cakes coming soon... Stay tuned!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {cakes.map((cake, idx) => (
                <div 
                  key={cake.id}
                  onClick={() => window.location.href = `/cakes/${cake.id}`}
                  className="group relative bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-amber-300 hover:-translate-y-2 cursor-pointer"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 aspect-square">
                    {cake.images?.length > 0 ? (
                      <img
                        src={`http://localhost:5000${cake.images[0]}`}
                        alt={cake.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-8xl">🍰</span>
                      </div>
                    )}
                    
                    {/* Stock Badge */}
                    {cake.stock > 0 && cake.stock <= 5 && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-2 rounded-full shadow-xl animate-pulse">
                        Only {cake.stock} left!
                      </div>
                    )}
                    
                    {cake.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <span className="px-6 py-3 bg-red-500 text-white font-bold rounded-full text-lg shadow-xl">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {cake.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                      {cake.description || 'A delightful treat made with love and premium ingredients'}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div>
                        <div className="text-xs text-gray-500 font-medium mb-1">Price</div>
                        <div className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                          Rs. {Number(cake.price).toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(cake);
                        }}
                        disabled={cake.stock <= 0}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform shadow-lg ${
                          addedToCart === cake.id
                            ? 'bg-green-500 text-white scale-110'
                            : cake.stock > 0
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-110 hover:shadow-xl'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {addedToCart === cake.id ? '✓ Added!' : cake.stock > 0 ? 'Add' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {cakes.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTEyIDEyYzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Got Something Special in Mind?
              </h2>
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                We create custom cakes for birthdays, weddings, anniversaries, and every celebration in between. Let's make your dream cake a reality!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="/contact"
                  className="px-10 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg"
                >
                  Request Custom Cake
                </a>
                <a 
                  href="/about"
                  className="px-10 py-4 bg-transparent text-white font-bold rounded-2xl border-2 border-white hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-105 text-lg"
                >
                  Learn More About Us
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}