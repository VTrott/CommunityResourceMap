import React from 'react';
import type { Place } from '../types';

interface MapPopupProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
}

const MapPopup: React.FC<MapPopupProps> = ({ place, isOpen, onClose }) => {
  if (!isOpen || !place) return null;

  return (
    <div 
      className="flex items-center justify-center"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 50,
        padding: '1rem'
      }}
    >
      <div 
        className="card"
        style={{
          maxWidth: '28rem',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div className="card-body">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold" style={{ paddingRight: '1rem' }}>{place.name}</h3>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ 
                padding: '0.5rem',
                minWidth: 'auto',
                flexShrink: 0
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Description */}
          {place.description && (
            <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>{place.description}</p>
          )}

          {/* Address */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-700)', marginBottom: '0.25rem' }}>Address</h4>
            <p style={{ color: 'var(--gray-600)' }}>
              {place.address}, {place.city}, {place.state} {place.zipCode}
            </p>
          </div>

          {/* Contact Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {place.phone && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-700)', marginBottom: '0.25rem' }}>Phone</h4>
                <a 
                  href={`tel:${place.phone}`}
                  style={{ color: 'var(--primary-600)', textDecoration: 'none' }}
                >
                  {place.phone}
                </a>
              </div>
            )}

            {place.email && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-700)', marginBottom: '0.25rem' }}>Email</h4>
                <a 
                  href={`mailto:${place.email}`}
                  style={{ color: 'var(--primary-600)', textDecoration: 'none' }}
                >
                  {place.email}
                </a>
              </div>
            )}

            {place.website && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-700)', marginBottom: '0.25rem' }}>Website</h4>
                <a 
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary-600)', textDecoration: 'none', wordBreak: 'break-all' }}
                >
                  {place.website}
                </a>
              </div>
            )}
          </div>

          {/* Categories */}
          {place.categories && place.categories.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Categories</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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
            </div>
          )}

          {/* Status and Close Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
            <span className={`badge ${
              place.status === 'active' 
                ? 'badge-success' 
                : place.status === 'inactive'
                ? 'badge-error'
                : 'badge-warning'
            }`} style={{ fontSize: '0.75rem' }}>
              {place.status}
            </span>
            
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPopup;