'use client';

import React, { useState } from 'react';
import { Room } from '@/lib/types';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  ExternalLink,
  Footprints,
  Maximize2,
  Sparkles,
  Building,
} from 'lucide-react';

interface GoogleCampusMapProps {
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  allRooms: Room[];
}

export const CAMPUS_LOCATIONS: Record<string, { lat: number; lng: number; title: string; desc: string; category: string }> = {
  'Hall 5': {
    lat: 26.9242,
    lng: 80.9472,
    title: 'Bodhi Griha 3 (BG3) — Hall 5',
    desc: 'Floor 1, East Wing • Executive Classrooms',
    category: 'classroom',
  },
  'Hall 1 (Main Auditorium)': {
    lat: 26.9230,
    lng: 80.9458,
    title: 'Chintan Bhawan — Hall 1 Auditorium',
    desc: 'Ground Floor • Main Academic Auditorium',
    category: 'classroom',
  },
  'Admissions & Registrar Office': {
    lat: 26.9222,
    lng: 80.9462,
    title: 'Prabandh Nagar Administrative Tower',
    desc: 'Ground Floor G-12 • Admissions & Student Affairs',
    category: 'admin',
  },
  'Central Library (Gyanodaya)': {
    lat: 26.9238,
    lng: 80.9480,
    title: 'Gyanodaya Central Library',
    desc: 'Floors 1 & 2 • 24/7 Digital Reference & Reading Halls',
    category: 'facility',
  },
  'Student Health Centre': {
    lat: 26.9218,
    lng: 80.9475,
    title: 'Samarpan Health Centre & Pharmacy',
    desc: 'Ground Floor • 24/7 Doctor On-Duty & Ambulance Bay',
    category: 'facility',
  },
  'Central Dining Hall / Mess 1': {
    lat: 26.9248,
    lng: 80.9455,
    title: 'Annapoorna Mess & Dining Complex',
    desc: 'Hostel Quadrangle • Veg & Non-Veg Dining',
    category: 'mess',
  },
  'Finance & Accounts Cell': {
    lat: 26.9224,
    lng: 80.9464,
    title: 'Finance & Accounts Office (Room 108)',
    desc: 'Floor 1, Admin Block • Student Fee & Loan Clearance',
    category: 'admin',
  },
  'Computer & IT Centre': {
    lat: 26.9232,
    lng: 80.9456,
    title: 'Chintan Bhawan IT Centre',
    desc: 'Floor 2, West Wing • Server Lab & IT Helpdesk',
    category: 'facility',
  },
};

const MAIN_GATE_COORDS = { lat: 26.9210, lng: 80.9460, title: 'Main Entrance Gate' };

export default function GoogleCampusMap({
  selectedRoom,
  onSelectRoom,
  allRooms,
}: GoogleCampusMapProps) {
  const [mapType, setMapType] = useState<'google_satellite' | 'google_roadmap'>('google_satellite');

  const activeCoord = selectedRoom && CAMPUS_LOCATIONS[selectedRoom.room_name]
    ? CAMPUS_LOCATIONS[selectedRoom.room_name]
    : CAMPUS_LOCATIONS['Hall 5'];

  const googleMapsAppUrl = `https://www.google.com/maps/dir/?api=1&origin=${MAIN_GATE_COORDS.lat},${MAIN_GATE_COORDS.lng}&destination=${activeCoord.lat},${activeCoord.lng}&travelmode=walking`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`IIM Lucknow ${selectedRoom?.room_name || 'Campus'}`)}`;

  return (
    <div className="relative w-full bg-white rounded-2xl border border-[#E6DFD5] shadow-sm overflow-hidden flex flex-col">
      {/* Top Map Control Bar */}
      <div className="bg-[#7E2228] px-5 py-3.5 flex flex-wrap items-center justify-between text-white gap-3">
        <div className="flex items-center space-x-2.5 text-xs font-semibold">
          <div className="w-6 h-6 rounded-lg bg-[#E5B54F] text-[#7E2228] flex items-center justify-center font-bold shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-white font-serif font-bold text-sm">IIM Lucknow Live Google Maps</span>
            <span className="hidden sm:inline text-[11px] text-[#F4EFE6]/80 font-sans ml-2">
              Prabandh Nagar, IIM Road (200-Acre Campus)
            </span>
          </div>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center space-x-1 bg-[#681B20] p-1 rounded-xl text-xs border border-[#94292F]">
          <button
            onClick={() => setMapType('google_satellite')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              mapType === 'google_satellite'
                ? 'bg-white text-[#7E2228] shadow-sm font-bold'
                : 'text-[#F4EFE6]/80 hover:text-white'
            }`}
          >
            Google Satellite
          </button>
          <button
            onClick={() => setMapType('google_roadmap')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              mapType === 'google_roadmap'
                ? 'bg-white text-[#7E2228] shadow-sm font-bold'
                : 'text-[#F4EFE6]/80 hover:text-white'
            }`}
          >
            Google Road
          </button>
        </div>
      </div>

      {/* Embedded Real Google Maps Iframe */}
      <div className="relative w-full h-[460px] bg-[#EFE9E0] flex items-center justify-center overflow-hidden">
        {mapType === 'google_satellite' && (
          <iframe
            title="IIM Lucknow Google Satellite Map"
            width="100%"
            height="100%"
            className="border-0 w-full h-full"
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${activeCoord.lat},${activeCoord.lng}&t=k&z=17&ie=UTF8&iwloc=&output=embed`}
          />
        )}

        {mapType === 'google_roadmap' && (
          <iframe
            title="IIM Lucknow Google Road Map"
            width="100%"
            height="100%"
            className="border-0 w-full h-full"
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${activeCoord.lat},${activeCoord.lng}&t=m&z=17&ie=UTF8&iwloc=&output=embed`}
          />
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="px-5 py-3.5 bg-[#F9F6F0] border-t border-[#E6DFD5] flex flex-wrap items-center justify-between text-xs text-[#5A504A] gap-2">
        <div className="flex items-center space-x-3 font-semibold">
          <span className="flex items-center space-x-1.5 text-[#7E2228]">
            <Footprints className="w-4 h-4" />
            <span>Walking ETA from Main Gate: ~3-4 mins (320m)</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={googleMapsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 bg-[#7E2228] hover:bg-[#681B20] text-white px-3.5 py-1.5 rounded-xl font-bold shadow-sm transition-all"
          >
            <span>Live GPS in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
