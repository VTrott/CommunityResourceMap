import GoogleMaps from './GoogleMaps';
import { isGoogleMapsConfigured, GOOGLE_MAPS_API_KEY } from '../config/maps';
import type { Place } from '../types';

interface PlacesMapProps {
  places: Place[];
  userLocation?: { latitude: number; longitude: number };
  searchCenter?: { latitude: number; longitude: number };
  radiusMiles?: number;
  onPlaceClick?: (place: Place) => void;
  selectedPlace?: Place | null;
}

export default function PlacesMap({
  places,
  userLocation,
  searchCenter,
  radiusMiles,
  onPlaceClick,
  selectedPlace
}: PlacesMapProps) {
  // Check if Google Maps is properly configured
  if (!isGoogleMapsConfigured()) {
    return (
      <div className="bg-yellow-50 rounded-lg p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-yellow-500 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-yellow-900 mb-2">Google Maps Setup Required</h3>
        <p className="text-yellow-700 mb-4">
          To view the interactive map with city details, please configure your Google Maps API key.
        </p>
        <div className="text-sm text-yellow-600 bg-yellow-100 p-3 rounded">
          <p className="font-medium">Setup Instructions:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Get a Google Maps API key from <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
            <li>Create a <code className="bg-yellow-200 px-1 rounded">.env.local</code> file in the app directory</li>
            <li>Add: <code className="bg-yellow-200 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</code></li>
            <li>Restart the development server</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <GoogleMaps
      places={places}
      userLocation={userLocation}
      radiusMiles={radiusMiles}
      onPlaceClick={onPlaceClick}
      selectedPlace={selectedPlace}
      apiKey={GOOGLE_MAPS_API_KEY}
    />
  );
}
