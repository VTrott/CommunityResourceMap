import { useState } from 'react';
import type { Place } from '../types';
import Button from './ui/Button';

interface CommunityResourceSectionProps {
  places: Place[];
  onPlaceClick?: (place: Place) => void;
  selectedPlace?: Place | null;
  userLocation?: { latitude: number; longitude: number };
}

export default function CommunityResourceSection({
  places,
  onPlaceClick,
  selectedPlace,
  userLocation: _userLocation
}: CommunityResourceSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Calculate pagination
  const totalPages = Math.ceil(places.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlaces = places.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const element = document.getElementById('community-resources');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePlaceClick = (place: Place) => {
    onPlaceClick?.(place);
  };

  if (places.length === 0) {
    return (
      <div id="community-resources" className="card text-center py-16">
        <div className="text-neutral-500">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No places found</h3>
          <p className="text-neutral-600">Try adjusting your search radius or address.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="community-resources" className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              🏘️ Community Resources
            </h2>
            <p className="text-neutral-600">
              {places.length} places found • Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>
      </div>

      {/* Places List */}
      <div className="space-y-4">
        {currentPlaces.map((place) => (
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
                    onClick={(e) => e.stopPropagation()}
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
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-neutral-600">
              Showing {startIndex + 1} to {Math.min(endIndex, places.length)} of {places.length} places
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
              >
                ← Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      variant={currentPage === pageNumber ? 'primary' : 'secondary'}
                      size="sm"
                      className="w-10 h-10 p-0"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="secondary"
                size="sm"
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
