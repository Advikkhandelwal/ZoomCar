import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages - Lazy loaded for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const BrowseCarsPage = lazy(() => import('./pages/BrowseCarsPage'));
const CarDetailsPage = lazy(() => import('./pages/CarDetailsPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const BookingHistoryPage = lazy(() => import('./pages/BookingHistoryPage'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const AddCarPage = lazy(() => import('./pages/AddCarPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const WriteReviewPage = lazy(() => import('./pages/WriteReviewPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<div className="loading-fallback">Loading page...</div>}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/browse" element={<BrowseCarsPage />} />
                <Route path="/cars/:id" element={<CarDetailsPage />} />

                {/* Protected Routes */}
                <Route
                  path="/booking"
                  element={
                    <ProtectedRoute>
                      <BookingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <BookingHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/edit"
                  element={
                    <ProtectedRoute>
                      <EditProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/review/:bookingId"
                  element={
                    <ProtectedRoute>
                      <WriteReviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-car"
                  element={
                    <ProtectedRoute>
                      <AddCarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/become-host"
                  element={
                    <ProtectedRoute>
                      <AddCarPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Simple 404 component
const NotFound = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
    <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
    <p style={{ color: 'var(--color-gray-700)', marginBottom: '2rem' }}>
      The page you're looking for doesn't exist.
    </p>
    <a href="/" className="btn btn-primary">
      Go Home
    </a>
  </div>
);

export default App;
