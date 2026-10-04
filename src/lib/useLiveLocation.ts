'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LivePosition } from './types';
import { MAIN_ENTRANCE_FALLBACK } from './geo';

export type GeolocationStatus =
  | 'idle'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'loading';

interface UseLiveLocationReturn {
  position: LivePosition;
  accuracy: number;
  heading: number | null;
  status: GeolocationStatus;
  errorMessage: string | null;
  isFallback: boolean;
  requestLiveLocation: () => void;
  recenterTrigger: number;
  recenterOnUser: () => void;
}

const FALLBACK_POSITION: LivePosition = {
  lat: MAIN_ENTRANCE_FALLBACK.lat,
  lng: MAIN_ENTRANCE_FALLBACK.lng,
  accuracy: 15,
  heading: null,
  timestamp: Date.now(),
  isFallback: true,
};

export function useLiveLocation(): UseLiveLocationReturn {
  const [position, setPosition] = useState<LivePosition>(FALLBACK_POSITION);
  const [accuracy, setAccuracy] = useState<number>(15);
  const [heading, setHeading] = useState<number | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('prompt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(true);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Recenter trigger increments to notify map components to pan to user
  const recenterOnUser = useCallback(() => {
    setRecenterTrigger((prev) => prev + 1);
  }, []);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    const now = Date.now();
    // Throttle position updates to ~1 second to prevent map jitter
    if (now - lastUpdateRef.current < 800) {
      return;
    }
    lastUpdateRef.current = now;

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const acc = pos.coords.accuracy;
    const rawHeading = pos.coords.heading;

    setPosition({
      lat,
      lng,
      accuracy: acc,
      heading: rawHeading !== null && !isNaN(rawHeading) ? rawHeading : null,
      timestamp: pos.timestamp,
      isFallback: false,
    });
    setAccuracy(acc);
    if (rawHeading !== null && !isNaN(rawHeading)) {
      setHeading(rawHeading);
    }
    setStatus('granted');
    setIsFallback(false);
    setErrorMessage(null);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let stat: GeolocationStatus = 'unavailable';
    let msg = 'Live location unavailable — starting from Main Entrance.';

    if (err.code === err.PERMISSION_DENIED) {
      stat = 'denied';
      msg = 'Location permission denied — starting from Main Entrance.';
    } else if (err.code === err.TIMEOUT) {
      stat = 'timeout';
      msg = 'GPS signal timeout — starting from Main Entrance.';
    }

    setStatus(stat);
    setErrorMessage(msg);
    setIsFallback(true);
    setPosition((prev) => ({
      ...FALLBACK_POSITION,
      timestamp: Date.now(),
    }));
  }, []);

  const startWatching = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      setErrorMessage('Geolocation is not supported by your browser.');
      setIsFallback(true);
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setStatus('loading');

    try {
      const id = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: true,
          maximumAge: 2000,
          timeout: 10000,
        }
      );
      watchIdRef.current = id;
    } catch (e) {
      setStatus('unavailable');
      setIsFallback(true);
    }
  }, [handleSuccess, handleError]);

  // Request location permission explicitly
  const requestLiveLocation = useCallback(() => {
    startWatching();
  }, [startWatching]);

  // Initial load auto-start & cleanup
  useEffect(() => {
    startWatching();

    // Setup device orientation if available (compass heading)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let compassHeading: number | null = null;
      // iOS webkitCompassHeading
      if ('webkitCompassHeading' in e && typeof (e as any).webkitCompassHeading === 'number') {
        compassHeading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null && e.absolute) {
        compassHeading = 360 - e.alpha;
      }

      if (compassHeading !== null && !isNaN(compassHeading)) {
        setHeading(Math.round(compassHeading));
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [startWatching]);

  return {
    position,
    accuracy,
    heading,
    status,
    errorMessage,
    isFallback,
    requestLiveLocation,
    recenterTrigger,
    recenterOnUser,
  };
}
