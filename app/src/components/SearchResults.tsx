import React, { useState, useMemo } from 'react';
import type { Place, PlaceSearchResponse } from '../types';
import GoogleMaps from './GoogleMaps';
import MapPopup from './MapPopup';

interface SearchResultsProps {
  results: PlaceSearchResponse | null;
  loading: boolean;
  error: string | null;
  searchLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  radiusMiles?: number;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  error,
  searchLocation,
  radiusMiles = 10
}) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [sortBy, setSortBy] = useState<'name' | 'distance'>('name');

  const sortedPlaces = useMemo(() => {
    if (!results?.places || !Array.isArray(results.places)) return [];
    
    const places = [...results.places];
    
    if (sortBy === 'name') {
      return places.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'distance' && searchLocation) {
      return places.sort((a, b) => {
        const distanceA = calculateDistance(
          searchLocation.latitude,
          searchLocation.longitude,
          a.latitude,
          a.longitude
        );
        const distanceB = calculateDistance(
          searchLocation.latitude,
          searchLocation.longitude,
          b.latitude,
          b.longitude
        );
        return distanceA - distanceB;
      });
    }
    
    return places;
  }, [results?.places, sortBy, searchLocation]);

  const mapCenter = searchLocation 
    ? { lat: searchLocation.latitude, lng: searchLocation.longitude }
    : { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco

  const mapZoom = searchLocation ? 12 : 8;

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner"></div>
            <span style={{ marginLeft: '1rem' }}>Loading results...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  if (!results || !results.places || results.places.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h3 className="text-lg font-semibold mb-2">No resources found</h3>
          <p style={{ color: 'var(--gray-600)' }}>Try adjusting your search criteria or expanding your search radius.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Results Header */}
      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Found {results.totalElements || results.places.length} resource{(results.totalElements || results.places.length) !== 1 ? 's' : ''}
              </h2>
              {searchLocation && (
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  Searching within {radiusMiles} miles of {searchLocation.address}
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* View Toggle */}
              <div style={{ display: 'flex', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius)', padding: '0.25rem' }}>
                <button
                  onClick={() => setViewMode('map')}
                  className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '0.875rem' }}
                >
                  🗺️ Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '0.875rem' }}
                >
                  📋 List
                </button>
              </div>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'distance')}
                className="form-select"
                style={{ width: '100%' }}
              >
                <option value="name">Sort by Name</option>
                <option value="distance">Sort by Distance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      {viewMode === 'map' ? (
        <div className="card">
          <div style={{ height: '24rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <GoogleMaps
              center={mapCenter}
              zoom={mapZoom}
              places={sortedPlaces}
              selectedPlace={selectedPlace}
              onPlaceSelect={setSelectedPlace}
              searchLocation={searchLocation ? {
                lat: searchLocation.latitude,
                lng: searchLocation.longitude,
                address: searchLocation.address
              } : undefined}
              radiusMiles={radiusMiles}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {sortedPlaces.map((place) => (
            <div
              key={place.id}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedPlace(place)}
            >
              <div className="card-body">
                <h3 className="text-lg font-semibold mb-2">{place.name}</h3>
                {place.description && (
                  <p style={{ color: 'var(--gray-600)', marginBottom: '0.75rem' }}>{place.description}</p>
                )}
                
                {/* Distance */}
                {searchLocation && (
                  <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    📍 {calculateDistance(
                      searchLocation.latitude,
                      searchLocation.longitude,
                      place.latitude,
                      place.longitude
                    ).toFixed(1)} miles away
                  </div>
                )}
                
                {/* Address */}
                <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  {place.address}, {place.city}, {place.state} {place.zipCode}
                </div>
                
                {/* Contact Information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  {place.phone && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      📞 {place.phone}
                    </div>
                  )}
                  {place.email && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      ✉️ {place.email}
                    </div>
                  )}
                  {place.website && (
                    <div style={{ fontSize: '0.875rem' }}>
                      🌐 <a 
                        href={place.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary-600)', textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Categories */}
                {place.categories && place.categories.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {place.categories.map((category) => (
                      <span
                        key={category.id}
                        className="badge badge-primary"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Status */}
                <div className={`badge ${
                  place.status === 'active' 
                    ? 'badge-success' 
                    : place.status === 'inactive'
                    ? 'badge-error'
                    : 'badge-warning'
                }`} style={{ fontSize: '0.75rem' }}>
                  {place.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map Popup */}
      <MapPopup
        place={selectedPlace}
        isOpen={!!selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
    </div>
  );
};

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default SearchResults;