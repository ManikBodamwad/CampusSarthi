'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Search,
  MapPin,
  Footprints,
  ChevronRight,
  RefreshCw,
  LocateFixed,
  Building as BuildingIcon,
  CheckCircle2,
  Info,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import campusData from '@/data/campus_buildings.json';
import { Building, CampusRoom } from '@/lib/types';
import { useLiveLocation } from '@/lib/useLiveLocation';
import { computeLiveRoute } from '@/lib/geo';

const LiveCampusMap = dynamic(() => import('@/components/LiveCampusMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] bg-[#FAFAF8] rounded-[10px] flex flex-col items-center justify-center border border-[#ECECEC] text-[#5A5A5A]">
      <RefreshCw className="w-6 h-6 animate-spin text-[#6E1423] mb-2" />
      <span className="text-xs">Loading campus map...</span>
    </div>
  ),
});

const BUILDINGS: Building[] = campusData.buildings as Building[];
const ROOMS: CampusRoom[] = campusData.rooms as CampusRoom[];

import { useSearchParams } from 'next/navigation';

function NavigatorContent() {
  const searchParams = useSearchParams();
  const urlDestination = searchParams.get('destination');
  const urlRoom = searchParams.get('room');
  const urlQuery = searchParams.get('q');

  const {
    position,
    accuracy,
    isFallback,
    requestLiveLocation,
    recenterTrigger,
    recenterOnUser,
  } = useLiveLocation();

  const [searchQuery, setSearchQuery] = useState(urlQuery || '');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Determine initial building and room from URL params if available
  const initialBuilding = useMemo(() => {
    if (urlDestination) {
      const match = BUILDINGS.find(
        (b) =>
          b.id.toLowerCase() === urlDestination.toLowerCase() ||
          b.name.toLowerCase().includes(urlDestination.toLowerCase()) ||
          b.aka.toLowerCase().includes(urlDestination.toLowerCase())
      );
      if (match) return match;
    }
    if (urlRoom) {
      const rMatch = ROOMS.find(
        (r) =>
          r.id.toLowerCase() === urlRoom.toLowerCase() ||
          r.name.toLowerCase().includes(urlRoom.toLowerCase())
      );
      if (rMatch) {
        const bMatch = BUILDINGS.find((b) => b.id === rMatch.building_id);
        if (bMatch) return bMatch;
      }
    }
    return BUILDINGS.find((b) => b.id === 'chintan') || BUILDINGS[0];
  }, [urlDestination, urlRoom]);

  const initialRoom = useMemo(() => {
    if (urlRoom) {
      const rMatch = ROOMS.find(
        (r) =>
          r.id.toLowerCase() === urlRoom.toLowerCase() ||
          r.name.toLowerCase().includes(urlRoom.toLowerCase())
      );
      if (rMatch) return rMatch;
    }
    if (urlDestination) {
      const rMatch = ROOMS.find((r) => r.building_id === initialBuilding.id);
      if (rMatch) return rMatch;
    }
    return ROOMS.find((r) => r.id === 'hall-5') || null;
  }, [urlRoom, urlDestination, initialBuilding]);

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(initialBuilding);
  const [selectedRoom, setSelectedRoom] = useState<CampusRoom | null>(initialRoom);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // If URL search params change dynamically
  useEffect(() => {
    if (urlDestination) {
      const match = BUILDINGS.find(
        (b) =>
          b.id.toLowerCase() === urlDestination.toLowerCase() ||
          b.name.toLowerCase().includes(urlDestination.toLowerCase()) ||
          b.aka.toLowerCase().includes(urlDestination.toLowerCase())
      );
      if (match) setSelectedBuilding(match);
    }
    if (urlRoom) {
      const rMatch = ROOMS.find(
        (r) =>
          r.id.toLowerCase() === urlRoom.toLowerCase() ||
          r.name.toLowerCase().includes(urlRoom.toLowerCase())
      );
      if (rMatch) {
        setSelectedRoom(rMatch);
        const bMatch = BUILDINGS.find((b) => b.id === rMatch.building_id);
        if (bMatch) setSelectedBuilding(bMatch);
      }
    }
  }, [urlDestination, urlRoom]);

  const route = useMemo(() => {
    if (!selectedBuilding) return null;
    return computeLiveRoute(position, selectedBuilding);
  }, [position, selectedBuilding]);

  const handleSelectBuilding = (b: Building, matchingRoom?: CampusRoom) => {
    setSelectedBuilding(b);
    if (matchingRoom) {
      setSelectedRoom(matchingRoom);
    } else {
      const defaultRoom = ROOMS.find((r) => r.building_id === b.id) || null;
      setSelectedRoom(defaultRoom);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    const matchedRooms: { type: 'room'; room: CampusRoom; building: Building }[] = [];
    const matchedBuildings: { type: 'building'; building: Building }[] = [];

    ROOMS.forEach((r) => {
      if (
        r.name.toLowerCase().includes(q) ||
        r.wing.toLowerCase().includes(q) ||
        r.directions_text.toLowerCase().includes(q)
      ) {
        const b = BUILDINGS.find((bldg) => bldg.id === r.building_id);
        if (b) {
          matchedRooms.push({ type: 'room', room: r, building: b });
        }
      }
    });

    BUILDINGS.forEach((b) => {
      if (
        b.name.toLowerCase().includes(q) ||
        b.aka.toLowerCase().includes(q) ||
        b.desc.toLowerCase().includes(q)
      ) {
        matchedBuildings.push({ type: 'building', building: b });
      }
    });

    return [...matchedRooms, ...matchedBuildings];
  }, [searchQuery]);

  const filteredBuildings = useMemo(() => {
    if (selectedCategory === 'all') return BUILDINGS;
    return BUILDINGS.filter((b) => b.type === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAF8] text-[#1A1A1A] w-full min-h-[calc(100vh-3.5rem)]">
      {/* Fallback Banner */}
      {isFallback && (
        <div className="bg-white border-b border-[#ECECEC] px-4 py-2 text-xs text-[#5A5A5A] flex items-center justify-between">
          <span>Live location off — starting route from <strong>Main entrance</strong></span>
          <button
            onClick={requestLiveLocation}
            className="text-[#6E1423] hover:text-[#58101C] font-medium flex items-center space-x-1"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>Enable GPS</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-5 p-4 sm:p-6 max-w-[1100px] mx-auto w-full">
        {/* Left / Map Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3 relative">
          {/* Search Box Floating Top */}
          <div className="relative z-40">
            <div className="bg-white border border-[#ECECEC] rounded-[10px] shadow-xs focus-within:border-[#6E1423] focus-within:ring-1 focus-within:ring-[#6E1423]/20 transition-all flex items-center px-3.5 py-2.5">
              <Search className="w-4 h-4 text-[#5A5A5A] mr-2.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search buildings or rooms (e.g. Hall 5, Library, Mess)..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-full bg-transparent text-xs sm:text-sm text-[#1A1A1A] placeholder-[#8A8A8A] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="text-xs text-[#5A5A5A] hover:text-[#1A1A1A] px-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[10px] shadow-md border border-[#ECECEC] max-h-72 overflow-y-auto z-50 divide-y divide-[#ECECEC]">
                {searchResults.map((item, idx) => {
                  if (item.type === 'room') {
                    return (
                      <button
                        key={`room-${item.room.id}-${idx}`}
                        onClick={() => handleSelectBuilding(item.building, item.room)}
                        className="w-full text-left p-3 hover:bg-[#FAFAF8] transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <MapPin className="w-3.5 h-3.5 text-[#6E1423] flex-shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-[#1A1A1A]">
                              {item.room.name}
                            </div>
                            <div className="text-[11px] text-[#5A5A5A]">
                              {item.building.name} • {item.room.floor}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8A8A8A] group-hover:text-[#1A1A1A]" />
                      </button>
                    );
                  } else {
                    return (
                      <button
                        key={`bldg-${item.building.id}-${idx}`}
                        onClick={() => handleSelectBuilding(item.building)}
                        className="w-full text-left p-3 hover:bg-[#FAFAF8] transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <BuildingIcon className="w-3.5 h-3.5 text-[#5A5A5A] flex-shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-[#1A1A1A]">
                              {item.building.name}
                            </div>
                            <div className="text-[11px] text-[#5A5A5A]">
                              {item.building.aka}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8A8A8A] group-hover:text-[#1A1A1A]" />
                      </button>
                    );
                  }
                })}
              </div>
            )}
          </div>

          {/* Map Container */}
          <div className="relative flex-1 min-h-[460px] h-[520px] rounded-[10px] overflow-hidden border border-[#ECECEC]">
            <LiveCampusMap
              buildings={BUILDINGS}
              selectedBuilding={selectedBuilding}
              onSelectBuilding={handleSelectBuilding}
              userPosition={position}
              routeCoordinates={route?.pathCoordinates || null}
              recenterTrigger={recenterTrigger}
              onRecenter={recenterOnUser}
            />
          </div>
        </div>

        {/* Right / Details Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {selectedBuilding && route && (
            <div className="bg-white rounded-[10px] border border-[#ECECEC] p-5 space-y-4 shadow-xs">
              {/* Destination Header & Distance */}
              <div className="flex items-start justify-between pb-3 border-b border-[#ECECEC]">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-medium text-[#6E1423]">
                      Selected destination
                    </span>
                    {route.isArrived && (
                      <span className="text-[10px] font-medium text-[#2E7D53] bg-[#2E7D53]/10 px-2 py-0.5 rounded">
                        You are here
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-serif font-bold text-[#1A1A1A] mt-1">
                    {selectedRoom ? selectedRoom.name : selectedBuilding.name}
                  </h2>
                  <p className="text-xs text-[#5A5A5A]">
                    {selectedBuilding.name} • {selectedBuilding.aka}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-[#1A1A1A]">
                    {route.formattedDistance}
                  </div>
                  <div className="text-xs text-[#5A5A5A]">
                    {route.formattedEta}
                  </div>
                </div>
              </div>

              {/* Indoor Details */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#1A1A1A]">
                  <span className="flex items-center space-x-1.5">
                    <Footprints className="w-3.5 h-3.5 text-[#6E1423]" />
                    <span>Indoor directions</span>
                  </span>
                </div>

                {selectedRoom ? (
                  <div className="bg-[#FAFAF8] rounded-[8px] p-3.5 border border-[#ECECEC] space-y-2.5">
                    {/* Breadcrumbs */}
                    <div className="flex items-center text-[11px] text-[#5A5A5A] gap-1">
                      <span>Campus</span>
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-[#1A1A1A] font-medium">{selectedBuilding.name}</span>
                      <ChevronRight className="w-3 h-3" />
                      <span>{selectedRoom.floor}</span>
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-[#6E1423] font-medium">{selectedRoom.wing}</span>
                    </div>

                    {/* Step lines */}
                    <div className="space-y-1.5 text-xs text-[#1A1A1A] leading-relaxed pt-1">
                      {selectedRoom.directions_text.split('->').map((step, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <span className="text-[#5A5A5A] font-mono text-[11px] mt-0.5">{idx + 1}.</span>
                          <span>{step.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#5A5A5A] leading-relaxed bg-[#FAFAF8] p-3 rounded-[8px] border border-[#ECECEC]">
                    {selectedBuilding.desc}
                  </p>
                )}
              </div>

              {/* Quick rooms in this building */}
              <div className="pt-2">
                <span className="text-[11px] font-medium text-[#5A5A5A] block mb-1.5">
                  Rooms in {selectedBuilding.name}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ROOMS.filter((r) => r.building_id === selectedBuilding.id).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoom(r)}
                      className={`text-xs px-2.5 py-1 rounded-[6px] transition-colors ${
                        selectedRoom?.id === r.id
                          ? 'bg-[#6E1423] text-white'
                          : 'bg-[#FAFAF8] hover:bg-[#ECECEC] text-[#1A1A1A] border border-[#ECECEC]'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deep Link to Chat */}
              <div className="pt-2 border-t border-[#ECECEC] flex items-center justify-between">
                <Link
                  href={`/chat?q=Tell me details, timings, and policies for ${selectedRoom ? selectedRoom.name : selectedBuilding.name} at IIM Lucknow`}
                  className="w-full flex items-center justify-center space-x-2 bg-[#6E1423]/5 hover:bg-[#6E1423]/10 border border-[#6E1423]/20 text-[#6E1423] py-2.5 px-3 rounded-[8px] text-xs font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#6E1423]" />
                  <span>Ask CampusSaarthi AI about {selectedRoom ? selectedRoom.name : selectedBuilding.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#6E1423]" />
                </Link>
              </div>
            </div>
          )}

          {/* Campus Destinations list */}
          <div className="bg-white rounded-[10px] border border-[#ECECEC] p-4 shadow-xs">
            <span className="text-xs font-semibold text-[#1A1A1A] block mb-2.5">
              All destinations
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto">
              {filteredBuildings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleSelectBuilding(b)}
                  className={`text-left p-2 rounded-[6px] text-xs transition-colors truncate ${
                    selectedBuilding?.id === b.id
                      ? 'bg-[#FAFAF8] text-[#6E1423] font-semibold border border-[#ECECEC]'
                      : 'text-[#5A5A5A] hover:text-[#1A1A1A] hover:bg-[#FAFAF8]'
                  }`}
                >
                  <span className="block truncate">{b.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NavigatorPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-3.5rem)] bg-white text-[#5A5A5A]">
          <RefreshCw className="w-6 h-6 animate-spin text-[#6E1423]" />
        </div>
      }
    >
      <NavigatorContent />
    </React.Suspense>
  );
}
