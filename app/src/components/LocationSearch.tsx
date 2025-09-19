import { useState } from 'react';
import { geocodeAddress, RADIUS_OPTIONS, type GeocodingResult } from '../services/geocoding';
import { useCategories } from '../hooks/useCategories';
import type { LocationSearchRequest } from '../types';
import Button from './ui/Button';

interface LocationSearchProps {
  onSearch: (searchRequest: LocationSearchRequest) => void;
  loading?: boolean;
  onClear?: () => void;
}

export default function LocationSearch({ onSearch, loading = false, onClear }: LocationSearchProps) {
  const [address, setAddress] = useState('');
  const [radiusMiles, setRadiusMiles] = useState(15);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [geocodedLocation, setGeocodedLocation] = useState<GeocodingResult | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const handleGeocode = async () => {
    if (!address.trim()) {
      setGeocodingError('Please enter an address');
      return;
    }

    setIsGeocoding(true);
    setGeocodingError(null);
    setGeocodedLocation(null);

    try {
      const result = await geocodeAddress(address);
      setGeocodedLocation(result);
    } catch (error) {
      setGeocodingError(error instanceof Error ? error.message : 'Failed to geocode address');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setGeocodingError('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    setGeocodingError(null);
    setGeocodedLocation(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      
      const result = await geocodeAddress(`${latitude}, ${longitude}`);
      setGeocodedLocation(result);
      setAddress(result.formattedAddress);
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeocodingError('Location access denied. Please enter your address manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeocodingError('Location information unavailable. Please enter your address manually.');
            break;
          case error.TIMEOUT:
            setGeocodingError('Location request timed out. Please enter your address manually.');
            break;
          default:
            setGeocodingError('Unable to get your location. Please enter your address manually.');
        }
      } else {
        setGeocodingError('Failed to get your location. Please enter your address manually.');
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSearch = () => {
    if (!geocodedLocation) {
      setGeocodingError('Please geocode an address first');
      return;
    }

    onSearch({
      address,
      radiusMiles,
      categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
    });
  };

  const handleClear = () => {
    setAddress('');
    setRadiusMiles(15);
    setSelectedCategoryIds([]);
    setGeocodingError(null);
    setGeocodedLocation(null);
    setIsGettingLocation(false);
    onClear?.();
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="card p-8">
      <div className="space-y-6">
        {/* Address Input */}
        <div>
          <label htmlFor="address" className="block text-lg font-semibold text-neutral-700 mb-3">
            🏠 Enter your address
          </label>
          <div className="flex gap-3">
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 Main St, City, State"
              className="input flex-1"
              disabled={loading || isGeocoding || isGettingLocation}
            />
            <Button
              onClick={handleGeocode}
              loading={isGeocoding}
              disabled={!address.trim() || loading || isGettingLocation}
              variant="secondary"
            >
              🔍 Find Location
            </Button>
            <Button
              onClick={handleUseCurrentLocation}
              loading={isGettingLocation}
              disabled={loading || isGeocoding}
              variant="secondary"
              title="Use your current location"
            >
              📍 Current
            </Button>
          </div>
          {geocodingError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              {geocodingError}
            </p>
          )}
          {geocodedLocation && (
            <p className="mt-2 text-sm text-accent-600 flex items-center gap-1">
              <span>✅</span>
              Found: {geocodedLocation.formattedAddress}
            </p>
          )}
        </div>

        {/* Radius Selection */}
        <div>
          <label className="block text-lg font-semibold text-neutral-700 mb-3">
            📏 Search radius
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setRadiusMiles(option.value)}
                className={`px-4 py-3 text-sm font-medium rounded-xl border transition-all duration-200 ${
                  radiusMiles === option.value
                    ? 'bg-primary-600 text-white border-primary-600 shadow-soft'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50 hover:shadow-soft'
                }`}
                disabled={loading}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-lg font-semibold text-neutral-700 mb-3">
            🏷️ Filter by category (optional)
          </label>
          {categoriesLoading ? (
            <p className="text-neutral-500">Loading categories...</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${
                    selectedCategoryIds.includes(category.id)
                      ? 'bg-primary-100 text-primary-800 border-primary-300 shadow-soft'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50 hover:shadow-soft'
                  }`}
                  disabled={loading}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
          {selectedCategoryIds.length > 0 && (
            <p className="mt-2 text-sm text-neutral-600">
              {selectedCategoryIds.length} categor{selectedCategoryIds.length === 1 ? 'y' : 'ies'} selected
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral-200">
          <Button
            onClick={handleSearch}
            loading={loading}
            disabled={!geocodedLocation}
            className="flex-1 btn-lg"
          >
            🔍 Search Nearby Places
          </Button>
          <Button
            onClick={handleClear}
            variant="secondary"
            disabled={loading}
            className="flex-1 sm:flex-none btn-lg"
          >
            🗑️ Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}
