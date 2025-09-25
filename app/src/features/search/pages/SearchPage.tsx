import React, { useState, useCallback, useEffect } from 'react';
import type { PlaceSearchRequest, PlaceSearchResponse, Category } from '../../../types';
import { api } from '../../../services/api';
import SearchForm from '../../../components/SearchForm';
import SearchResults from '../../../components/SearchResults';

const SearchPage: React.FC = () => {
  const [results, setResults] = useState<PlaceSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchLocation, setSearchLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('Loading categories...');
        const cats = await api.getCategories();
        console.log('Categories loaded:', cats);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories. Please refresh the page.');
      }
    };
    loadCategories();
  }, []);

  const handleSearch = useCallback(async (searchData: {
    searchQuery: string;
    location: string;
    latitude: number;
    longitude: number;
    radius: number;
    categoryIds?: string[];
  }) => {
    console.log('Search data received:', searchData);
    setLoading(true);
    setError(null);

    try {
      const searchRequest: PlaceSearchRequest = {
        latitude: searchData.latitude,
        longitude: searchData.longitude,
        radiusMiles: searchData.radius,
        categoryIds: searchData.categoryIds
      };

      console.log('Search request:', searchRequest);
      console.log('API base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api');

      let response: PlaceSearchResponse;
      
      // Use the appropriate API endpoint based on radius
      switch (searchData.radius) {
        case 5:
          console.log('Calling 5-mile search...');
          response = await api.searchPlaces5Miles(searchRequest);
          break;
        case 10:
          console.log('Calling 10-mile search...');
          response = await api.searchPlaces10Miles(searchRequest);
          break;
        case 25:
          console.log('Calling 25-mile search...');
          response = await api.searchPlaces25Miles(searchRequest);
          break;
        case 50:
          console.log('Calling 50-mile search...');
          response = await api.searchPlaces50Miles(searchRequest);
          break;
        default:
          console.log('Calling custom radius search...');
          response = await api.searchPlacesWithRadius(searchData.radius, searchRequest);
      }

      console.log('Search response:', response);
      setResults(response);
      setSearchLocation({
        latitude: searchData.latitude,
        longitude: searchData.longitude,
        address: searchData.location
      });
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to search for places. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Find Community Resources</h1>
      
      
      {/* Search Form */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchForm
          onSearch={handleSearch}
          categories={categories}
          loading={loading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Search Results */}
      <SearchResults
        results={results}
        loading={loading}
        error={error}
        searchLocation={searchLocation || undefined}
        radiusMiles={searchLocation ? 10 : undefined}
      />

      {!results && !loading && !error && (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 className="text-lg font-semibold mb-2">Ready to find resources?</h3>
            <p style={{ color: 'var(--gray-600)' }}>Enter a search term and location above to discover community resources near you.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;