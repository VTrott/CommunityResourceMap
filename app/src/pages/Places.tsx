import { useState } from 'react';
import { PlaceSearchRequest, CreatePlaceRequest } from '../types';
import { usePlaces, useCreatePlace, useDeletePlace } from '../hooks/usePlaces';
import SearchForm from '../components/forms/SearchForm';
import PlaceForm from '../components/forms/PlaceForm';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function PlacesPage() {
  const [searchParams, setSearchParams] = useState<PlaceSearchRequest>({
    page: 0,
    size: 10,
    sortBy: 'name',
    sortDirection: 'asc',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Search places
  const { data: searchResponse, isLoading, error } = usePlaces(searchParams);

  // Create place mutation
  const createPlaceMutation = useCreatePlace();

  // Delete place mutation
  const deletePlaceMutation = useDeletePlace();

  const onSearch = (values: PlaceSearchRequest) => {
    setSearchParams(values);
  };

  const onAddPlace = (values: CreatePlaceRequest) => {
    createPlaceMutation.mutate(values, {
      onSuccess: () => {
        setShowAddForm(false);
      },
    });
  };

  const onDeletePlace = (id: string) => {
    if (confirm('Are you sure you want to delete this place?')) {
      deletePlaceMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Resources</h1>
          <p className="mt-2 text-gray-600">Find and manage community resources in your area</p>
        </div>
        
        {/* Search Form */}
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Search Places</h2>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? 'secondary' : 'primary'}
            >
              {showAddForm ? 'Cancel Add' : 'Add Place'}
            </Button>
          </div>
          <SearchForm
            onSubmit={onSearch}
            onClear={() => setSearchParams({ page: 0, size: 10, sortBy: 'name', sortDirection: 'asc' })}
            loading={isLoading}
          />
        </Card>

        {/* Add Place Form */}
        {showAddForm && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Place</h2>
            <PlaceForm
              onSubmit={onAddPlace}
              onCancel={() => setShowAddForm(false)}
              loading={createPlaceMutation.isPending}
            />
          </Card>
        )}

        {/* Results */}
        {isLoading && (
          <Card className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading places...</p>
          </Card>
        )}
        
        {error && (
          <Card className="border-red-200 bg-red-50">
            <div className="text-red-800">
              <h3 className="font-semibold">Error loading places</h3>
              <p className="mt-1">{(error as Error).message}</p>
            </div>
          </Card>
        )}
        
        {searchResponse && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Results ({searchResponse.totalElements} places)
              </h2>
              <div className="text-sm text-gray-500">
                Page {searchResponse.page + 1} of {searchResponse.totalPages}
              </div>
            </div>
            
            {searchResponse.content.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No places found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                {searchResponse.content.map((place) => (
                  <Card key={place.id} className="hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{place.name}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            place.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {place.status}
                          </span>
                        </div>
                        
                        {place.description && (
                          <p className="text-gray-600 mb-3">{place.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                          {place.city && place.state && (
                            <span className="flex items-center gap-1">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {place.city}, {place.state}
                            </span>
                          )}
                          {place.phone && (
                            <span className="flex items-center gap-1">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {place.phone}
                            </span>
                          )}
                          {place.email && (
                            <span className="flex items-center gap-1">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {place.email}
                            </span>
                          )}
                        </div>
                        
                        {place.website && (
                          <a 
                            href={place.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Visit Website
                          </a>
                        )}
                        
                        {place.categories && place.categories.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {place.categories.map((category) => (
                                <span 
                                  key={category.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {category.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <Button 
                          onClick={() => onDeletePlace(place.id)}
                          variant="danger"
                          size="sm"
                          loading={deletePlaceMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
