import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, carAPI, bookingAPI, verificationAPI } from '../services/api';
import { getFullImageUrl } from '../utils/urlUtils';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [myCars, setMyCars] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const data = await userAPI.getProfile();
            setProfile(data);
            setAadhaarNumber(data.aadhaarNumber || '');
            setDrivingLicenseNumber(data.drivingLicenseNumber || '');
            
            // Fetch my cars and bookings
            const [carsData, bookingsData] = await Promise.all([
                carAPI.getOwnerCars(),
                bookingAPI.getUserBookings(),
            ]);

            setMyCars(carsData.cars || []);
            setBookings(bookingsData.bookings || []);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setProfile(user);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySubmit = async () => {
        if (!aadhaarNumber || !drivingLicenseNumber) {
            alert('Please provide both Aadhaar and Driving License numbers');
            return;
        }

        setIsVerifying(true);
        try {
            await verificationAPI.uploadDocs({ 
                aadhaarNumber, 
                drivingLicenseNumber 
            });
            
            // Sync with global Auth state so other pages know user is verified
            if (updateUser) {
                updateUser({ isVerified: true });
            }
            
            await fetchProfileData();
            alert('Identity verified successfully!');
        } catch (err) {
            console.error('Verification failed:', err);
            alert('Verification failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="loading-state">Loading profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-container">
                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="profile-avatar-large">
                            {profile?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="profile-info">
                            <h1>{profile?.name}</h1>
                            <p className="profile-email">{profile?.email}</p>
                            <div className="profile-meta">
                                <span className="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Joined {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                        <Link to="/profile/edit" className="btn btn-secondary">
                            Edit Profile
                        </Link>
                    </div>

                    {/* Verification Status */}
                    <div className="profile-section verification-section">
                        <div className="section-header">
                            <h2>Identity Verification</h2>
                            <span className={`verification-badge ${profile?.isVerified ? 'verified' : (profile?.aadhaarNumber ? 'pending' : 'unverified')}`}>
                                {profile?.isVerified ? 'Verified' : (profile?.aadhaarNumber ? 'Pending Review' : 'Unverified')}
                            </span>
                        </div>

                        {!profile?.isVerified ? (
                            <div className="verification-content">
                                <p className="verification-hint">
                                    To book cars, you must verify your identity and driving license.
                                </p>
                                <div className="verification-form">
                                    <div className="form-group">
                                        <label>Aadhaar Card Number</label>
                                        <input
                                            type="text"
                                            placeholder="Enter 12-digit Aadhaar number"
                                            value={aadhaarNumber}
                                            onChange={(e) => setAadhaarNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Driving License Number</label>
                                        <input
                                            type="text"
                                            placeholder="Enter DL number"
                                            value={drivingLicenseNumber}
                                            onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    style={{ marginTop: 'var(--spacing-md)' }}
                                    onClick={handleVerifySubmit}
                                    disabled={isVerifying}
                                >
                                    {isVerifying ? 'Verifying...' : 'Verify Now'}
                                </button>
                            </div>
                        ) : (
                            <div className="verification-success">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M9 11l3 3L22 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Your identity has been verified. You can now book cars!</span>
                            </div>
                        )}
                    </div>

                    {/* Contact Information */}
                    <div className="profile-section">
                        <h2>Contact Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Email</label>
                                <p>{profile?.email}</p>
                            </div>
                            <div className="info-item">
                                <label>Phone</label>
                                <p className="phone-privacy">
                                    {profile?.phone || 'Not provided'}
                                    <span className="privacy-badge">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2" />
                                        </svg>
                                        Private (shown only after booking confirmation)
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* My Cars */}
                    {myCars.length > 0 && (
                        <div className="profile-section">
                            <div className="section-header">
                                <h2>My Listed Cars</h2>
                                <Link to="/dashboard" className="section-link">
                                    Manage Cars
                                </Link>
                            </div>
                            <div className="cars-grid-small">
                                {myCars.slice(0, 3).map(car => (
                                    <Link key={car._id} to={`/cars/${car._id}`} className="car-card-small">
                                        <img src={getFullImageUrl(car.image)} alt={`${car.brand} ${car.model}`} />
                                        <div className="car-card-info">
                                            <h4>{car.brand} {car.model}</h4>
                                            <p>₹{car.pricePerDay}/day</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Booking History */}
                    <div className="profile-section">
                        <div className="section-header">
                            <h2>Recent Bookings</h2>
                            <Link to="/bookings" className="section-link">
                                View All
                            </Link>
                        </div>
                        {bookings.length === 0 ? (
                            <p className="empty-message">No bookings yet</p>
                        ) : (
                            <div className="bookings-list-small">
                                {bookings.slice(0, 3).map(booking => (
                                    <div key={booking._id} className="booking-item-small">
                                        <div className="booking-car">
                                            <img src={getFullImageUrl(booking.car?.image)} alt={`${booking.car?.brand} ${booking.car?.model}`} />
                                            <div>
                                                <h4>{booking.car?.brand} {booking.car?.model}</h4>
                                                <p>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`status-badge ${booking.status}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="profile-stats">
                        <div className="stat-card">
                            <div className="stat-value">{bookings.length}</div>
                            <div className="stat-label">Total Bookings</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{myCars.length}</div>
                            <div className="stat-label">Listed Cars</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{bookings.filter(b => b.status === 'completed').length}</div>
                            <div className="stat-label">Completed Trips</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
