import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { COMMUNITY_RESOURCE_SEARCHES, convertNominatimToPlace } from '../services/nominatim';
import type { NominatimPlace } from '../services/nominatim';
import { api } from '../services/api';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';

interface ImportPlacesProps {
  onClose: () => void;
}

const RESOURCE_TYPES = [
  { value: 'foodBanks', label: 'Food Banks' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'shelters', label: 'Shelters' },
  { value: 'communityCenters', label: 'Community Centers' },
  { value: 'libraries', label: 'Libraries' },
  { value: 'socialServices', label: 'Social Services' },
];

export default function ImportPlaces({ onClose }: ImportPlacesProps) {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [resourceType, setResourceType] = useState('foodBanks');
  const [searchResults, setSearchResults] = useState<NominatimPlace[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Set<number>>(new Set());
  const [isSearching, setIsSearching] = useState(false);

  const queryClient = useQueryClient();

  const createPlaceMutation = useMutation({
    mutationFn: api.createPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });

  const handleSearch = async () => {
    if (!city || !state) return;

    setIsSearching(true);
    try {
      const searchFunction = COMMUNITY_RESOURCE_SEARCHES[resourceType as keyof typeof COMMUNITY_RESOURCE_SEARCHES];
      const results = await searchFunction(city, state);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaceSelect = (placeId: number) => {
    const newSelected = new Set(selectedPlaces);
    if (newSelected.has(placeId)) {
      newSelected.delete(placeId);
    } else {
      newSelected.add(placeId);
    }
    setSelectedPlaces(newSelected);
  };

  const handleImportSelected = async () => {
    const placesToImport = searchResults
      .filter(place => selectedPlaces.has(place.place_id))
      .map(convertNominatimToPlace);

    for (const place of placesToImport) {
      try {
        await createPlaceMutation.mutateAsync(place);
      } catch (error) {
        console.error('Failed to import place:', place.name, error);
      }
    }

    setSelectedPlaces(new Set());
    setSearchResults([]);
    onClose();
  };

  const handleSelectAll = () => {
    if (selectedPlaces.size === searchResults.length) {
      setSelectedPlaces(new Set());
    } else {
      setSelectedPlaces(new Set(searchResults.map(place => place.place_id)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Import Places from OpenStreetMap</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>

        <div className="space-y-6">
          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
            />
            <Input
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Enter state"
            />
            <Select
              label="Resource Type"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              options={RESOURCE_TYPES}
            />
          </div>

          <Button 
            onClick={handleSearch} 
            loading={isSearching}
            disabled={!city || !state}
            className="w-full"
          >
            Search for {resourceType.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </Button>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Found {searchResults.length} places
                </h3>
                <div className="space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleSelectAll}
                  >
                    {selectedPlaces.size === searchResults.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button 
                    onClick={handleImportSelected}
                    disabled={selectedPlaces.size === 0}
                    loading={createPlaceMutation.isPending}
                  >
                    Import Selected ({selectedPlaces.size})
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchResults.map((place) => (
                  <div
                    key={place.place_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlaces.has(place.place_id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePlaceSelect(place.place_id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {place.name || place.display_name.split(',')[0]}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {place.display_name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {place.address?.amenity || place.class}
                          </span>
                          {place.extratags?.phone && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              📞 {place.extratags.phone}
                            </span>
                          )}
                          {place.extratags?.website && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              🌐 Website
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          checked={selectedPlaces.has(place.place_id)}
                          onChange={() => handlePlaceSelect(place.place_id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Search for community resources using OpenStreetMap data</li>
              <li>• Select the places you want to import to your database</li>
              <li>• Places will be automatically categorized and added to your map</li>
              <li>• You can edit imported places after adding them</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
