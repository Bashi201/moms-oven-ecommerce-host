'use client';

import {
  HeartIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fff8f0]">
      {/* Hero Section - Different from homepage */}
      <section className="relative bg-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-[#fff4e6] px-6 py-3 rounded-full mb-8 border border-[#ff8c42]/20">
                  <span className="text-2xl">❤️</span>
                  <span className="font-bold text-[#2d2d2d] tracking-wide">Our Story</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                  <span className="text-[#2d2d2d]">Meet the Baker</span>
                  <br />
                  <span className="text-[#ff8c42]">Behind Every Slice</span>
                </h1>

                <p className="text-lg text-[#5a5a5a] leading-relaxed mb-6">
                  From my kitchen to your celebrations, every cake is a piece of my heart. 
                  Let me tell you how this sweet journey began.
                </p>

                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-black text-[#ff8c42]">3+</div>
                    <div className="text-sm text-[#5a5a5a]">Years</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-[#ff8c42]">200+</div>
                    <div className="text-sm text-[#5a5a5a]">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-[#ff8c42]">100%</div>
                    <div className="text-sm text-[#5a5a5a]">Homemade</div>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-[#fff4e6] to-[#ffe8cc] rounded-[3rem] shadow-2xl overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-9xl">👩‍🍳</span>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#ff8c42] rounded-full opacity-20"></div>
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-[#ff8c42] rounded-full opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 bg-[#fff8f0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-[#2d2d2d] mb-6">
                My Journey with{' '}
                <span className="text-[#ff8c42]">Baking</span>
              </h2>
            </div>

            <div className="space-y-8">
              {[
                {
                  emoji: '🏠',
                  title: 'It Started at Home',
                  text: 'What began as baking cakes for family birthdays and anniversaries quickly became my passion. The joy on their faces when they tasted my creations inspired me to do more.'
                },
                {
                  emoji: '💡',
                  title: 'Turning Passion into Purpose',
                  text: 'Friends started asking me to bake for their special occasions. That\'s when I realized this wasn\'t just a hobby – it was my calling. Every cake became an opportunity to make someone\'s day special.'
                },
                {
                  emoji: '🎂',
                  title: 'Mom\'s Oven is Born',
                  text: 'Named after the love and warmth of a mother\'s kitchen, Mom\'s Oven represents everything I stand for: quality, care, and dedication. Each cake is baked with the same love I\'d put into a cake for my own family.'
                }
              ].map((story, index) => (
                <div key={index} className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#ff8c42]/20">
                  <div className="flex items-start gap-6">
                    <div className="text-5xl flex-shrink-0">{story.emoji}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#2d2d2d] mb-3">{story.title}</h3>
                      <p className="text-[#5a5a5a] leading-relaxed">{story.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-[#2d2d2d] mb-4">
                What Makes Us{' '}
                <span className="text-[#ff8c42]">Special</span>
              </h2>
              <p className="text-lg text-[#5a5a5a] max-w-2xl mx-auto">
                The values that guide every cake we create
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: HeartIcon,
                  title: 'Made with Love',
                  description:
                    'Every cake is crafted with genuine care and passion, ensuring quality in every bite.',
                },
                {
                  icon: SparklesIcon,
                  title: 'Premium Quality',
                  description:
                    'Only the finest ingredients – real butter, premium chocolate, and fresh fruits.',
                },
                {
                  icon: UsersIcon,
                  title: 'Personal Touch',
                  description:
                    'Work directly with the baker. We bring your vision to life with personal care.',
                },
                {
                  icon: ClockIcon,
                  title: 'Fresh Daily',
                  description:
                    'Each cake is baked fresh for your order. No stock, everything made for you.',
                },
                {
                  icon: StarIcon,
                  title: '100% Satisfaction',
                  description:
                    'Quality guaranteed. We ensure every cake meets our highest standards.',
                },
                {
                  icon: TrophyIcon,
                  title: 'Trusted',
                  description:
                    'Built on word-of-mouth and repeat customers who trust us with celebrations.',
                },
              ].map((value, index) => (
                <div
                  key={value.title}
                  className="group bg-[#fff8f0] rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#ff8c42]/20 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#ff8c42] transition-colors duration-300 shadow-sm">
                    <value.icon className="w-7 h-7 text-[#ff8c42] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-[#2d2d2d] mb-3">
                    {value.title}
                  </h3>
                  <p className="text-[#5a5a5a] leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-16 md:py-24 bg-[#fff8f0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black text-[#2d2d2d] mb-6">
              My Commitment to{' '}
              <span className="text-[#ff8c42]">You</span>
            </h2>
            <p className="text-lg text-[#5a5a5a] mb-8 leading-relaxed">
              I promise to treat every order with the same care and attention I'd give to my own family's celebrations. 
              Your special moments matter to me, and I'm honored to be part of them through my cakes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/"
                className="px-8 md:px-10 py-3 md:py-4 bg-[#ff8c42] text-white font-bold rounded-full hover:bg-[#ff7a2e] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base md:text-lg"
              >
                See Our Cakes
              </a>
              <a
                href="/contact"
                className="px-8 md:px-10 py-3 md:py-4 bg-white text-[#2d2d2d] font-bold rounded-full border-2 border-[#ff8c42]/30 hover:border-[#ff8c42] hover:shadow-lg transition-all duration-300 text-base md:text-lg"
              >
                Let's Talk
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}