import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './index.css';

// Simple loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="spinner"></div>
  </div>
);

// Lazy load pages
const SearchPage = React.lazy(() => import('./features/search/pages/SearchPage'));
const PlacesPage = React.lazy(() => import('./features/places/pages/Places'));

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="container">
            <div className="flex justify-between items-center" style={{ height: '4rem' }}>
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>
                  Community Resource Map
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="nav">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/search" className="nav-link">Search</Link>
                <Link to="/places" className="nav-link">Places</Link>
              </nav>

              {/* Mobile menu button */}
              <button
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
              <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/search" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Search</Link>
              <Link to="/places" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Places</Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/places" element={<PlacesPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--gray-900)' }}>
          Find Community Resources Near You
        </h1>
        <p className="text-xl mb-8" style={{ color: 'var(--gray-600)', maxWidth: '48rem', margin: '0 auto 2rem' }}>
          Discover food banks, shelters, healthcare services, and other community resources in your area. 
          Get involved with local events and volunteer opportunities.
        </p>
        
        <div className="flex flex-col gap-4" style={{ alignItems: 'center' }}>
          <Link to="/search" className="btn btn-primary btn-lg">
            Start Searching
          </Link>
          <Link to="/places" className="btn btn-secondary btn-lg">
            Browse Places
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-3 gap-8">
        <div className="card animate-fade-in">
          <div className="card-body text-center">
            <div className="flex items-center justify-center mb-4" style={{ 
              width: '4rem', 
              height: '4rem', 
              backgroundColor: 'var(--primary-100)', 
              borderRadius: '50%',
              margin: '0 auto'
            }}>
              <svg width="32" height="32" fill="none" stroke="var(--primary-600)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Location-Based Search</h3>
            <p style={{ color: 'var(--gray-600)' }}>Find resources near your current location or any address you specify.</p>
          </div>
        </div>

        <div className="card animate-fade-in">
          <div className="card-body text-center">
            <div className="flex items-center justify-center mb-4" style={{ 
              width: '4rem', 
              height: '4rem', 
              backgroundColor: 'var(--success-100)', 
              borderRadius: '50%',
              margin: '0 auto'
            }}>
              <svg width="32" height="32" fill="none" stroke="var(--success-600)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Verified Resources</h3>
            <p style={{ color: 'var(--gray-600)' }}>All resources are verified and regularly updated to ensure accuracy.</p>
          </div>
        </div>

        <div className="card animate-fade-in">
          <div className="card-body text-center">
            <div className="flex items-center justify-center mb-4" style={{ 
              width: '4rem', 
              height: '4rem', 
              backgroundColor: 'var(--accent-100)', 
              borderRadius: '50%',
              margin: '0 auto'
            }}>
              <svg width="32" height="32" fill="none" stroke="var(--accent-600)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Community Events</h3>
            <p style={{ color: 'var(--gray-600)' }}>Stay connected with local events and volunteer opportunities.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;