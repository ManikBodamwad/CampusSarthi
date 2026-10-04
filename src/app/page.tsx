'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Compass, Sparkles, ArrowRight, Search, MapPin, Footprints, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');

  const quickPrompts = [
    { label: 'Hall 5 & Bodhi Griha 3', query: 'Where is Hall 5 and how do I reach it?' },
    { label: 'Fee instalments', query: 'Can I pay my tuition and hostel fees in instalments?' },
    { label: 'Mess & 2 AM food', query: 'What are Annapoorna mess timings and late night food options?' },
    { label: 'Bloomberg Lab', query: 'Where is the Bloomberg Finance Lab in the Library?' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#0C0E12] p-2 sm:p-3 flex flex-col justify-center">
      {/* Outer Rounded Container with 28px radius */}
      <div className="relative w-full rounded-[24px] sm:rounded-[28px] overflow-hidden min-h-[92vh] flex flex-col justify-between border border-[rgba(255,255,255,0.12)] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        
        {/* Full-Bleed Hero Background Image with authentic IIM Lucknow red-brick architecture & glowing light-trails */}
        <motion.div
          initial={shouldReduceMotion ? { scale: 1 } : { scale: 1.06, opacity: 0 }}
          animate={shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 select-none pointer-events-none"
        >
          <Image
            src="/hero.jpg"
            alt="IIM Lucknow Campus Architecture with glowing wayfinding light-trails"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>

        {/* Gradient Overlay for Text Legibility */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,14,20,0.35) 0%, rgba(10,14,20,0.20) 35%, rgba(10,14,20,0.88) 100%)',
          }}
        />

        {/* 1. TOP FLOATING GLASS NAV PILL (centered) */}
        <header className="relative z-20 pt-6 sm:pt-8 px-4 flex justify-center">
          <motion.nav
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center space-x-4 sm:space-x-6 px-6 sm:px-8 py-2.5 rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.12)] backdrop-blur-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
          >
            {/* CampusSaarthi Mark */}
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5A869] shadow-[0_0_10px_rgba(229,168,105,0.9)] animate-pulse" />
              <span className="text-sm sm:text-[15px] font-medium text-white tracking-wide">
                CampusSaarthi
              </span>
            </Link>

            <span className="text-[rgba(255,255,255,0.25)] select-none">•</span>

            {/* Links */}
            <div className="flex items-center space-x-4 sm:space-x-5 text-sm sm:text-[15px] font-normal text-white/90">
              <Link
                href="/chat"
                className="hover:text-white transition-colors py-1 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
              >
                Chat
              </Link>
              <Link
                href="/navigator"
                className="hover:text-white transition-colors py-1 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
              >
                Map
              </Link>
              <Link
                href="/admin"
                className="hover:text-white transition-colors py-1 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
              >
                Admin
              </Link>
            </div>
          </motion.nav>
        </header>

        {/* 2. MAIN BOTTOM CONTENT AREA */}
        <div className="relative z-20 px-6 sm:px-12 md:px-16 pb-10 sm:pb-12 pt-20 md:pt-28 max-w-[1400px] mx-auto w-full flex-1 flex flex-col justify-end">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            
            {/* LEFT COLUMN: Hero Headline, Interactive Search & Glass Buttons */}
            <div className="lg:col-span-7 space-y-5">
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-semibold text-white tracking-tight leading-[1.05] drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                  CampusSaarthi
                </h1>
                <p className="text-lg sm:text-xl md:text-[22px] font-normal text-white/85 tracking-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
                  Find your way. Find your answers.
                </p>
              </motion.div>

              {/* Interactive Universal Search Input */}
              <motion.form
                onSubmit={handleSearch}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-xl relative flex items-center"
              >
                <div className="w-full relative flex items-center bg-[rgba(18,24,34,0.75)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.22)] rounded-full px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] focus-within:border-[#E5A869]/70 focus-within:ring-1 focus-within:ring-[#E5A869]/40 transition-all">
                  <Search className="w-4 h-4 text-white/60 mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask about admissions, fee instalments, hostel rules, or Hall 5..."
                    className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/50 outline-none pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 bg-[#E5A869] hover:bg-[#F3C99F] text-[#0B0E14] p-2 rounded-full transition-all hover:scale-105 shadow-[0_0_12px_rgba(229,168,105,0.4)]"
                    title="Search"
                  >
                    <ArrowRight className="w-3.5 h-3.5 font-bold" />
                  </button>
                </div>
              </motion.form>

              {/* Quick Suggestion Chips */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-wrap items-center gap-2 pt-1"
              >
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => router.push(`/chat?q=${encodeURIComponent(p.query)}`)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] backdrop-blur-md text-white/80 hover:text-white hover:bg-[rgba(255,255,255,0.16)] transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Glass Description Block & Floating Glass Icon Tiles */}
            <div className="lg:col-span-5 flex flex-col items-start lg:items-end space-y-4">
              {/* Glass Description Block */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md p-5 sm:p-6 rounded-[18px] border border-[rgba(255,255,255,0.16)] bg-[rgba(18,24,34,0.7)] backdrop-blur-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-3"
              >
                <div className="flex items-center space-x-2 text-xs font-medium text-[#E5A869]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Grounded in Official IIML Circulars</span>
                </div>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-light">
                  An institutional AI guide for IIM Lucknow. Ask anything about documents, fee rules, mess timings, or hostels with explicit confidence citations.
                </p>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light">
                  Then let it walk you there — live GPS, Dijkstra paved walkway graph, down to the exact lecture hall.
                </p>
              </motion.div>

              {/* Two Floating Glass Action Buttons */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, scale: 0.95 } : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center space-x-3 w-full max-w-md"
              >
                <Link
                  href="/chat"
                  className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-full text-white text-xs sm:text-sm font-medium border border-[rgba(255,255,255,0.22)] bg-[rgba(255,255,255,0.12)] backdrop-blur-[14px] hover:bg-[rgba(255,255,255,0.22)] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.25)] group"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-2 text-[#E5A869]" />
                  <span>Ask a Question</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/navigator"
                  className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-full text-white text-xs sm:text-sm font-medium border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.06)] backdrop-blur-[14px] hover:bg-[rgba(255,255,255,0.16)] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
                >
                  <Compass className="w-3.5 h-3.5 mr-2 text-[#E5A869]" />
                  <span>Open Campus Map</span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* 3. FOOTER TAG (bottom row) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="pt-8 sm:pt-10 mt-6 border-t border-[rgba(255,255,255,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/60 font-light"
          >
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5A869]" />
              <span>Clarity begins with a good question.</span>
            </div>

            <div className="flex items-center space-x-4 text-white/60">
              <span>CampusSaarthi • Indian Institute of Management Lucknow</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
