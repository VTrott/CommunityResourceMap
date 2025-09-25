import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import type { Place } from '../types';

interface GoogleMapsProps {
  center: { lat: number; lng: number };
  zoom: number;
  places: Place[];
  selectedPlace?: Place | null;
  onPlaceSelect?: (place: Place) => void;
  searchLocation?: { lat: number; lng: number; address: string };
  radiusMiles?: number;
}

interface MapComponentProps {
  center: { lat: number; lng: number };
  zoom: number;
  places: Place[];
  selectedPlace?: Place | null;
  onPlaceSelect?: (place: Place) => void;
  searchLocation?: { lat: number; lng: number; address: string };
  radiusMiles?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center,
  zoom,
  places,
  selectedPlace,
  onPlaceSelect,
  searchLocation,
  radiusMiles = 10
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });
  }, [center, zoom]);

  // Auto-zoom to fit all places
  useEffect(() => {
    if (!mapInstanceRef.current || places.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidPlaces = false;

    // Add search location to bounds if available
    if (searchLocation) {
      bounds.extend(new google.maps.LatLng(searchLocation.lat, searchLocation.lng));
      hasValidPlaces = true;
    }

    // Add all places to bounds
    places.forEach(place => {
      if (place.latitude && place.longitude) {
        bounds.extend(new google.maps.LatLng(place.latitude, place.longitude));
        hasValidPlaces = true;
      }
    });

    // Only auto-zoom if we have valid places
    if (hasValidPlaces) {
      mapInstanceRef.current.fitBounds(bounds);
      
      // Set a minimum zoom level to prevent zooming in too much
      const listener = google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
        if (mapInstanceRef.current) {
          const currentZoom = mapInstanceRef.current.getZoom();
          if (currentZoom && currentZoom > 15) {
            mapInstanceRef.current.setZoom(15);
          }
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [places, searchLocation]);

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  // Add search location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !searchLocation) return;

    const searchMarker = new google.maps.Marker({
      position: { lat: searchLocation.lat, lng: searchLocation.lng },
      map: mapInstanceRef.current,
      title: `Search Location: ${searchLocation.address}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      },
      zIndex: 1000
    });

    return () => {
      searchMarker.setMap(null);
    };
  }, [searchLocation]);

  // Add radius circle
  useEffect(() => {
    if (!mapInstanceRef.current || !searchLocation) return;

    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    circleRef.current = new google.maps.Circle({
      strokeColor: '#10B981',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#10B981',
      fillOpacity: 0.1,
      map: mapInstanceRef.current,
      center: { lat: searchLocation.lat, lng: searchLocation.lng },
      radius: radiusMiles * 1609.34, // Convert miles to meters
    });

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, [searchLocation, radiusMiles]);

  // Add place markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    clearMarkers();

    places.forEach(place => {
      if (!place.latitude || !place.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        map: mapInstanceRef.current,
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: selectedPlace?.id === place.id ? '#EF4444' : '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        }
      });

      if (onPlaceSelect) {
        marker.addListener('click', () => {
          onPlaceSelect(place);
        });
      }

      markersRef.current.push(marker);
    });

    return () => {
      clearMarkers();
    };
  }, [places, selectedPlace, onPlaceSelect]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
};

const render = (status: Status): React.ReactElement => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="spinner"></div>
            <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Loading map...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
          <div className="text-center">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
            <p style={{ color: 'var(--error-500)' }}>Failed to load map</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
              Please check your internet connection
            </p>
          </div>
        </div>
      );
    default:
      return <div></div>;
  }
};

const GoogleMaps: React.FC<GoogleMapsProps> = (props) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Get the API key from environment variables
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    setApiKey(key);

    if (key) {
      // Load Google Maps script dynamically
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setScriptLoaded(false);
      document.head.appendChild(script);

      return () => {
        // Cleanup script on unmount
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, []);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-96 bg-yellow-50 rounded-lg">
        <div className="text-center">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
          <p style={{ color: 'var(--warning-500)' }}>Google Maps API Key Missing</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
            Please configure VITE_GOOGLE_MAPS_API_KEY in your .env file.
          </p>
        </div>
      </div>
    );
  }

  if (!scriptLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="spinner"></div>
          <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render}>
      <MapComponent {...props} />
    </Wrapper>
  );
};

export default GoogleMaps;