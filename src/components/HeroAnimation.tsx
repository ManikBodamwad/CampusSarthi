'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, MapPin, CheckCircle2, Footprints, ArrowRight, Sparkles, Navigation } from 'lucide-react';
import Link from 'next/link';

interface Scenario {
  id: string;
  label: string;
  query: string;
  building: string;
  room: string;
  locationDetails: string;
  groundedSource: string;
  walkTime: string;
  mapRoute: {
    start: { x: number; y: number; label: string };
    end: { x: number; y: number; label: string; sub: string };
    path: string;
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: 'hall5',
    label: 'Hall 5',
    query: 'Where is Hall 5?',
    building: 'Bodhi Griha 3 (Chintan Bhawan)',
    room: 'Hall 5',
    locationDetails: 'Enter through the main portico, take the central stairs to the 1st floor, and turn right down the East Wing corridor.',
    groundedSource: 'Academic timetable & campus registry',
    walkTime: '~3 min walk from Hostel Quad',
    mapRoute: {
      start: { x: 30, y: 180, label: 'Hostel Quad' },
      end: { x: 315, y: 50, label: 'Hall 5', sub: 'Bodhi Griha 3' },
      path: 'M 30 180 L 120 180 L 120 110 L 220 110 L 220 50 L 305 50',
    },
  },
  {
    id: 'bloomberg',
    label: 'Bloomberg Lab',
    query: 'Where is the Bloomberg Finance Lab?',
    building: 'Gyanodaya Central Library',
    room: 'Financial Trading Lab (Ground Floor)',
    locationDetails: 'Located inside the Gyanodaya Library building. Pass the main turnstiles on Ground Floor, second glass room on the left.',
    groundedSource: 'Library directory & Facilities manual',
    walkTime: '~2 min walk from Admin Block',
    mapRoute: {
      start: { x: 220, y: 175, label: 'Admin Block' },
      end: { x: 55, y: 95, label: 'Bloomberg Lab', sub: 'Gyanodaya' },
      path: 'M 220 175 L 220 110 L 120 110 L 65 110 L 65 100',
    },
  },
  {
    id: 'samadhan',
    label: 'Fee & Admin Desk',
    query: 'How to reach Samadhan Student Desk?',
    building: 'Samadhan Administrative Complex',
    room: 'Counter 4 (Student Affairs)',
    locationDetails: 'Ground Floor, Samadhan Building, directly opposite the Central Lawn. Open weekdays 09:30 – 17:30.',
    groundedSource: 'PGP Admin Manual & Office directory',
    walkTime: '~4 min walk from Academic Blocks',
    mapRoute: {
      start: { x: 305, y: 50, label: 'Bodhi Griha' },
      end: { x: 220, y: 175, label: 'Samadhan Desk', sub: 'Admin Block' },
      path: 'M 305 50 L 220 50 L 220 170',
    },
  },
];

export default function HeroAnimation() {
  const shouldReduceMotion = useReducedMotion();
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const activeScenario = SCENARIOS[activeScenarioIdx];

  const [typedText, setTypedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [isLayerTransitioning, setIsLayerTransitioning] = useState(false);

  // Typewriter effect per scenario
  useEffect(() => {
    if (shouldReduceMotion) {
      setTypedText(activeScenario.query);
      setIsTypingDone(true);
      return;
    }

    setIsTypingDone(false);
    setTypedText('');

    let currentIdx = 0;
    const text = activeScenario.query;
    const interval = setInterval(() => {
      if (currentIdx <= text.length) {
        setTypedText(text.slice(0, currentIdx));
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsTypingDone(true);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [activeScenarioIdx, shouldReduceMotion, activeScenario.query]);

  const handleSelectScenario = (idx: number) => {
    if (idx === activeScenarioIdx || isLayerTransitioning) return;
    setIsLayerTransitioning(true);
    setTimeout(() => {
      setActiveScenarioIdx(idx);
      setIsLayerTransitioning(false);
    }, 450);
  };

  return (
    <div className="w-full max-w-[1040px] mx-auto mt-8 surface-card p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Codrops-inspired Clip-path Transition Layers (EOSAI Twilight Theme) */}
      <AnimatePresence>
        {isLayerTransitioning && !shouldReduceMotion && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {/* Layer 1: Ethereal Warm Amber Glow Layer */}
            <motion.div
              initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
              animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
              exit={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-0 bg-[#E5A869]/25 backdrop-blur-[2px]"
            />
            {/* Layer 2: Deep Dusk Terracotta Layer */}
            <motion.div
              initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
              animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
              exit={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
              transition={{ duration: 0.45, delay: 0.06, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-0 bg-[#C86D51]"
            />
            {/* Layer 3: Deep Twilight Slate Reveal Sheet */}
            <motion.div
              initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
              animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
              exit={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-0 bg-[#121822]"
            />
          </div>
        )}
      </AnimatePresence>

      {/* Top Header: Scenario Picker Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 mb-5 border-b border-[rgba(255,255,255,0.08)] gap-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#E5A869] shadow-[0_0_8px_rgba(229,168,105,0.8)]" />
          <span className="text-xs font-normal tracking-wide text-[#8E9BAE]">
            Question &rarr; Wayfinding Simulation
          </span>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {SCENARIOS.map((sc, idx) => {
            const isActive = idx === activeScenarioIdx;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(idx)}
                className={`text-xs px-3.5 py-1.5 rounded-[6px] transition-all whitespace-nowrap font-normal ${
                  isActive
                    ? 'bg-[#E5A869] text-[#0B0E14] font-medium shadow-[0_0_12px_rgba(229,168,105,0.3)]'
                    : 'bg-[#0F141D] text-[#8E9BAE] hover:text-[#F5F7FA] border border-[rgba(255,255,255,0.08)]'
                }`}
              >
                {sc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Question/Answer, Right Architectural Campus SVG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Simulated Question & Grounded Answer */}
        <div className="lg:col-span-6 space-y-4">
          {/* Simulated Search Input */}
          <div className="flex items-center space-x-3 px-4 py-3 bg-[#0F141D] border border-[rgba(255,255,255,0.08)] rounded-[10px]">
            <Search className="w-4 h-4 text-[#8E9BAE] flex-shrink-0" />
            <div className="flex-1 text-sm font-normal text-[#F5F7FA] flex items-center min-h-[20px]">
              <span>{typedText}</span>
              {!isTypingDone && !shouldReduceMotion && (
                <span className="w-0.5 h-4 bg-[#E5A869] ml-0.5 animate-pulse inline-block shadow-[0_0_6px_#E5A869]" />
              )}
            </div>
            <span className="text-[11px] text-[#8E9BAE] bg-[#182230] border border-[rgba(255,255,255,0.08)] px-2 py-0.5 rounded-[4px] hidden sm:inline-block">
              Return
            </span>
          </div>

          {/* Answer Card (Animates in once typing completes) */}
          <motion.div
            key={activeScenario.id}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={isTypingDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="p-4 sm:p-5 bg-[#121822]/90 border border-[rgba(255,255,255,0.08)] rounded-[10px] space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          >
            {/* Header chip */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1.5 text-[11px] font-normal text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/25 px-2.5 py-0.5 rounded-[6px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Grounded in {activeScenario.groundedSource}</span>
              </span>
              <span className="text-[11px] font-normal text-[#8E9BAE]">
                {activeScenario.room}
              </span>
            </div>

            {/* Answer Content */}
            <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed">
              <strong className="text-white font-medium">{activeScenario.room}</strong> is in <strong className="text-white font-medium">{activeScenario.building}</strong>. {activeScenario.locationDetails}
            </p>

            {/* Actions */}
            <div className="pt-2.5 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-[#8E9BAE]">
                <Footprints className="w-3.5 h-3.5 text-[#E5A869]" />
                <span>{activeScenario.walkTime}</span>
              </div>
              <Link
                href={`/chat?q=${encodeURIComponent(activeScenario.query)}`}
                className="text-[#E5A869] hover:text-[#F3C99F] font-medium inline-flex items-center space-x-1"
              >
                <span>Ask follow-up</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Architectural Campus Route Illustration */}
        <div className="lg:col-span-6 bg-[#0B0E14] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-4 sm:p-6 relative overflow-hidden flex items-center justify-center min-h-[260px]">
          <svg
            viewBox="0 0 380 220"
            className="w-full h-auto max-w-[340px]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Campus Outline Roads / Walkways */}
            <path
              d="M 30 180 L 120 180 L 120 110 L 220 110 L 220 50 L 330 50"
              stroke="#1E293B"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 120 180 L 120 110 L 40 110"
              stroke="#1E293B"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 220 110 L 220 180 L 320 180"
              stroke="#1E293B"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Buildings Outlines (Architectural minimalist blocks) */}
            {/* Hostel Quad / Start 1 */}
            <rect x="18" y="166" width="30" height="28" rx="4" fill="#121822" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x="33" y="206" fill="#8E9BAE" fontSize="7.5" fontFamily="Inter" textAnchor="middle">Hostels</text>

            {/* Library */}
            <rect x="30" y="86" width="38" height="28" rx="4" fill="#121822" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x="49" y="126" fill="#8E9BAE" fontSize="7.5" fontFamily="Inter" textAnchor="middle">Gyanodaya</text>

            {/* Samadhan Admin */}
            <rect x="202" y="162" width="38" height="28" rx="4" fill="#121822" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x="221" y="202" fill="#8E9BAE" fontSize="7.5" fontFamily="Inter" textAnchor="middle">Samadhan</text>

            {/* Bodhi Griha 3 */}
            <rect x="290" y="32" width="48" height="34" rx="4" fill="#121822" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x="314" y="48" fill="#F5F7FA" fontSize="8" fontWeight="500" fontFamily="Inter" textAnchor="middle">Bodhi Griha</text>
            <text x="314" y="59" fill="#8E9BAE" fontSize="7" fontFamily="Inter" textAnchor="middle">Hall 1-6</text>

            {/* Animated Walkway Route Line for Active Scenario */}
            <motion.path
              key={`route-${activeScenario.id}`}
              d={activeScenario.mapRoute.path}
              stroke="#E5A869"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={shouldReduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              animate={isTypingDone ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: 'easeInOut' }}
            />

            {/* Start Node: You are here */}
            <motion.g
              key={`start-${activeScenario.id}`}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={isTypingDone ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.1 }}
            >
              <circle cx={activeScenario.mapRoute.start.x} cy={activeScenario.mapRoute.start.y} r="8" fill="#E5A869" fillOpacity="0.2" />
              <circle cx={activeScenario.mapRoute.start.x} cy={activeScenario.mapRoute.start.y} r="4" fill="#E5A869" />
              <text x={activeScenario.mapRoute.start.x} y={activeScenario.mapRoute.start.y - 10} fill="#8E9BAE" fontSize="7.5" fontWeight="400" fontFamily="Inter" textAnchor="middle">
                Start
              </text>
            </motion.g>

            {/* Destination Pin: Spring drop */}
            <motion.g
              key={`pin-${activeScenario.id}`}
              initial={shouldReduceMotion ? { y: 0, opacity: 1 } : { y: -16, opacity: 0 }}
              animate={isTypingDone ? { y: 0, opacity: 1 } : { y: -16, opacity: 0 }}
              transition={{ delay: 0.85, type: 'spring', stiffness: 280, damping: 18 }}
            >
              <circle cx={activeScenario.mapRoute.end.x} cy={activeScenario.mapRoute.end.y} r="6" fill="#E5A869" />
              <circle cx={activeScenario.mapRoute.end.x} cy={activeScenario.mapRoute.end.y} r="2.5" fill="#0B0E14" />
            </motion.g>
          </svg>

          {/* Subtle live indicator */}
          <div className="absolute bottom-2.5 right-3 flex items-center space-x-1.5 text-[10px] text-[#8E9BAE] font-normal bg-[#121822]/80 backdrop-blur-sm px-2 py-0.5 rounded-[4px] border border-[rgba(255,255,255,0.08)]">
            <Navigation className="w-3 h-3 text-[#E5A869]" />
            <span>IIML Dijkstra Pathfinding</span>
          </div>
        </div>
      </div>
    </div>
  );
}
