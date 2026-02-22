import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CarCard from '../components/CarCard';
import { carAPI } from '../services/api';
import './LandingPage.css';

const LandingPage = () => {
    const [featuredCars, setFeaturedCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedCars = async () => {
            try {
                const response = await carAPI.getAllCars({ limit: 8 });
                setFeaturedCars(Array.isArray(response) ? response : response.cars || []);
            } catch (error) {
                console.error('Failed to fetch featured cars:', error);
                setFeaturedCars([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedCars();
    }, []);

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Rent cars from people <br /> near you</h1>
                    <p className="hero-subtitle">
                        The premium peer-to-peer car sharing marketplace. Find the perfect car for your next adventure.
                    </p>

                    <div className="hero-search-container">
                        <SearchBar />
                    </div>
                </div>
            </section>

            {/* Featured Cars Section */}
            <section className="featured-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured Cars</h2>
                        <Link to="/browse" className="section-link">
                            Browse all
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="loading-grid">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="skeleton-card"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="cars-grid">
                            {featuredCars.map((car) => (
                                <CarCard key={car.id || car._id} car={car} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-grid">
                        <div className="cta-card">
                            <div className="cta-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="cta-title">Rent a Car</h3>
                            <p className="cta-description">
                                Browse thousands of cars available for rent in your area. Book instantly and hit the road.
                            </p>
                            <Link to="/browse" className="btn btn-primary">
                                Find a Car
                            </Link>
                        </div>

                        <div className="cta-card cta-card-highlight">
                            <div className="cta-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="cta-title">List Your Car</h3>
                            <p className="cta-description">
                                Turn your car into a money-making machine. List it for free and start earning today.
                            </p>
                            <Link to="/add-car" className="btn btn-primary">
                                Start Hosting
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title text-center">Truly peer-to-peer</h2>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h4 className="feature-title">Verified Users</h4>
                            <p className="feature-description">
                                Every host and guest is verified to ensure a safe community for everyone.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrapper" style={{ background: 'linear-gradient(135deg, #FF385C 0%, #E31C5F 100%)', boxShadow: '0 10px 20px rgba(255, 56, 92, 0.3)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="feature-title">Fair Pricing</h4>
                            <p className="feature-description">
                                Set your own rates or find the best deals directly from owners.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrapper" style={{ background: 'linear-gradient(135deg, #00A699 0%, #007A8A 100%)', boxShadow: '0 10px 20px rgba(0, 166, 153, 0.3)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h4 className="feature-title">Instant Booking</h4>
                            <p className="feature-description">
                                Skip the paperwork. Book your perfect car in just a few taps.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};


export default LandingPage;
