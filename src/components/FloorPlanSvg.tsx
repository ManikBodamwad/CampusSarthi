'use client';

import React from 'react';
import { Room } from '@/lib/types';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';

interface FloorPlanSvgProps {
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  allRooms: Room[];
}

export default function FloorPlanSvg({
  selectedRoom,
  onSelectRoom,
  allRooms,
}: FloorPlanSvgProps) {
  // SVG view dimensions: 600 x 500
  return (
    <div className="relative w-full bg-[#FBF7EF] rounded-2xl border-2 border-[#5C1220]/15 shadow-soft overflow-hidden">
      {/* Map Control / Header strip */}
      <div className="bg-[#5C1220] px-4 py-2.5 flex items-center justify-between text-[#FBF7EF]">
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <Compass className="w-4 h-4 text-[#C9A227] animate-spin-slow" />
          <span>IIM Lucknow Prabandh Nagar Interactive Floor Map</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-[#C9A227]">
          <Layers className="w-3.5 h-3.5" />
          <span>{selectedRoom ? `${selectedRoom.building} • ${selectedRoom.floor}` : 'Campus Overview'}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col items-center justify-center">
        <svg
          viewBox="0 0 600 500"
          className="w-full h-auto max-h-[460px] drop-shadow-md select-none transition-all duration-300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdfaf4" />
              <stop offset="100%" stopColor="#f4ede0" />
            </linearGradient>

            <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#faf6ee" />
            </linearGradient>

            <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5C1220" />
              <stop offset="100%" stopColor="#9E3A32" />
            </linearGradient>

            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background ground & campus pathways */}
          <rect width="600" height="500" fill="url(#bgGrad)" rx="12" />

          {/* Campus Boulevards & Roads */}
          <path
            d="M 50,250 Q 250,260 550,250"
            stroke="#e0d6c4"
            strokeWidth="32"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 300,50 L 300,450"
            stroke="#e0d6c4"
            strokeWidth="32"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="300" cy="250" r="45" fill="#e0d6c4" />
          <circle cx="300" cy="250" r="35" fill="#3E7C59" opacity="0.25" />
          <text x="300" y="254" textAnchor="middle" fontSize="10" fill="#3E7C59" fontWeight="bold">
            Bodhi Tree Plaza
          </text>

          {/* -------------------------------------------------- */}
          {/* BUILDINGS */}
          {/* -------------------------------------------------- */}

          {/* 1. Bodhi Griha 3 (BG3) - Upper Right */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
            onClick={() => {
              const r = allRooms.find((rm) => rm.room_name.includes('Hall 5'));
              if (r) onSelectRoom(r);
            }}
          >
            <rect
              x="340"
              y="160"
              width="210"
              height="80"
              rx="8"
              fill={selectedRoom?.building.includes('BG3') ? '#faecee' : 'url(#buildingGrad)'}
              stroke={selectedRoom?.building.includes('BG3') ? '#5C1220' : '#c8bfc0'}
              strokeWidth={selectedRoom?.building.includes('BG3') ? '2.5' : '1.5'}
            />
            <text x="445" y="180" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5C1220">
              Bodhi Griha 3 (BG3)
            </text>
            <text x="445" y="195" textAnchor="middle" fontSize="9" fill="#6f5e5f">
              Academic Wing • Floor 1
            </text>

            {/* Hall 5 sub-box */}
            <rect
              x="360"
              y="205"
              width="80"
              height="26"
              rx="4"
              fill={selectedRoom?.room_name === 'Hall 5' ? '#5C1220' : '#e6cb60'}
              opacity={selectedRoom?.room_name === 'Hall 5' ? 1 : 0.3}
            />
            <text
              x="400"
              y="222"
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill={selectedRoom?.room_name === 'Hall 5' ? '#FBF7EF' : '#5C1220'}
            >
              Hall 5 (East)
            </text>

            {/* Hall 6 sub-box */}
            <rect x="455" y="205" width="80" height="26" rx="4" fill="#c8bfc0" opacity="0.3" />
            <text x="495" y="222" textAnchor="middle" fontSize="9" fill="#584a4b">
              Hall 6 (West)
            </text>
          </g>

          {/* 2. Chintan Bhawan (Main Academic Block) - Upper Left */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
            onClick={() => {
              const r = allRooms.find((rm) => rm.room_name.includes('Hall 1'));
              if (r) onSelectRoom(r);
            }}
          >
            <rect
              x="50"
              y="80"
              width="210"
              height="110"
              rx="8"
              fill={selectedRoom?.building.includes('Chintan') ? '#faecee' : 'url(#buildingGrad)'}
              stroke={selectedRoom?.building.includes('Chintan') ? '#5C1220' : '#c8bfc0'}
              strokeWidth={selectedRoom?.building.includes('Chintan') ? '2.5' : '1.5'}
            />
            <text x="155" y="105" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5C1220">
              Chintan Bhawan
            </text>
            <text x="155" y="120" textAnchor="middle" fontSize="9" fill="#6f5e5f">
              Main Academic & Auditorium Block
            </text>

            {/* Hall 1 Box */}
            <rect
              x="70"
              y="135"
              width="80"
              height="40"
              rx="4"
              fill={selectedRoom?.room_name.includes('Hall 1') ? '#5C1220' : '#e6cb60'}
              opacity={selectedRoom?.room_name.includes('Hall 1') ? 1 : 0.3}
            />
            <text
              x="110"
              y="160"
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill={selectedRoom?.room_name.includes('Hall 1') ? '#FBF7EF' : '#5C1220'}
            >
              Hall 1 (Auditorium)
            </text>

            {/* IT Centre */}
            <rect
              x="160"
              y="135"
              width="85"
              height="40"
              rx="4"
              fill={selectedRoom?.room_name.includes('IT') ? '#5C1220' : '#c8bfc0'}
              opacity={selectedRoom?.room_name.includes('IT') ? 1 : 0.3}
            />
            <text
              x="202"
              y="160"
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill={selectedRoom?.room_name.includes('IT') ? '#FBF7EF' : '#3B2E2A'}
            >
              IT & Server Lab
            </text>
          </g>

          {/* 3. Prabandh Nagar Admin Block - Lower Left */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
            onClick={() => {
              const r = allRooms.find((rm) => rm.room_name.includes('Admissions') || rm.room_name.includes('Accounts'));
              if (r) onSelectRoom(r);
            }}
          >
            <rect
              x="50"
              y="280"
              width="210"
              height="100"
              rx="8"
              fill={selectedRoom?.building.includes('Admin') ? '#faecee' : 'url(#buildingGrad)'}
              stroke={selectedRoom?.building.includes('Admin') ? '#5C1220' : '#c8bfc0'}
              strokeWidth={selectedRoom?.building.includes('Admin') ? '2.5' : '1.5'}
            />
            <text x="155" y="305" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5C1220">
              Admin & Registrar Tower
            </text>
            <text x="155" y="320" textAnchor="middle" fontSize="9" fill="#6f5e5f">
              Admissions • Accounts • Dean
            </text>

            {/* Admissions */}
            <rect
              x="65"
              y="335"
              width="85"
              height="34"
              rx="4"
              fill={selectedRoom?.room_name.includes('Admissions') ? '#5C1220' : '#e6cb60'}
              opacity={selectedRoom?.room_name.includes('Admissions') ? 1 : 0.3}
            />
            <text
              x="107"
              y="356"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="bold"
              fill={selectedRoom?.room_name.includes('Admissions') ? '#FBF7EF' : '#5C1220'}
            >
              Admissions (G-12)
            </text>

            {/* Accounts */}
            <rect
              x="160"
              y="335"
              width="85"
              height="34"
              rx="4"
              fill={selectedRoom?.room_name.includes('Accounts') ? '#5C1220' : '#e6cb60'}
              opacity={selectedRoom?.room_name.includes('Accounts') ? 1 : 0.3}
            />
            <text
              x="202"
              y="356"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="bold"
              fill={selectedRoom?.room_name.includes('Accounts') ? '#FBF7EF' : '#5C1220'}
            >
              Accounts & Fee
            </text>
          </g>

          {/* 4. Gyanodaya Library Complex - Top Center/Right */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
            onClick={() => {
              const r = allRooms.find((rm) => rm.room_name.includes('Library'));
              if (r) onSelectRoom(r);
            }}
          >
            <rect
              x="340"
              y="60"
              width="210"
              height="80"
              rx="8"
              fill={selectedRoom?.building.includes('Library') ? '#faecee' : 'url(#buildingGrad)'}
              stroke={selectedRoom?.building.includes('Library') ? '#5C1220' : '#c8bfc0'}
              strokeWidth={selectedRoom?.building.includes('Library') ? '2.5' : '1.5'}
            />
            <text x="445" y="88" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5C1220">
              Gyanodaya Library Complex
            </text>
            <text x="445" y="103" textAnchor="middle" fontSize="9" fill="#6f5e5f">
              24x7 Reading Halls & Digital Reference
            </text>
            <rect
              x="370"
              y="112"
              width="150"
              height="20"
              rx="4"
              fill={selectedRoom?.room_name.includes('Library') ? '#5C1220' : '#3E7C59'}
              opacity={selectedRoom?.room_name.includes('Library') ? 1 : 0.2}
            />
            <text
              x="445"
              y="126"
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill={selectedRoom?.room_name.includes('Library') ? '#FBF7EF' : '#3E7C59'}
            >
              Quiet Zone & Turnstiles
            </text>
          </g>

          {/* 5. Annapoorna Dining / Mess - Lower Right */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
            onClick={() => {
              const r = allRooms.find((rm) => rm.room_name.includes('Dining') || rm.room_name.includes('Mess'));
              if (r) onSelectRoom(r);
            }}
          >
            <rect
              x="340"
              y="320"
              width="210"
              height="90"
              rx="8"
              fill={selectedRoom?.building.includes('Mess') ? '#faecee' : 'url(#buildingGrad)'}
              stroke={selectedRoom?.building.includes('Mess') ? '#5C1220' : '#c8bfc0'}
              strokeWidth={selectedRoom?.building.includes('Mess') ? '2.5' : '1.5'}
            />
            <text x="445" y="348" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5C1220">
              Annapoorna Mess Complex
            </text>
            <text x="445" y="363" textAnchor="middle" fontSize="9" fill="#6f5e5f">
              Dining Hall 1 (Veg / Non-Veg Sections)
            </text>

            <rect
              x="360"
              y="375"
              width="170"
              height="22"
              rx="4"
              fill={selectedRoom?.room_name.includes('Mess') ? '#5C1220' : '#D98B2B'}
              opacity={selectedRoom?.room_name.includes('Mess') ? 1 : 0.2}
            />
            <text
              x="445"
              y="390"
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill={selectedRoom?.room_name.includes('Mess') ? '#FBF7EF' : '#D98B2B'}
            >
              Main Dining & Food Court
            </text>
          </g>

          {/* 6. Samarpan Health Centre - Bottom Left */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
            onClick={() => {
              const r = allRooms.find((rm) => rm.room_name.includes('Health'));
              if (r) onSelectRoom(r);
            }}
          >
            <rect
              x="50"
              y="410"
              width="210"
              height="60"
              rx="8"
              fill={selectedRoom?.building.includes('Samarpan') ? '#faecee' : 'url(#buildingGrad)'}
              stroke={selectedRoom?.building.includes('Samarpan') ? '#5C1220' : '#c8bfc0'}
              strokeWidth={selectedRoom?.building.includes('Samarpan') ? '2.5' : '1.5'}
            />
            <text x="155" y="435" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5C1220">
              Samarpan Health Centre & Pharmacy
            </text>
            <text x="155" y="450" textAnchor="middle" fontSize="9" fill="#3E7C59" fontWeight="bold">
              24/7 Emergency & Medical Room
            </text>
          </g>

          {/* Active Navigation Pin & Route Animation */}
          {selectedRoom?.coordinates && (
            <g>
              {/* Dynamic Path line from Main Entrance to Room */}
              <path
                d={`M 300,480 Q 300,300 ${selectedRoom.coordinates.x},${selectedRoom.coordinates.y}`}
                stroke="#C9A227"
                strokeWidth="3"
                strokeDasharray="6 6"
                fill="none"
                className="animate-pulse"
              />

              {/* Start Entrance Marker */}
              <circle cx="300" cy="475" r="7" fill="#5C1220" stroke="#C9A227" strokeWidth="2" />
              <text x="300" y="495" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#5C1220">
                You are here (Main Gate / Plaza)
              </text>

              {/* Destination Glowing Pin */}
              <circle
                cx={selectedRoom.coordinates.x}
                cy={selectedRoom.coordinates.y}
                r="18"
                fill="#C9A227"
                opacity="0.3"
                className="animate-ping"
              />
              <circle
                cx={selectedRoom.coordinates.x}
                cy={selectedRoom.coordinates.y}
                r="10"
                fill="#5C1220"
                stroke="#C9A227"
                strokeWidth="2.5"
                filter="url(#glowEffect)"
              />
              <circle
                cx={selectedRoom.coordinates.x}
                cy={selectedRoom.coordinates.y}
                r="4"
                fill="#FBF7EF"
              />
            </g>
          )}
        </svg>

        {/* Legend footer */}
        <div className="w-full mt-3 pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-600 gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5C1220] inline-block"></span>
              <span>Target Room / Building</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] inline-block"></span>
              <span>Active Waypoint</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3E7C59] inline-block"></span>
              <span>Campus Landmark</span>
            </span>
          </div>
          <span className="text-[11px] text-gray-500 italic">
            Click any building to view internal directions
          </span>
        </div>
      </div>
    </div>
  );
}
