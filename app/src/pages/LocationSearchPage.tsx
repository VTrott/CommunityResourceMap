import { useState, useMemo } from 'react';
import { useLocationSearch } from '../hooks/useLocationSearch';
import { useKeyboardShortcuts, APP_SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import { calculateDistance } from '../services/geocoding';
import type { LocationSearchRequest, Place } from '../types';
import LocationSearch from '../components/LocationSearch';
import PlacesMap from '../components/PlacesMap';
import CommunityResourceSection from '../components/CommunityResourceSection';
import Button from '../components/ui/Button';
import { PlaceCardSkeleton, MapSkeleton } from '../components/LoadingSkeleton';

export default function LocationSearchPage() {
  const [locationRequest, setLocationRequest] = useState<LocationSearchRequest | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchCenter, setSearchCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const { data: searchResponse, isLoading, error } = useLocationSearch(locationRequest);

  // Calculate distances for places
  const placesWithDistances = useMemo(() => {
    if (!searchResponse?.content || !userLocation) {
      return searchResponse?.content || [];
    }

    return searchResponse.content.map(place => {
      if (!place.latitude || !place.longitude) {
        return place;
      }

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        place.latitude,
        place.longitude
      );

      return {
        ...place,
        distance: Math.round(distance * 10) / 10 
      };
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0)); // Sort by distance
  }, [searchResponse?.content, userLocation]);

  const handleSearch = async (searchRequest: LocationSearchRequest) => {
    try {
     
      if (searchRequest.latitude && searchRequest.longitude) {
        setSearchCenter({
          latitude: searchRequest.latitude,
          longitude: searchRequest.longitude
        });
        
        setUserLocation({
          latitude: searchRequest.latitude,
          longitude: searchRequest.longitude
        });

        setLocationRequest(searchRequest);
      } else {
        throw new Error('No coordinates provided in search request');
      }
      
      setSelectedPlace(null);
    } catch (error) {
      console.error('Error processing search:', error);
    }
  };

  const handleClear = () => {
    setLocationRequest(null);
    setUserLocation(null);
    setSearchCenter(null);
    setSelectedPlace(null);
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleClosePopup = () => {
    setSelectedPlace(null);
  };

  useKeyboardShortcuts([
    APP_SHORTCUTS.FOCUS_SEARCH,
    APP_SHORTCUTS.ESCAPE,
    {
      ...APP_SHORTCUTS.TOGGLE_VIEW,
      action: () => setViewMode(prev => prev === 'map' ? 'list' : 'map')
    }
  ]);

  const places = placesWithDistances;

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container section-padding">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Find Resources Near You
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Discover community resources within your area. Enter your address or use your current location to search instantly.
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-8">
          <LocationSearch
            onSearch={handleSearch}
            loading={isLoading && !!locationRequest}
            onClear={handleClear}
          />
        </div>

        {/* Loading State */}
        {isLoading && locationRequest && (
          <div className="space-y-6">
            {viewMode === 'map' ? (
              <MapSkeleton />
            ) : (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <PlaceCardSkeleton key={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card" style={{ 
            border: '1px solid #fca5a5', 
            background: '#fef2f2',
            padding: '1.5rem'
          }}>
            <div className="text-red-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚠️</span>
                <h3 className="font-semibold text-lg">Error searching places</h3>
              </div>
              <p className="text-red-700">{(error as Error).message}</p>
            </div>
          </div>
        )}

        {searchResponse && (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    🎯 Found {searchResponse.totalElements} places
                  </h2>
                  <p className="text-neutral-600">
                    {userLocation && `Searching within ${locationRequest?.radiusMiles || 15} miles of your location`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setViewMode('map')}
                    variant={viewMode === 'map' ? 'primary' : 'secondary'}
                    size="sm"
                    data-action="toggle-view"
                  >
                    🗺️ Map View
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    variant={viewMode === 'list' ? 'primary' : 'secondary'}
                    size="sm"
                    data-action="toggle-view"
                  >
                    📋 List View
                  </Button>
                </div>
              </div>
            </div>

            {/* Map View */}
            {viewMode === 'map' && (
              <PlacesMap
                places={places}
                userLocation={userLocation || undefined}
                searchCenter={searchCenter || undefined}
                radiusMiles={locationRequest?.radiusMiles}
                onPlaceClick={handlePlaceClick}
                selectedPlace={selectedPlace}
                onClosePopup={handleClosePopup}
              />
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {places.length === 0 ? (
                  <div className="card text-center py-16">
                    <div className="text-neutral-500">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-2">No places found</h3>
                      <p className="text-neutral-600">Try adjusting your search radius or address.</p>
                    </div>
                  </div>
                ) : (
                  places.map((place) => (
                    <div 
                      key={place.id} 
                      className={`card cursor-pointer transition-all duration-200 ${
                        selectedPlace?.id === place.id 
                          ? 'ring-2 ring-primary-500 shadow-medium' 
                          : 'hover:shadow-medium'
                      }`}
                      onClick={() => handlePlaceClick(place)}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-neutral-900">{place.name}</h3>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                place.status === 'active' 
                                  ? 'bg-accent-100 text-accent-800' 
                                  : 'bg-neutral-100 text-neutral-800'
                              }`}>
                                {place.status === 'active' ? '✅ Active' : '⏸️ Inactive'}
                              </span>
                            </div>
                            
                            {place.description && (
                              <p className="text-neutral-600 mb-4 text-lg leading-relaxed">{place.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 text-sm text-neutral-600 mb-4">
                          {place.distance !== undefined && (
                            <span className="flex items-center gap-2 font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                              <span>📍</span>
                              {place.distance} miles away
                            </span>
                          )}
                          {place.city && place.state && (
                            <span className="flex items-center gap-2 bg-neutral-50 px-3 py-1 rounded-lg">
                              <span>🏢</span>
                              {place.city}, {place.state}
                            </span>
                          )}
                          {place.phone && (
                            <span className="flex items-center gap-2 bg-accent-50 px-3 py-1 rounded-lg">
                              <span>📞</span>
                              {place.phone}
                            </span>
                          )}
                          {place.email && (
                            <span className="flex items-center gap-2 bg-secondary-50 px-3 py-1 rounded-lg">
                              <span>✉️</span>
                              {place.email}
                            </span>
                          )}
                        </div>
                        
                        {place.website && (
                          <div className="mb-4">
                            <a 
                              href={place.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                            >
                              <span>🌐</span>
                              Visit Website
                            </a>
                          </div>
                        )}
                        
                        {place.categories && place.categories.length > 0 && (
                          <div className="border-t border-neutral-200 pt-4">
                            <h4 className="text-sm font-medium text-neutral-700 mb-2">Categories:</h4>
                            <div className="flex flex-wrap gap-2">
                              {place.categories.map((category) => (
                                <span 
                                  key={category.id}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                                >
                                  {category.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Enhanced Community Resource Section */}
            <CommunityResourceSection
              places={places}
              onPlaceClick={handlePlaceClick}
              selectedPlace={selectedPlace}
              userLocation={userLocation || undefined}
            />
          </div>
        )}

      </div>
    </div>
  );
}
