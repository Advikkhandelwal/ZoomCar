import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { carAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewList from '../components/ReviewList';
import MapComponent from '../components/MapComponent';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { getFullImageUrl } from '../utils/urlUtils';
import './CarDetailsPage.css';

const CarDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [carBookings, setCarBookings] = useState([]);
    const [bookingDates, setBookingDates] = useState({
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchCarDetails();
    }, [id]);

    const fetchCarDetails = async () => {
        try {
            const [carData, bookingsData] = await Promise.all([
                carAPI.getCarById(id),
                bookingAPI.getCarBookings(id) // Fetch bookings for calendar
            ]);
            setCar(carData);
            setCarBookings(Array.isArray(bookingsData) ? bookingsData : []);
        } catch (error) {
            console.error('Failed to fetch car details or bookings:', error);
            // Use mock data if API fails
            setCar(getMockCarDetails(id));
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalPrice = () => {
        if (!bookingDates.startDate || !bookingDates.endDate || !car) return 0;

        const start = new Date(bookingDates.startDate);
        const end = new Date(bookingDates.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        return days > 0 ? days * car.pricePerDay : 0;
    };

    const handleBookNow = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!bookingDates.startDate || !bookingDates.endDate) {
            alert('Please select booking dates');
            return;
        }

        // Navigate to booking page with details
        navigate('/booking', {
            state: {
                car,
                startDate: bookingDates.startDate,
                endDate: bookingDates.endDate,
                totalPrice: calculateTotalPrice(),
            },
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading car details...</p>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="error-container">
                <h2>Car not found</h2>
                <button onClick={() => navigate('/browse')} className="btn btn-primary">
                    Browse Cars
                </button>
            </div>
        );
    }

    const images = car.images || [car.image];
    const totalPrice = calculateTotalPrice();
    const days = totalPrice > 0 ? Math.ceil(totalPrice / car.pricePerDay) : 0;

    return (
        <div className="car-details-page">
            <div className="container">
                {/* Header */}
                <div className="car-header">
                    <div>
                        <h1 className="car-title">
                            {car.brand} {car.model}
                        </h1>
                        <div className="car-meta">
                            <div className="car-rating">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span>{car.rating?.toFixed(1) || '4.5'}</span>
                                <span className="reviews-count">({car.reviewCount || 0} reviews)</span>
                            </div>
                            <span className="separator">•</span>
                            <div className="car-location">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {car.location}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="image-gallery">
                    <div className="main-image">
                        <img src={getFullImageUrl(images[selectedImage])} alt={`${car.brand} ${car.model}`} />
                    </div>
                    {images.length > 1 && (
                        <div className="thumbnail-grid">
                            {images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={getFullImageUrl(img)} alt={`View ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                <div className="details-grid">
                    {/* Left Column - Car Details */}
                    <div className="details-content">
                        {/* Specifications */}
                        <section className="details-section">
                            <h2 className="section-title">Specifications</h2>
                            <div className="specs-grid">
                                <div className="spec-item">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <div>
                                        <div className="spec-label">Fuel Type</div>
                                        <div className="spec-value">{car.fuelType}</div>
                                    </div>
                                </div>
                                <div className="spec-item">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                    <div>
                                        <div className="spec-label">Engine</div>
                                        <div className="spec-value">{car.engine || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="spec-item">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                        <circle cx="12" cy="12" r="3" strokeWidth="2" />
                                    </svg>
                                    <div>
                                        <div className="spec-label">Color</div>
                                        <div className="spec-value">{car.color || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="spec-item">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <div>
                                        <div className="spec-label">Brand</div>
                                        <div className="spec-value">{car.brand}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Owner Info */}
                        <section className="details-section">
                            <h2 className="section-title">Hosted by</h2>
                            <div className="owner-card">
                                <div className="owner-avatar">
                                    {car.owner?.name?.charAt(0).toUpperCase() || 'O'}
                                </div>
                                <div className="owner-info">
                                    <div className="owner-name">
                                        {car.owner?.name || 'Car Owner'}
                                        {car.owner?.isVerified && (
                                            <span className="verified-icon" title="Verified Owner">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    <div className="owner-rating">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                        <span>{car.owner?.rating?.toFixed(1) || '4.8'} rating</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Location Map */}
                        {car.latitude && car.longitude && (
                            <section className="details-section">
                                <h2 className="section-title">Location</h2>
                                <p style={{ marginBottom: '1rem', color: '#666' }}>
                                    📍 {car.location}
                                </p>
                                <MapComponent
                                    car={car}
                                    zoom={14}
                                />
                            </section>
                        )}

                        {/* Availability Calendar */}
                        <section className="details-section">
                            <h2 className="section-title">Availability</h2>
                            <AvailabilityCalendar bookings={carBookings} />
                        </section>

                        {/* Reviews */}
                        <section className="details-section">
                            <ReviewList carId={car._id || car.id} />
                        </section>
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="booking-sidebar">
                        <div className="booking-card">
                            <div className="booking-price">
                                <span className="price-amount">₹{Math.round(car.pricePerDay)}</span>
                                <span className="price-period">/ day</span>
                            </div>

                            {/* Verification Warning */}
                            {isAuthenticated && user && !user.isVerified && (
                                <div className="verification-warning">
                                    <p>Please verify your identity to book this car.</p>
                                    <Link to="/profile" className="btn btn-outline btn-sm">Verify Now</Link>
                                </div>
                            )}

                            <div className="booking-dates">
                                <div className="date-field">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={bookingDates.startDate}
                                        onChange={(e) => setBookingDates({ ...bookingDates, startDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="form-input"
                                    />
                                </div>
                                <div className="date-field">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={bookingDates.endDate}
                                        onChange={(e) => setBookingDates({ ...bookingDates, endDate: e.target.value })}
                                        min={bookingDates.startDate || new Date().toISOString().split('T')[0]}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            {totalPrice > 0 && (
                                <div className="price-breakdown">
                                    <div className="price-row">
                                        <span>₹{Math.round(car.pricePerDay)} × {days} days</span>
                                        <span>₹{totalPrice}</span>
                                    </div>
                                    <div className="price-divider"></div>
                                    <div className="price-row price-total">
                                        <span>Total</span>
                                        <span>₹{totalPrice}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleBookNow}
                                className={`btn ${(isAuthenticated && car.ownerId === user?.id) ? 'btn-secondary' : 'btn-primary'}`}
                                style={{ width: '100%' }}
                                disabled={isAuthenticated && car.ownerId === user?.id}
                            >
                                {isAuthenticated ? (
                                    car.ownerId === user?.id ? 'You Own This Car' : 'Book Now'
                                ) : 'Login to Book'}
                            </button>

                            <p className="booking-note">You won't be charged yet</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Mock data
const getMockCarDetails = (id) => ({
    _id: id,
    brand: 'Honda',
    model: 'City',
    pricePerDay: 1500,
    location: 'Mumbai, Maharashtra',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800',
    images: [
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
    ],
    rating: 4.8,
    reviewCount: 24,
    fuelType: 'Petrol',
    engine: '1.5L i-VTEC',
    color: 'Silver',
    owner: {
        name: 'Rajesh Kumar',
        rating: 4.9,
    },
});

export default CarDetailsPage;
