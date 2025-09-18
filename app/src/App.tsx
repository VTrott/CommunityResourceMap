import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HealthPage from './pages/Health';
import PlacesPage from './pages/Places';
import LocationSearchPage from './pages/LocationSearchPage';

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Community Resource Map</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.path
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Community Resource Map</h1>
                <p className="text-xl text-gray-600 mb-8">Find and share community resources in your area</p>
                <div className="space-x-4">
                  <Link 
                    to="/search" 
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Find Resources Near Me
                  </Link>
                  <Link 
                    to="/places" 
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Browse All Places
                  </Link>
                </div>
              </div>
            </div>
          } />
          <Route path="/search" element={<LocationSearchPage />} />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/submit" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Submit a Resource</h1>
                <p className="text-gray-600">Coming soon...</p>
              </div>
            </div>
          } />
          <Route path="/admin" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel</h1>
                <p className="text-gray-600">Coming soon...</p>
              </div>
            </div>
          } />
          <Route path="/health" element={<HealthPage />} />
        </Routes>
      </main>
    </div>
  );
}
