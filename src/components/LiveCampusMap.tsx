'use client';

import React, { useEffect, useRef } from 'react';
import { Building, LivePosition } from '@/lib/types';
import { CAMPUS_CENTER } from '@/lib/geo';
import { Crosshair } from 'lucide-react';
import type * as LeafletType from 'leaflet';

interface LiveCampusMapProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onSelectBuilding: (building: Building) => void;
  userPosition: LivePosition;
  routeCoordinates: [number, number][] | null;
  recenterTrigger: number;
  onRecenter: () => void;
}

export default function LiveCampusMap({
  buildings,
  selectedBuilding,
  onSelectBuilding,
  userPosition,
  routeCoordinates,
  recenterTrigger,
  onRecenter,
}: LiveCampusMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletType.Map | null>(null);
  const userMarkerRef = useRef<LeafletType.Marker | null>(null);
  const accuracyCircleRef = useRef<LeafletType.Circle | null>(null);
  const routePolylineRef = useRef<LeafletType.Polyline | null>(null);
  const buildingMarkersRef = useRef<Map<string, LeafletType.Marker>>(new Map());

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [CAMPUS_CENTER.lat, CAMPUS_CENTER.lng],
        zoom: CAMPUS_CENTER.zoom,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      // Clean, free OpenStreetMap tiles with zero watermark
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;

      // Populate Building Markers (Custom crisp maroon pins)
      buildings.forEach((b) => {
        const isSelected = selectedBuilding?.id === b.id;

        const markerHtml = `
          <div class="building-pin-wrapper" style="cursor: pointer; position: relative;">
            <div style="
              background-color: ${isSelected ? '#6E1423' : '#1A1A1A'};
              color: white;
              width: ${isSelected ? '24px' : '18px'};
              height: ${isSelected ? '24px' : '18px'};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              transition: all 0.2s ease;
            ">
              <div style="width: ${isSelected ? '6px' : '4px'}; height: ${isSelected ? '6px' : '4px'}; border-radius: 50%; background: #ffffff;"></div>
            </div>
            <div style="
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translateX(-50%);
              background: ${isSelected ? '#6E1423' : '#FFFFFF'};
              color: ${isSelected ? '#FFFFFF' : '#1A1A1A'};
              border: 1px solid ${isSelected ? '#6E1423' : '#ECECEC'};
              font-size: 10px;
              font-weight: ${isSelected ? '600' : '500'};
              font-family: Inter, sans-serif;
              padding: 1px 6px;
              border-radius: 4px;
              white-space: nowrap;
              pointer-events: none;
              margin-top: 3px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.12);
            ">
              ${b.name}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'custom-building-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([b.lat, b.lng], { icon }).addTo(map);
        marker.on('click', () => {
          onSelectBuilding(b);
        });

        buildingMarkersRef.current.set(b.id, marker);
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Building Marker styles on selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    import('leaflet').then((LeafletModule) => {
      const L = LeafletModule.default;

      buildings.forEach((b) => {
        const marker = buildingMarkersRef.current.get(b.id);
        if (marker) {
          const isSelected = selectedBuilding?.id === b.id;

          const markerHtml = `
            <div class="building-pin-wrapper" style="cursor: pointer; position: relative;">
              <div style="
                background-color: ${isSelected ? '#6E1423' : '#1A1A1A'};
                color: white;
                width: ${isSelected ? '24px' : '18px'};
                height: ${isSelected ? '24px' : '18px'};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                transition: all 0.2s ease;
              ">
                <div style="width: ${isSelected ? '6px' : '4px'}; height: ${isSelected ? '6px' : '4px'}; border-radius: 50%; background: #ffffff;"></div>
              </div>
              <div style="
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: ${isSelected ? '#6E1423' : '#FFFFFF'};
                color: ${isSelected ? '#FFFFFF' : '#1A1A1A'};
                border: 1px solid ${isSelected ? '#6E1423' : '#ECECEC'};
                font-size: 10px;
                font-weight: ${isSelected ? '600' : '500'};
                font-family: Inter, sans-serif;
                padding: 1px 6px;
                border-radius: 4px;
                white-space: nowrap;
                pointer-events: none;
                margin-top: 3px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.12);
              ">
                ${b.name}
              </div>
            </div>
          `;

          const icon = L.divIcon({
            html: markerHtml,
            className: 'custom-building-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          marker.setIcon(icon);
          marker.setZIndexOffset(isSelected ? 1000 : 100);
        }
      });
    });
  }, [selectedBuilding, buildings]);

  // Update Live User GPS Marker & Accuracy Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    import('leaflet').then((LeafletModule) => {
      const L = LeafletModule.default;
      const { lat, lng, accuracy } = userPosition;

      const userHtml = `
        <div class="user-marker-container">
          <div class="user-marker-pulse"></div>
          <div class="user-marker-dot"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userHtml,
        className: 'custom-user-live-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([lat, lng], {
          icon: userIcon,
          zIndexOffset: 2000,
        }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([lat, lng]);
        userMarkerRef.current.setIcon(userIcon);
      }

      const safeAccuracy = Math.min(Math.max(accuracy || 15, 5), 100);
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = L.circle([lat, lng], {
          radius: safeAccuracy,
          color: '#6E1423',
          fillColor: '#6E1423',
          fillOpacity: 0.1,
          weight: 1,
          dashArray: '3, 3',
        }).addTo(map);
      } else {
        accuracyCircleRef.current.setLatLng([lat, lng]);
        accuracyCircleRef.current.setRadius(safeAccuracy);
      }
    });
  }, [userPosition]);

  // Update Route Polyline (clean maroon path along walkways)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    import('leaflet').then((LeafletModule) => {
      const L = LeafletModule.default;

      if (routeCoordinates && routeCoordinates.length >= 2) {
        if (!routePolylineRef.current) {
          routePolylineRef.current = L.polyline(routeCoordinates, {
            color: '#6E1423',
            weight: 4.5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);
        } else {
          routePolylineRef.current.setLatLngs(routeCoordinates);
        }
      } else {
        if (routePolylineRef.current) {
          routePolylineRef.current.remove();
          routePolylineRef.current = null;
        }
      }
    });
  }, [routeCoordinates]);

  // Recenter handler
  useEffect(() => {
    if (recenterTrigger > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [userPosition.lat, userPosition.lng],
        17,
        { duration: 0.8 }
      );
    }
  }, [recenterTrigger, userPosition]);

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-[10px] overflow-hidden border border-[#ECECEC] bg-[#F8F8F6]">
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px]" />

      {/* Recenter button */}
      <button
        onClick={onRecenter}
        type="button"
        title="Recenter on my location"
        className="absolute bottom-5 right-5 z-[500] bg-white hover:bg-[#FAFAF8] text-[#1A1A1A] p-2.5 rounded-[8px] border border-[#ECECEC] shadow-sm transition-colors"
      >
        <Crosshair className="w-4 h-4 text-[#6E1423]" />
      </button>
    </div>
  );
}
