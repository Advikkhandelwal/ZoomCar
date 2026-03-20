import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, tripAPI } from '../services/api';
import MapComponent from '../components/MapComponent';
import { getFullImageUrl } from '../utils/urlUtils';
import './BookingHistoryPage.css';

const BookingHistoryPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled, completed

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await bookingAPI.getUserBookings();
            const bookingsData = Array.isArray(response) ? response : response.bookings || [];
            console.log('📞 Bookings data received:', bookingsData);
            console.log('📞 First booking structure:', bookingsData[0]);
            setBookings(bookingsData);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            // Mock data for demo
            setBookings(getMockBookings());
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await bookingAPI.cancelBooking(bookingId);
            // Update local state
            setBookings(bookings.map(b =>
                (b.id || b._id) === bookingId ? { ...b, status: 'cancelled' } : b
            ));
        } catch (error) {
            alert('Failed to cancel booking');
        }
    };

    const filteredBookings = filter === 'all'
        ? bookings
        : filter === 'confirmed' 
            ? bookings.filter(b => b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'approved' || b.status === 'CONFIRMED' || b.status === 'APPROVED')
            : bookings.filter(b => b.status?.toLowerCase() === filter || b.status === filter.toUpperCase());

    return (
        <div className="booking-history-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Bookings</h1>
                    <p className="page-subtitle">View and manage your car rental bookings</p>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({bookings.length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({bookings.filter(b => b.status?.toLowerCase() === 'pending' || b.status === 'PENDING').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
                        onClick={() => setFilter('confirmed')}
                    >
                        Confirmed ({bookings.filter(b => b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'approved' || b.status === 'CONFIRMED' || b.status === 'APPROVED').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed ({bookings.filter(b => b.status?.toLowerCase() === 'completed' || b.status === 'COMPLETED').length})
                    </button>
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div className="loading-state">Loading bookings...</div>
                ) : filteredBookings.length === 0 ? (
                    <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3>No bookings found</h3>
                        <p>You haven't made any bookings yet</p>
                        <Link to="/browse" className="btn btn-primary">
                            Browse Cars
                        </Link>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {filteredBookings.map(booking => (
                            <div key={booking.id || booking._id} className="booking-card">
                                <div className="booking-car-image">
                                    <img
                                        src={getFullImageUrl(booking.car?.image)}
                                        alt={`${booking.car?.brand} ${booking.car?.model}`}
                                    />
                                </div>

                                <div className="booking-details">
                                    <div className="booking-header">
                                        <div>
                                            <h3>{booking.car?.brand} {booking.car?.model}</h3>
                                            <p className="booking-location">{booking.car?.location}</p>
                                        </div>
                                        <span className={`status-badge ${booking.status}`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="booking-info">
                                        <div className="info-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                                                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                                                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                                            </svg>
                                            <span>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                                        </div>

                                        <div className="info-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                                <polyline points="12 6 12 12 16 14" strokeWidth="2" />
                                            </svg>
                                            <span>{calculateDays(booking.startDate, booking.endDate)} days</span>
                                        </div>

                                        <div className="info-item">
                                            <span className="price">₹{booking.totalPrice || (calculateDays(booking.startDate, booking.endDate) * (booking.car?.pricePerDay || 0))}</span>
                                        </div>
                                    </div>

                                    {/* Location Map */}
                                    {booking.car?.latitude && booking.car?.longitude && (
                                        <div className="booking-map" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                            <MapComponent
                                                cars={[booking.car]}
                                                center={[booking.car.latitude, booking.car.longitude]}
                                                zoom={12}
                                            />
                                        </div>
                                    )}

                                    {/* Debug: Check what we have */}
                                    {console.log(`Booking ${booking.id}: status=${booking.status}, hasOwner=${!!booking.car?.owner}, hasPhone=${!!booking.car?.owner?.phone}`)}

                                    {['APPROVED', 'ACTIVE', 'COMPLETED'].includes(booking.status) && booking.car?.owner?.phone && (
                                        <div className="contact-info">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span>Owner Phone: {booking.car.owner.phone}</span>
                                        </div>
                                    )}
                                    {/* Handle case where owner nested differently or just in confirmed logic above */}

                                    <div className="booking-actions">
                                        <Link to={`/cars/${booking.car?.id || booking.car?._id}`} className="btn btn-secondary btn-sm">
                                            View Car
                                        </Link>

                                        {booking.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleCancelBooking(booking.id || booking._id)}
                                                className="btn btn-outline btn-sm"
                                            >
                                                Cancel Booking
                                            </button>
                                        )}

                                        {booking.status === 'COMPLETED' && !booking.reviewed && (
                                            <Link
                                                to={`/review/${booking.id || booking._id}`}
                                                className="btn btn-primary btn-sm"
                                            >
                                                Write Review
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
};

// Mock data
const getMockBookings = () => [
    {
        _id: '1',
        car: {
            _id: '1',
            brand: 'Honda',
            model: 'City',
            location: 'Mumbai, Maharashtra',
            image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400',
        },
        startDate: '2026-01-10',
        endDate: '2026-01-15',
        totalPrice: 7500,
        status: 'confirmed',
        owner: {
            phone: '+91 98765 43210',
        },
    },
    {
        _id: '2',
        car: {
            _id: '2',
            brand: 'Hyundai',
            model: 'Creta',
            location: 'Delhi, NCR',
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
        },
        startDate: '2026-01-20',
        endDate: '2026-01-25',
        totalPrice: 10000,
        status: 'pending',
    },
];

export default BookingHistoryPage;
