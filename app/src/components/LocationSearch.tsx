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
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [radiusMiles, setRadiusMiles] = useState(10);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [geocodedLocation, setGeocodedLocation] = useState<GeocodingResult | null>(null);


  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const handleGeocode = async () => {
    if (!streetAddress.trim() || !city.trim() || !state.trim()) {
      setGeocodingError('Please enter street address, city, and state');
      return;
    }

    setIsGeocoding(true);
    setGeocodingError(null);
    setGeocodedLocation(null);

    try {
      // Construct full address from separate fields
      const fullAddress = `${streetAddress}, ${city}, ${state}${zipCode ? `, ${zipCode}` : ''}`;
      const result = await geocodeAddress(fullAddress);
      setGeocodedLocation(result);
      
      onSearch({
        address: fullAddress,
        radiusMiles,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        city,
        state,
        latitude: result.latitude,
        longitude: result.longitude,
      });
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
      
      const addressParts = result.formattedAddress.split(',');
      let newStreetAddress = streetAddress;
      let newCity = city;
      let newState = state;
      let newZipCode = zipCode;
      
      if (addressParts.length >= 3) {
        newStreetAddress = addressParts[0].trim();
        newCity = addressParts[1].trim();
        const stateZipPart = addressParts[2].trim();
        const stateZipMatch = stateZipPart.match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
        if (stateZipMatch) {
          newState = stateZipMatch[1];
          newZipCode = stateZipMatch[2];
        } else {
          newState = stateZipPart;
        }
        
        
        setStreetAddress(newStreetAddress);
        setCity(newCity);
        setState(newState);
        setZipCode(newZipCode);
      }
      

      const fullAddress = `${newStreetAddress}, ${newCity}, ${newState}${newZipCode ? `, ${newZipCode}` : ''}`;
      onSearch({
        address: fullAddress,
        radiusMiles,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        city: newCity,
        state: newState,
        latitude: result.latitude,
        longitude: result.longitude,
      });
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


  const handleClear = () => {
    setStreetAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setRadiusMiles(10);
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header with Clear Filters Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <label style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
            Enter your address
          </label>
          <Button
            onClick={handleClear}
            variant="secondary"
            disabled={isGeocoding || isGettingLocation}
            size="sm"
          >
            🗑️ Clear Filters
          </Button>
        </div>

        {/* Address Input */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="streetAddress" className="block text-sm font-medium text-neutral-700 mb-2">
                Street Address
              </label>
              <input
                id="streetAddress"
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="e.g., 123 Main St"
                className="input w-full"
                disabled={loading || isGeocoding || isGettingLocation}
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2">
                City
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Springfield"
                className="input w-full"
                disabled={loading || isGeocoding || isGettingLocation}
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-neutral-700 mb-2">
                State
              </label>
              <input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g., IL"
                className="input w-full"
                disabled={loading || isGeocoding || isGettingLocation}
                maxLength={2}
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-neutral-700 mb-2">
                Zip Code
              </label>
              <input
                id="zipCode"
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g., 62701"
                className="input w-full"
                disabled={loading || isGeocoding || isGettingLocation}
                maxLength={10}
              />
            </div>
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

        {/* Category Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <label style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
              Filter Categories
            </label>
            {selectedCategoryIds.length > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.25rem 0.75rem', 
                backgroundColor: 'var(--accent-50)', 
                borderRadius: '9999px',
                border: '1px solid var(--accent-200)'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--accent-700)' }}>
                  {selectedCategoryIds.length} selected
                </span>
              </div>
            )}
          </div>
          
          {categoriesLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid var(--primary-500)',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ fontSize: '0.875rem', color: '#737373' }}>Loading categories...</span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                {categories.map((category) => (
                  <label
                    key={category.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #e5e5e5',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: selectedCategoryIds.includes(category.id) 
                        ? 'var(--accent-50)' 
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      borderColor: selectedCategoryIds.includes(category.id) 
                        ? 'var(--accent-200)' 
                        : '#e5e5e5'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedCategoryIds.includes(category.id)) {
                        const target = e.target as HTMLLabelElement;
                        target.style.backgroundColor = 'var(--primary-50)';
                        target.style.borderColor = 'var(--primary-300)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedCategoryIds.includes(category.id)) {
                        const target = e.target as HTMLLabelElement;
                        target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                        target.style.borderColor = '#e5e5e5';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      disabled={loading}
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                      <div style={{
                        flexShrink: 0,
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: '2px solid',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '0.75rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: selectedCategoryIds.includes(category.id) 
                          ? 'var(--accent-500)' 
                          : 'white',
                        borderColor: selectedCategoryIds.includes(category.id) 
                          ? 'var(--accent-500)' 
                          : '#d4d4d4',
                        color: selectedCategoryIds.includes(category.id) ? 'white' : 'transparent'
                      }}>
                        {selectedCategoryIds.includes(category.id) && (
                          <svg style={{ width: '12px', height: '12px' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: selectedCategoryIds.includes(category.id) 
                          ? 'var(--accent-800)' 
                          : '#374151'
                      }}>
                        {category.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              
              {selectedCategoryIds.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <p style={{ fontSize: '0.875rem', color: '#737373' }}>Select categories to filter results (optional)</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Radius Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <label style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
              Search Radius
            </label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.25rem 0.75rem', 
              backgroundColor: 'var(--primary-50)', 
              borderRadius: '9999px',
              border: '1px solid var(--primary-200)'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--primary-700)' }}>Selected:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary-600)' }}>{radiusMiles} miles</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setRadiusMiles(option.value)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '9999px',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  ...(radiusMiles === option.value
                    ? {
                        background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                        color: 'white',
                        boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.2)'
                      }
                    : {
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        color: '#374151',
                        border: '1px solid #e5e5e5'
                      })
                }}
                onMouseEnter={(e) => {
                  if (loading) return;
                  if (radiusMiles !== option.value) {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = 'var(--primary-50)';
                    target.style.borderColor = 'var(--primary-300)';
                    target.style.color = 'var(--primary-700)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (loading) return;
                  if (radiusMiles !== option.value) {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                    target.style.borderColor = '#e5e5e5';
                    target.style.color = '#374151';
                  }
                }}
                disabled={loading}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral-200 justify-center">
          <Button
            onClick={handleGeocode}
            disabled={!streetAddress.trim() || !city.trim() || !state.trim() || isGettingLocation || isGeocoding}
            variant="primary"
            className="sm:w-auto btn-lg"
          >
            {isGeocoding ? 'Finding Location...' : '🔍 Search by Address'}
          </Button>
          <Button
            onClick={handleUseCurrentLocation}
            disabled={isGeocoding || isGettingLocation}
            variant="primary"
            title="Use your current location and search for resources"
            className="sm:w-auto btn-lg"
          >
            {isGettingLocation ? 'Getting Location...' : '📍 Search by Location'}
          </Button>
        </div>
      </div>
    </div>
  );
}
