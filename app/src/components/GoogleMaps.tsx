import { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import type { Place } from '../types';
import MapPopup from './MapPopup';

interface GoogleMapsProps {
  places: Place[];
  userLocation?: { latitude: number; longitude: number };
  searchCenter?: { latitude: number; longitude: number };
  radiusMiles?: number;
  onPlaceClick?: (place: Place) => void;
  selectedPlace?: Place | null;
  apiKey: string;
  onClosePopup?: () => void;
}

interface MapComponentProps {
  places: Place[];
  userLocation?: { latitude: number; longitude: number };
  searchCenter?: { latitude: number; longitude: number };
  radiusMiles?: number;
  onPlaceClick?: (place: Place) => void;
  selectedPlace?: Place | null;
}

// Category colors matching the original implementation
const getCategoryColor = (place: Place) => {
  if (!place.categories || place.categories.length === 0) return '#6B7280';
  
  const categoryColors: Record<string, string> = {
    'Food Assistance': '#EF4444',
    'Healthcare': '#10B981',
    'Housing': '#F59E0B',
    'Legal Aid': '#8B5CF6',
    'Family Services': '#EC4899',
    'Employment': '#06B6D4',
    'Education': '#84CC16'
  };

  return categoryColors[place.categories[0].name] || '#6B7280';
};

function MapComponent({
  places,
  userLocation,
  searchCenter,
  radiusMiles,
  onPlaceClick,
  selectedPlace
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [searchMarker, setSearchMarker] = useState<google.maps.Marker | null>(null);
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!mapRef.current || map) return;

    try {
      let center = { lat: 40.7128, lng: -74.0060 }; 
      let zoom = 12;
      
      if (searchCenter) {
        center = { lat: searchCenter.latitude, lng: searchCenter.longitude };
        zoom = 13;
      } else if (userLocation) {
        center = { lat: userLocation.latitude, lng: userLocation.longitude };
        zoom = 12;
      } else if (places.length > 0 && places[0].latitude && places[0].longitude) {
        center = { lat: places[0].latitude, lng: places[0].longitude };
        zoom = 12;
      }

      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom,
        center,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      setMap(mapInstance);
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  }, [map, places, userLocation, searchCenter]);

  // Update markers when places change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    // Add new markers for places
    const newMarkers = places
      .filter(place => place.latitude !== undefined && place.longitude !== undefined)
      .map(place => {
        const marker = new google.maps.Marker({
          position: { lat: place.latitude!, lng: place.longitude! },
          map,
          title: place.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: getCategoryColor(place),
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2
          }
        });

        marker.addListener('click', () => {
          onPlaceClick?.(place);
        });

        return marker;
      });

    setMarkers(newMarkers);
  }, [map, places, onPlaceClick]);

  // Update user location marker
  useEffect(() => {
    if (!map || !userLocation) {
      if (userMarker) {
        userMarker.setMap(null);
        setUserMarker(null);
      }
      return;
    }


    if (userMarker) {
      userMarker.setMap(null);
    }

    const newUserMarker = new google.maps.Marker({
      position: { lat: userLocation.latitude, lng: userLocation.longitude },
      map,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 16,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 3
      }
    });

    setUserMarker(newUserMarker);
  }, [map, userLocation]);

  // Update search center marker
  useEffect(() => {
    if (!map || !searchCenter) {
      if (searchMarker) {
        searchMarker.setMap(null);
        setSearchMarker(null);
      }
      return;
    }

    // Remove existing search marker
    if (searchMarker) {
      searchMarker.setMap(null);
    }

    // Add new search marker
    const newSearchMarker = new google.maps.Marker({
      position: { lat: searchCenter.latitude, lng: searchCenter.longitude },
      map,
      title: 'Search Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 3
      }
    });

    setSearchMarker(newSearchMarker);
  }, [map, searchCenter]);

  // Update radius circle
  useEffect(() => {
    const centerLocation = searchCenter || userLocation;
    if (!map || !centerLocation || !radiusMiles) {
      if (circle) {
        circle.setMap(null);
        setCircle(null);
      }
      return;
    }

    // Remove existing circle
    if (circle) {
      circle.setMap(null);
    }

    // Add new circle
    const newCircle = new google.maps.Circle({
      strokeColor: searchCenter ? '#10B981' : '#3B82F6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: searchCenter ? '#10B981' : '#3B82F6',
      fillOpacity: 0.1,
      map,
      center: { lat: centerLocation.latitude, lng: centerLocation.longitude },
      radius: radiusMiles * 1609.34 // Convert miles to meters
    });

    setCircle(newCircle);
  }, [map, userLocation, searchCenter, radiusMiles]);

  // Update map bounds to fit all markers
  useEffect(() => {
    if (!map || (places.length === 0 && !userLocation && !searchCenter)) return;

    const bounds = new google.maps.LatLngBounds();
    
    // Add search center to bounds (highest priority)
    if (searchCenter) {
      bounds.extend({ lat: searchCenter.latitude, lng: searchCenter.longitude });
    }
    
    // Add user location to bounds
    if (userLocation) {
      bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });
    }

    // Add places to bounds
    places
      .filter(place => place.latitude !== undefined && place.longitude !== undefined)
      .forEach(place => {
        bounds.extend({ lat: place.latitude!, lng: place.longitude! });
      });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
  }, [map, places, userLocation, searchCenter]);

  // Highlight selected place
  useEffect(() => {
    if (!map || !selectedPlace || markers.length === 0) return;

    const selectedMarker = markers.find(marker => 
      marker.getTitle() === selectedPlace.name
    );

    if (selectedMarker) {
      // Reset all markers to normal size
      markers.forEach(marker => {
        const place = places.find(p => p.name === marker.getTitle());
        if (place) {
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: getCategoryColor(place),
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2
          });
        }
      });

      selectedMarker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: 16,
        fillColor: getCategoryColor(selectedPlace),
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 3
      });
    }
  }, [map, selectedPlace, markers, places]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-lg" style={{ minHeight: '400px' }} />;
}

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="bg-red-50 rounded-lg p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-900 mb-2">Map Error</h3>
          <p className="text-red-600">Failed to load Google Maps. Please check your API key.</p>
        </div>
      );
    default:
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
          <p className="text-gray-600">Initializing map...</p>
        </div>
      );
  }
};

export default function GoogleMaps({
  places,
  userLocation,
  searchCenter,
  radiusMiles,
  onPlaceClick,
  selectedPlace,
  apiKey,
  onClosePopup
}: GoogleMapsProps) {
  
  if (places.length === 0 && !userLocation) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Map</h3>
        <p className="text-gray-600">Search for places to see them on the map</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Interactive Map</h3>
        <p className="text-sm text-gray-600">
          {places.length} places found within {radiusMiles || 10} miles
        </p>
      </div>
      
      <Wrapper apiKey={apiKey} render={render}>
        <MapComponent
          places={places}
          userLocation={userLocation}
          searchCenter={searchCenter}
          radiusMiles={radiusMiles}
          onPlaceClick={onPlaceClick}
          selectedPlace={selectedPlace}
        />
      </Wrapper>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs z-10">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Categories</h4>
        <div className="space-y-1">
          {searchCenter && (
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Search Location</span>
            </div>
          )}
          {userLocation && (
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>Your Location</span>
            </div>
          )}
          {Array.from(new Set(places.flatMap(p => p.categories || []).map(c => c.name))).map(categoryName => {
            const categoryColors: Record<string, string> = {
              'Food Assistance': '#EF4444',
              'Healthcare': '#10B981',
              'Housing': '#F59E0B',
              'Legal Aid': '#8B5CF6',
              'Family Services': '#EC4899',
              'Employment': '#06B6D4',
              'Education': '#84CC16'
            };
            const color = categoryColors[categoryName] || '#6B7280';
            
            return (
              <div key={categoryName} className="flex items-center text-xs">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                <span>{categoryName}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Map Popup */}
      {selectedPlace && onClosePopup && (
        <MapPopup
          place={selectedPlace}
          onClose={onClosePopup}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}
