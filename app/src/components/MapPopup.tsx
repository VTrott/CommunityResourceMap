import type { Place } from '../types';

interface MapPopupProps {
  place: Place;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number };
}

export default function MapPopup({ place, onClose }: MapPopupProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{place.name}</h3>
              
              <div className="mb-1">
                <p className="text-sm text-neutral-600 mb-1">Community resource found via Google Places</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  place.status === 'active' 
                    ? 'bg-accent-100 text-accent-800' 
                    : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {place.status === 'active' ? '✅ Active' : '⏸️ Inactive'}
                </span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Close popup"
            >
              <svg className="w-6 h-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 pt-2 space-y-1 flex-1">
          {/* Distance */}
          {place.distance !== undefined && (
            <div className="flex items-center gap-2 font-medium text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
              <span className="text-xl">📍</span>
              <span className="text-lg">{place.distance} miles away</span>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-1">
            {place.addressLine1 && (
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">🏢</span>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">{place.addressLine1}</p>
                  {place.addressLine2 && (
                    <p className="text-neutral-600 text-sm">{place.addressLine2}</p>
                  )}
                  {(place.city || place.state || place.postalCode) && (
                    <p className="text-neutral-600 text-sm">
                      {[place.city, place.state, place.postalCode].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {place.phone && (
              <div className="flex items-center gap-2">
                <span className="text-lg">📞</span>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">Phone</p>
                  <a 
                    href={`tel:${place.phone}`}
                    className="text-accent-600 hover:text-accent-700 transition-colors text-sm"
                  >
                    {place.phone}
                  </a>
                </div>
              </div>
            )}

            {place.email && (
              <div className="flex items-center gap-2">
                <span className="text-lg">✉️</span>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">Email</p>
                  <a 
                    href={`mailto:${place.email}`}
                    className="text-secondary-600 hover:text-secondary-700 transition-colors text-sm"
                  >
                    {place.email}
                  </a>
                </div>
              </div>
            )}

            {place.website && (
              <div className="flex items-center gap-2">
                <span className="text-lg">🌐</span>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">Website</p>
                  <a 
                    href={place.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Categories */}
          {place.categories && place.categories.length > 0 && (
            <div className="border-t border-neutral-200 pt-2">
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Categories</h4>
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
    </div>
  );
}
