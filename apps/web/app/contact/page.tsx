"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import type { Metadata } from "next";
import { Send, MapPin, Mail, Phone } from "lucide-react";

// metadata cannot be exported from a client component, so we remove it or move it to layout.
// For a simple fix, we just remove the exported metadata object since it's a client component now.

export default function ContactPage() {
  return (
    <main className="min-h-screen w-full relative bg-slate-50 dark:bg-[#050816]">
      <Navbar />
      
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform">
          <div className="h-[40rem] w-[60rem] rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-500/20" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl mb-6">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500">Touch</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Have questions about our platform or need help with a project? We'd love to hear from you. Fill out the form below and our team will get back to you shortly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8 rounded-[2rem] bg-white/60 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-8 shadow-xl backdrop-blur-xl">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Email</p>
                      <p>support@craftsite.ai</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Phone</p>
                      <p>+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Office</p>
                      <p>123 Innovation Drive<br />San Francisco, CA 94105</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-6 rounded-[2rem] bg-white/60 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-8 shadow-xl backdrop-blur-xl" onSubmit={(e) => { e.preventDefault(); alert("Thanks for contacting us! We'll be in touch soon."); }}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-xl border border-black/10 bg-white/50 p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full rounded-xl border border-black/10 bg-white/50 p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full rounded-xl border border-black/10 bg-white/50 p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="How can we help you?"
                />
              </div>
              <button 
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Send Message
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
