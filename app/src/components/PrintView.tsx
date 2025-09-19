import { type Place } from '../types';
import Button from './ui/Button';

interface PrintViewProps {
  places: Place[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  radiusMiles?: number;
}

export default function PrintView(_props: PrintViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print:hidden mb-4">
      <Button onClick={handlePrint} variant="secondary" size="sm">
        🖨️ Print List
      </Button>
    </div>
  );
}

// Print-specific styles and layout
export function PrintLayout({ places, userLocation, radiusMiles }: PrintViewProps) {
  return (
    <div className="hidden print:block print:max-w-none print:p-0">
      <div className="print:mb-4">
        <h1 className="print:text-2xl print:font-bold print:mb-2">
          Community Resources
        </h1>
        {userLocation && (
          <p className="print:text-sm print:text-gray-600">
            Resources within {radiusMiles} miles of your location
          </p>
        )}
        <p className="print:text-sm print:text-gray-500 print:mb-4">
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
      </div>

      <div className="print:space-y-3">
        {places.map((place, index) => (
          <div key={place.id} className="print:border-b print:border-gray-200 print:pb-3 print:mb-3">
            <div className="print:flex print:justify-between print:items-start print:mb-2">
              <h3 className="print:text-lg print:font-semibold print:text-gray-900">
                {index + 1}. {place.name}
              </h3>
              {place.distance !== undefined && (
                <span className="print:text-sm print:font-medium print:text-blue-600">
                  {place.distance} miles
                </span>
              )}
            </div>
            
            {place.description && (
              <p className="print:text-sm print:text-gray-600 print:mb-2">
                {place.description}
              </p>
            )}
            
            <div className="print:grid print:grid-cols-2 print:gap-2 print:text-xs print:text-gray-500">
              {place.addressLine1 && (
                <div>
                  <strong>Address:</strong> {place.addressLine1}
                  {place.addressLine2 && `, ${place.addressLine2}`}
                  {place.city && place.state && `, ${place.city}, ${place.state}`}
                  {place.postalCode && ` ${place.postalCode}`}
                </div>
              )}
              
              {place.phone && (
                <div>
                  <strong>Phone:</strong> {place.phone}
                </div>
              )}
              
              {place.email && (
                <div>
                  <strong>Email:</strong> {place.email}
                </div>
              )}
              
              {place.website && (
                <div>
                  <strong>Website:</strong> {place.website}
                </div>
              )}
              
              {place.categories && place.categories.length > 0 && (
                <div className="print:col-span-2">
                  <strong>Categories:</strong> {place.categories.map(c => c.name).join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {places.length === 0 && (
        <div className="print:text-center print:py-8 print:text-gray-500">
          No resources found
        </div>
      )}
    </div>
  );
}
