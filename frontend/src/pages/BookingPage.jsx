import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import { getFullImageUrl } from '../utils/urlUtils';
import './BookingPage.css';

const BookingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);

    // Get booking data from navigation state
    const { car, startDate, endDate, totalPrice } = location.state || {};

    // Redirect if owner is trying to book their own car
    if (car && user && car.ownerId === user.id) {
        navigate('/browse');
        return null;
    }

    if (!car || !startDate || !endDate) {
        return (
            <div className="booking-page">
                <div className="container">
                    <div className="error-message">
                        <h2>Invalid Booking</h2>
                        <p>Missing booking information. Please select dates on the car details page.</p>
                        <button onClick={() => navigate('/browse')} className="btn btn-primary">
                            Browse Cars
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const calculateDays = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    const days = calculateDays();

    const handleAddPhone = async () => {
        if (!phoneNumber || phoneNumber.trim() === '') {
            alert('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('phone', phoneNumber);
            if (user.name) formData.append('name', user.name);

            const updatedUser = await userAPI.updateProfile(formData);
            updateUser(updatedUser);
            setShowPhoneModal(false);

            // Proceed
            await createBooking();
        } catch (error) {
            console.error('Failed to add phone:', error);
            alert('Failed to add phone number. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const createBooking = async () => {
        setLoading(true);
        try {
            const bookingData = {
                carId: car.id || car._id,
                startDate,
                endDate,
                totalPrice,
            };

            const response = await bookingAPI.createBooking(bookingData);
            setBookingDetails(response);
            setBookingConfirmed(true);
        } catch (error) {
            console.error('Booking failed:', error);
            alert(error.message || 'Failed to create booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        // Check if user has a phone number
        if (!user?.phone) {
            setShowPhoneModal(true);
            return;
        }

        // Check verification status
        if (!user?.isVerified) {
            alert('Please verify your identity in your profile before booking.');
            navigate('/profile');
            return;
        }

        // User has phone and is verified, proceed with booking
        await createBooking();
    };

    if (bookingConfirmed && bookingDetails) {
        return (
            <div className="booking-page">
                <div className="container">
                    <div className="booking-confirmation">
                        <div className="confirmation-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="confirmation-title">Booking Confirmed!</h1>
                        <p className="confirmation-subtitle">
                            Your booking request has been submitted successfully
                        </p>

                        {/* Map View */}
                        {car.latitude && car.longitude && (
                            <div className="confirmation-map" style={{ marginBottom: '2rem' }}>
                                <h3>Pickup Location</h3>
                                <p style={{ marginBottom: '1rem', color: 'var(--color-gray-700)', fontSize: '0.9rem' }}>
                                    📍 {car.location}
                                </p>
                                <MapComponent
                                    cars={[car]}
                                    center={[car.latitude, car.longitude]}
                                    zoom={15}
                                />
                            </div>
                        )}

                        <div className="confirmation-card">
                            <div className="confirmation-status">
                                <span className={`status-badge ${bookingDetails.status || 'pending'}`}>
                                    {bookingDetails.status || 'PENDING'}
                                </span>
                            </div>

                            <div className="confirmation-details">
                                <h3>Booking Details</h3>
                                <div className="detail-row">
                                    <span className="detail-label">Booking ID:</span>
                                    <span className="detail-value">{bookingDetails._id || bookingDetails.id || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Car:</span>
                                    <span className="detail-value">{car.brand} {car.model}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Dates:</span>
                                    <span className="detail-value">
                                        {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Duration:</span>
                                    <span className="detail-value">{days} days</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Total Amount:</span>
                                    <span className="detail-value total-amount">₹{totalPrice}</span>
                                </div>
                            </div>

                            <div className="confirmation-actions">
                                <button onClick={() => navigate('/bookings')} className="btn btn-primary">
                                    View My Bookings
                                </button>
                                <button onClick={() => navigate('/')} className="btn btn-secondary">
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="container">
                <div className="booking-container">
                    <h1 className="booking-title">Complete Your Booking</h1>

                    <div className="booking-layout">
                        {/* Left: Car Details */}
                        <div className="booking-car-details">
                            <div className="car-image">
                                <img src={getFullImageUrl(car.image)} alt={`${car.brand} ${car.model}`} />
                            </div>
                            <div className="car-info">
                                <h2>{car.brand} {car.model}</h2>
                                <p className="car-location">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {car.location}
                                </p>
                            </div>
                        </div>

                        {/* Right: Booking Summary */}
                        <div className="booking-summary">
                            <h3>Booking Summary</h3>

                            <div className="summary-section">
                                <h4>Trip Details</h4>
                                <div className="summary-row">
                                    <span>Start Date</span>
                                    <span>{new Date(startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>End Date</span>
                                    <span>{new Date(endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Duration</span>
                                    <span>{days} days</span>
                                </div>
                            </div>

                            <div className="summary-section">
                                <h4>Price Breakdown</h4>
                                <div className="summary-row">
                                    <span>₹{car.pricePerDay} × {days} days</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row summary-total">
                                    <span>Total</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmBooking}
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}
                            >
                                {loading ? 'Processing...' : 'Confirm Booking'}
                            </button>
                            <p className="booking-note">You won't be charged yet</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phone Number Modal */}
            {showPhoneModal && (
                <div className="modal-overlay" onClick={() => setShowPhoneModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Add Phone Number</h2>
                        <p>You need to add a phone number to book a car. This allows the car owner to contact you.</p>

                        <div className="form-group">
                            <label htmlFor="phone" className="form-label">Phone Number *</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="form-input"
                                placeholder="+91 98765 43210"
                                autoFocus
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={() => setShowPhoneModal(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddPhone}
                                className="btn btn-primary"
                                disabled={loading} // 3. Disable button in Phone Number Modal when loading
                            >
                                {loading ? 'Adding...' : 'Add Phone Number'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingPage;
