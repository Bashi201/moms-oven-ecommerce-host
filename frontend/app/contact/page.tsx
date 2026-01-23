'use client';

import { useState } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
          });
        }, 3000);
      } else {
        alert(data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try calling or emailing us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#fff8f0]">
      {/* Hero Section - Unique design */}
      <section className="relative bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#fff4e6] px-6 py-3 rounded-full mb-8 border border-[#ff8c42]/20">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-[#ff8c42]" />
              <span className="font-bold text-[#2d2d2d] tracking-wide">We're Here to Help</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              <span className="text-[#2d2d2d]">Have Questions?</span>
              <br />
              <span className="text-[#ff8c42]">Let's Chat!</span>
            </h1>

            <p className="text-lg md:text-xl text-[#5a5a5a] leading-relaxed max-w-2xl mx-auto mb-8">
              Whether you're planning a custom cake order or just have a question, 
              we'd love to hear from you. Reach out anytime!
            </p>

            {/* Quick Contact Options */}
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="mailto:momsoven.lk@gmail.com"
                className="flex items-center gap-2 px-6 py-3 bg-[#fff4e6] rounded-full hover:bg-[#ff8c42] hover:text-white transition-all duration-300 border border-[#ff8c42]/20 text-[#2d2d2d] font-semibold"
              >
                <EnvelopeIcon className="w-5 h-5" />
                Email Us
              </a>
              <a 
                href="tel:+94771234567"
                className="flex items-center gap-2 px-6 py-3 bg-[#fff4e6] rounded-full hover:bg-[#ff8c42] hover:text-white transition-all duration-300 border border-[#ff8c42]/20 text-[#2d2d2d] font-semibold"
              >
                <PhoneIcon className="w-5 h-5" />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 bg-[#fff8f0]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: EnvelopeIcon,
                  title: 'Email',
                  value: 'momsoven.lk@gmail.com',
                  link: 'mailto:momsoven.lk@gmail.com'
                },
                {
                  icon: PhoneIcon,
                  title: 'Phone',
                  value: '+94 77 123 4567',
                  link: 'tel:+94771234567'
                },
                {
                  icon: MapPinIcon,
                  title: 'Location',
                  value: 'Kandy, Sri Lanka',
                  link: null
                },
                {
                  icon: ClockIcon,
                  title: 'Hours',
                  value: 'Mon-Sat 9AM-8PM',
                  link: null
                }
              ].map((contact, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#ff8c42]/20 group"
                >
                  <div className="w-12 h-12 bg-[#fff4e6] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ff8c42] transition-colors duration-300">
                    <contact.icon className="w-6 h-6 text-[#ff8c42] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-[#2d2d2d] mb-2">{contact.title}</h3>
                  {contact.link ? (
                    <a href={contact.link} className="text-sm text-[#5a5a5a] hover:text-[#ff8c42] transition-colors">
                      {contact.value}
                    </a>
                  ) : (
                    <p className="text-sm text-[#5a5a5a]">{contact.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-[#2d2d2d] mb-4">
                Send Us a{' '}
                <span className="text-[#ff8c42]">Message</span>
              </h2>
              <p className="text-[#5a5a5a]">
                Fill out the form and we'll respond within 24 hours
              </p>
            </div>

            <div className="bg-[#fff8f0] rounded-3xl p-8 md:p-10 shadow-xl border border-[#ff8c42]/10">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-[#ff8c42] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <CheckCircleIcon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#2d2d2d] mb-3">
                    Thank You!
                  </h3>
                  <p className="text-[#5a5a5a] text-lg">
                    Your message has been sent. We'll get back to you soon! 🎉
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-[#2d2d2d] mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-[#ff8c42]/20 rounded-xl focus:border-[#ff8c42] focus:outline-none transition-colors text-[#2d2d2d]"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-[#2d2d2d] mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-[#ff8c42]/20 rounded-xl focus:border-[#ff8c42] focus:outline-none transition-colors text-[#2d2d2d]"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-bold text-[#2d2d2d] mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border-2 border-[#ff8c42]/20 rounded-xl focus:border-[#ff8c42] focus:outline-none transition-colors text-[#2d2d2d]"
                        placeholder="+94 77 123 4567"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-bold text-[#2d2d2d] mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-[#ff8c42]/20 rounded-xl focus:border-[#ff8c42] focus:outline-none transition-colors appearance-none cursor-pointer text-[#2d2d2d]"
                      >
                        <option value="">Select a subject</option>
                        <option value="custom-order">Custom Cake Order</option>
                        <option value="general-inquiry">General Inquiry</option>
                        <option value="feedback">Feedback</option>
                        <option value="complaint">Complaint</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-[#2d2d2d] mb-2">
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white border-2 border-[#ff8c42]/20 rounded-xl focus:border-[#ff8c42] focus:outline-none transition-colors resize-none text-[#2d2d2d]"
                      placeholder="Tell us about your cake needs or any questions..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#ff8c42] hover:bg-[#ff7a2e] text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-[#fff8f0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-[#2d2d2d] mb-4">
                Common{' '}
                <span className="text-[#ff8c42]">Questions</span>
              </h2>
              <p className="text-[#5a5a5a]">Quick answers to questions you may have</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'How do I place an order?',
                  a: 'You can order through our website, call us, or send a message via WhatsApp. We\'ll discuss your requirements and confirm the details.',
                },
                {
                  q: 'How far in advance should I order?',
                  a: 'We recommend 3-5 days advance notice for best results. For simple cakes, we can sometimes accommodate shorter notice.',
                },
                {
                  q: 'Do you offer delivery?',
                  a: 'Yes! We deliver within Kandy and nearby areas. Delivery charges vary by location. Pickup is also available.',
                },
                {
                  q: 'Can I customize my cake?',
                  a: 'Absolutely! We love creating custom cakes. Share your ideas and we\'ll bring your vision to life.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept bank transfer and cash on delivery. A 50% advance payment confirms your order.',
                },
              ].map((faq, index) => (
                <details
                  key={index}
                  className="group bg-white rounded-2xl shadow-md border border-transparent hover:border-[#ff8c42]/20 transition-all"
                >
                  <summary className="flex justify-between items-center cursor-pointer p-6 font-bold text-base md:text-lg text-[#2d2d2d] list-none">
                    {faq.q}
                    <span className="text-[#ff8c42] text-2xl group-open:rotate-180 transition-transform">
                      ↓
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-[#5a5a5a] leading-relaxed">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}