import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MobileNav from './components/MobileNav';
import ErrorBoundary from './components/ErrorBoundary';

const HealthPage = lazy(() => import('./pages/Health'));
const PlacesPage = lazy(() => import('./pages/Places'));
const LocationSearchPage = lazy(() => import('./pages/LocationSearchPage'));

export default function App() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Find Resources' },
    { path: '/places', label: 'Browse All' },
    { path: '/submit', label: 'Submit' },
    { path: '/admin', label: 'Admin' },
    { path: '/health', label: 'Health' },
  ];

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh' }}>
        <nav style={{ 
          background: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(16px)', 
          boxShadow: 'var(--shadow-soft)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)', 
          position: 'sticky', 
          top: 0, 
          zIndex: 50 
        }}>
          <div className="container">
            <div className="flex justify-between items-center" style={{ height: '70px' }}>
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gradient">
                  CommunityConnect
                </h1>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link ${
                      location.pathname === item.path ? 'nav-link-active' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <MobileNav navItems={navItems} />
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Suspense fallback={
            <div style={{ minHeight: '100vh' }} className="flex items-center justify-center">
              <div className="text-center">
                <div style={{
                  animation: 'spin 1s linear infinite',
                  borderRadius: '50%',
                  height: '48px',
                  width: '48px',
                  border: '4px solid var(--primary-200)',
                  borderTopColor: 'var(--primary-600)',
                  margin: '0 auto 1.5rem'
                }}></div>
                <p className="text-neutral-600 text-lg">Loading...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={
                <div style={{ minHeight: '100vh', overflow: 'hidden' }} className="flex items-center justify-center relative">
                  {/* Background decoration */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, var(--primary-50) 0%, #ffffff 50%, var(--secondary-50) 100%)'
                  }}></div>
                  <div className="animate-float" style={{
                    position: 'absolute',
                    top: '80px',
                    left: '40px',
                    width: '288px',
                    height: '288px',
                    background: 'rgba(186, 230, 253, 0.3)',
                    borderRadius: '50%',
                    filter: 'blur(48px)'
                  }}></div>
                  <div className="animate-float-delayed" style={{
                    position: 'absolute',
                    bottom: '80px',
                    right: '40px',
                    width: '384px',
                    height: '384px',
                    background: 'rgba(245, 208, 254, 0.3)',
                    borderRadius: '50%',
                    filter: 'blur(48px)'
                  }}></div>
                  
                  <div className="text-center relative" style={{ zIndex: 10, maxWidth: '1024px', margin: '0 auto', padding: '0 1rem' }}>
                    <h1 className="text-6xl font-bold text-gradient mb-6 animate-fade-in" style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)' }}>
                      Welcome to CommunityConnect
                    </h1>
                    <p className="text-xl text-neutral-600 mb-12 animate-fade-in" style={{ 
                      animationDelay: '0.2s',
                      fontSize: 'clamp(1.125rem, 3vw, 1.5rem)'
                    }}>
                      Find and share community resources in your area
                    </p>
                    <div className="flex flex-col gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                      <Link 
                        to="/search" 
                        className="btn btn-primary btn-lg"
                        style={{ 
                          boxShadow: 'var(--shadow-glow)',
                          minWidth: '280px',
                          alignSelf: 'center'
                        }}
                      >
                        🔍 Find Resources Near Me
                      </Link>
                      <Link 
                        to="/places" 
                        className="btn btn-secondary btn-lg"
                        style={{ 
                          minWidth: '280px',
                          alignSelf: 'center'
                        }}
                      >
                        📍 Browse All Places
                      </Link>
                    </div>
                  </div>
                </div>
              } />
              <Route path="/search" element={<LocationSearchPage />} />
              <Route path="/places" element={<PlacesPage />} />
              <Route path="/submit" element={
                <div className="section-padding">
                  <div className="container">
                    <div className="card text-center" style={{ maxWidth: '512px', margin: '0 auto', padding: '3rem' }}>
                      <h1 className="text-4xl font-bold text-gradient mb-6">Submit a Resource</h1>
                      <p className="text-xl text-neutral-600 mb-8">Help your community by adding new resources</p>
                      <div className="flex items-center justify-center px-6 py-3" style={{ 
                        background: 'var(--accent-100)', 
                        color: 'var(--accent-700)', 
                        borderRadius: '12px', 
                        fontWeight: '500',
                        display: 'inline-flex'
                      }}>
                        🚧 Coming Soon
                      </div>
                    </div>
                  </div>
                </div>
              } />
              <Route path="/admin" element={
                <div className="section-padding">
                  <div className="container">
                    <div className="card text-center" style={{ maxWidth: '512px', margin: '0 auto', padding: '3rem' }}>
                      <h1 className="text-4xl font-bold text-gradient mb-6">Admin Panel</h1>
                      <p className="text-xl text-neutral-600 mb-8">Manage resources and community data</p>
                      <div className="flex items-center justify-center px-6 py-3" style={{ 
                        background: 'var(--accent-100)', 
                        color: 'var(--accent-700)', 
                        borderRadius: '12px', 
                        fontWeight: '500',
                        display: 'inline-flex'
                      }}>
                        🚧 Coming Soon
                      </div>
                    </div>
                  </div>
                </div>
              } />
              <Route path="/health" element={<HealthPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
}
