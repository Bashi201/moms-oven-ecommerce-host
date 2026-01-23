import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Mom's Oven - Cakes Baked With Love",
  description: "Handcrafted cakes baked with love and premium ingredients. Order delicious custom cakes for any occasion from Mom's Oven.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      
      <body className="antialiased bg-white">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
          {/* Decorative top border */}
          <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500"></div>
          
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTEyIDEyYzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDIiLz48L2c+PC9zdmc+')] opacity-30"></div>
          
          <div className="container mx-auto px-6 py-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-2xl">
                    🍰
                  </div>
                  <div>
                    <h3 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      Mom's Oven
                    </h3>
                    <p className="text-xs text-gray-400 font-medium tracking-wider">
                      BAKED WITH LOVE
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                  Since day one, we've been crafting artisanal cakes with premium ingredients and unwavering dedication. Every cake tells a story, and we're honored to be part of your special moments.
                </p>
                <div className="flex gap-4">
                  {[
                    { icon: '📘', label: 'Facebook', href: '#' },
                    { icon: '📸', label: 'Instagram', href: '#' },
                    { icon: '🐦', label: 'Twitter', href: '#' }
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 text-xl"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-bold mb-6 text-amber-400">Quick Links</h3>
                <ul className="space-y-3">
                  {[
                    { href: '/', label: 'Home' },
                    { href: '/about', label: 'About Us' },
                    { href: '/contact', label: 'Contact Us' },
                    { href: '/cart', label: 'Shopping Cart' }
                  ].map((link) => (
                    <li key={link.href}>
                      <a 
                        href={link.href}
                        className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center gap-2 group"
                      >
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full group-hover:w-3 transition-all duration-300"></span>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold mb-6 text-amber-400">Get in Touch</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      📧
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Email</div>
                      <a href="mailto:info@momsoven.lk" className="hover:text-amber-400 transition-colors">
                        info@momsoven.lk
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      📱
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Phone</div>
                      <a href="tel:+94XXXXXXXXX" className="hover:text-amber-400 transition-colors">
                        +94 XX XXX XXXX
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      📍
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Location</div>
                      <span>Kandy, Sri Lanka</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-400 text-sm text-center md:text-left">
                  &copy; {new Date().getFullYear()} Mom's Oven. All rights reserved. Made with 
                  <span className="text-red-500 mx-1">❤️</span>
                  in Sri Lanka
                </p>
                <div className="flex gap-6 text-sm">
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}