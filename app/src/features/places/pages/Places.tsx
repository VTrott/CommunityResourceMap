import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Place, Category } from '../../../types';
import { api } from '../../../services/api';
import GoogleMaps from '../../../components/GoogleMaps';
import MapPopup from '../../../components/MapPopup';

const PlacesPage: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [placesData, categoriesData] = await Promise.all([
          api.getPlaces(),
          api.getCategories()
        ]);
        setPlaces(placesData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter places based on search term and selected category
  const filteredPlaces = useMemo(() => {
    let filtered = places;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(place => 
        place.categories.some(cat => cat.id === selectedCategory)
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(place => 
        place.name.toLowerCase().includes(term) ||
        place.description?.toLowerCase().includes(term) ||
        place.city.toLowerCase().includes(term) ||
        place.state.toLowerCase().includes(term) ||
        place.categories.some(cat => cat.name.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [places, selectedCategory, searchTerm]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSearchTerm('');
  }, []);

  // Calculate map center based on places
  const mapCenter = useMemo(() => {
    if (filteredPlaces.length === 0) {
      return { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco
    }
    
    const validPlaces = filteredPlaces.filter(p => p.latitude && p.longitude);
    if (validPlaces.length === 0) {
      return { lat: 37.7749, lng: -122.4194 };
    }
    
    const avgLat = validPlaces.reduce((sum, p) => sum + p.latitude, 0) / validPlaces.length;
    const avgLng = validPlaces.reduce((sum, p) => sum + p.longitude, 0) / validPlaces.length;
    
    return { lat: avgLat, lng: avgLng };
  }, [filteredPlaces]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
        <div className="spinner"></div>
        <span style={{ marginLeft: '1rem' }}>Loading places...</span>
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

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Browse All Places</h1>
      
      {/* Search and Filter Controls */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Search Input */}
            <div className="form-group">
              <label htmlFor="search" className="form-label">
                Search places
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name, description, or location..."
                className="form-input"
              />
            </div>

            {/* Category Filter */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Filter by Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="form-select"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Summary, View Toggle, and Clear Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
              Showing {filteredPlaces.length} of {places.length} places
              {(selectedCategory || searchTerm) && (
                <span>
                  (filtered by {selectedCategory ? 'category' : ''}{selectedCategory && searchTerm ? ' and ' : ''}{searchTerm ? 'search term' : ''})
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* View Toggle */}
              <div style={{ display: 'flex', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius)', padding: '0.25rem' }}>
                <button
                  onClick={() => setViewMode('list')}
                  className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '0.875rem' }}
                >
                  📋 List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '0.875rem' }}
                >
                  🗺️ Map
                </button>
              </div>
              
              {(selectedCategory || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Places Content */}
      {filteredPlaces.length > 0 ? (
        viewMode === 'map' ? (
          <div className="card">
            <div style={{ height: '24rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <GoogleMaps
                center={mapCenter}
                zoom={10}
                places={filteredPlaces}
                selectedPlace={selectedPlace}
                onPlaceSelect={setSelectedPlace}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filteredPlaces.map((place) => (
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
                  
                  {/* Location */}
                  <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    📍 {place.address}, {place.city}, {place.state} {place.zipCode}
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
        )
      ) : (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '3rem' }}>
            {searchTerm || selectedCategory ? (
              <div>
                <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>No places found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="btn btn-primary"
                >
                  Clear filters to see all places
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--gray-600)' }}>No places available at the moment.</p>
            )}
          </div>
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

export default PlacesPage;