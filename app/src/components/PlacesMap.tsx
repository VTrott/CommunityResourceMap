import { useEffect, useRef, useState } from 'react';
import type { Place, Category } from '../types';
import { calculateDistance } from '../services/geocoding';

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

interface PlacesMapProps {
  places: Place[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  radiusMiles?: number;
  onPlaceClick?: (place: Place) => void;
  selectedPlace?: Place | null;
}

// Color mapping for categories
const getCategoryColor = (categories: Category[]): string => {
  if (!categories || categories.length === 0) return '#6B7280'; // gray
  
  const categoryColors: Record<string, string> = {
    'Food Assistance': '#EF4444', // red
    'Healthcare': '#3B82F6', // blue
    'Housing': '#10B981', // green
    'Community Centers': '#8B5CF6', // purple
    'Education': '#F59E0B', // amber
    'Family Services': '#EC4899', // pink
    'Legal Aid': '#6366F1', // indigo
    'Emergency Services': '#DC2626', // red-600
    'Mental Health': '#059669', // emerald-600
    'Transportation': '#7C3AED', // violet-600
  };


  const firstCategory = categories[0]?.name;
  return categoryColors[firstCategory] || '#6B7280';
};

export default function PlacesMap({ 
  places, 
  userLocation, 
  radiusMiles = 15, 
  onPlaceClick,
  selectedPlace 
}: PlacesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [userMarker, setUserMarker] = useState<any>(null);
  const [radiusCircle, setRadiusCircle] = useState<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initMap = () => {
      const center = userLocation || { latitude: 39.8283, longitude: -98.5795 }; // Center of US
      
      const mapInstance = new window.google.maps.Map(mapRef.current!, {
        zoom: 10,
        center: { lat: center.latitude, lng: center.longitude },
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);
    };

    // Load Google Maps if not already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [userLocation, map]);

  // Update markers when places change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    // Add new markers
    const newMarkers = places.map(place => {
      if (!place.latitude || !place.longitude) return null;

      const marker = new window.google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        map,
        title: place.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: getCategoryColor(place.categories),
          fillOpacity: 0.8,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        animation: selectedPlace?.id === place.id ? window.google.maps.Animation.BOUNCE : undefined,
      });

      // Add click listener
      marker.addListener('click', () => {
        onPlaceClick?.(place);
      });

      return marker;
    }).filter(Boolean) as any[];

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()!));
      if (userLocation) {
        bounds.extend(new window.google.maps.LatLng(userLocation.latitude, userLocation.longitude));
      }
      map.fitBounds(bounds);
    }
  }, [places, map, selectedPlace, onPlaceClick]);

  // Update user location marker and radius circle
  useEffect(() => {
    if (!map || !userLocation) return;

    // Clear existing user marker and circle
    if (userMarker) userMarker.setMap(null);
    if (radiusCircle) radiusCircle.setMap(null);

    // Add user location marker
    const newUserMarker = new window.google.maps.Marker({
      position: { lat: userLocation.latitude, lng: userLocation.longitude },
      map,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#1F2937',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
      },
      zIndex: 1000,
    });

    // Add radius circle
    const newRadiusCircle = new window.google.maps.Circle({
      strokeColor: '#1F2937',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#1F2937',
      fillOpacity: 0.1,
      map,
      center: { lat: userLocation.latitude, lng: userLocation.longitude },
      radius: radiusMiles * 1609.34, // Convert miles to meters
    });

    setUserMarker(newUserMarker);
    setRadiusCircle(newRadiusCircle);
  }, [map, userLocation, radiusMiles]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Map View ({places.length} places)
        </h3>
        {userLocation && (
          <div className="text-sm text-gray-500">
            Showing places within {radiusMiles} miles
          </div>
        )}
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-300"
        style={{ minHeight: '400px' }}
      />
      
      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Category Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { name: 'Food Assistance', color: '#EF4444' },
            { name: 'Healthcare', color: '#3B82F6' },
            { name: 'Housing', color: '#10B981' },
            { name: 'Community Centers', color: '#8B5CF6' },
            { name: 'Education', color: '#F59E0B' },
            { name: 'Family Services', color: '#EC4899' },
            { name: 'Legal Aid', color: '#6366F1' },
            { name: 'Emergency Services', color: '#DC2626' },
          ].map(({ name, color }) => (
            <div key={name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-700">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
