import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { carAPI, bookingAPI } from '../services/api';
import { getFullImageUrl } from '../utils/urlUtils';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
    // Tabs: pending (requests), active (upcoming/ongoing), history (completed/cancelled), earnings
    const [activeTab, setActiveTab] = useState('active'); // Default to active rentals
    const [myCars, setMyCars] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'cars') {
                const response = await carAPI.getOwnerCars();
                const carsData = Array.isArray(response) ? response : response.cars || [];
                console.log('🚗 Owner cars data received:', carsData);
                console.log('🚗 Number of cars:', carsData.length);
                console.log('🚗 First car:', carsData[0]);
                setMyCars(carsData);
            } else if (['pending', 'active', 'history', 'earnings'].includes(activeTab)) {
                const response = await bookingAPI.getOwnerBookings();
                const bookingsData = Array.isArray(response) ? response : response.bookings || [];
                console.log('👤 Owner bookings data received:', bookingsData);
                console.log('👤 First booking structure:', bookingsData[0]);
                setBookings(bookingsData);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setBookings([]);
            setMyCars([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCar = async (carId) => {
        if (!confirm('Are you sure you want to delete this car?')) return;

        try {
            await carAPI.deleteCar(carId);
            setMyCars(myCars.filter(car => (car.id || car._id) !== carId));
        } catch (error) {
            alert('Failed to delete car');
        }
    };

    const handleBookingAction = async (bookingId, status) => {
        try {
            // carAPI.updateBookingStatus handles strict checks on backend
            const updatedBooking = await carAPI.updateBookingStatus(bookingId, status);

            // Update local state
            setBookings(bookings.map(b =>
                (b.id || b._id) === bookingId ? updatedBooking : b
            ));

            alert(`Booking marked as ${status.toLowerCase()} successfully`);
        } catch (error) {
            console.error('Failed to update booking:', error);
            alert(error.message || 'Failed to update booking status');
        }
    };

    const calculateEarnings = () => {
        return bookings
            .filter(b => b.status === 'COMPLETED')
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    };

    const filterBookingsByTab = () => {
        const sortedBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        switch (activeTab) {
            case 'pending':
                return sortedBookings.filter(b => b.status === 'PENDING');
            case 'active':
                return sortedBookings.filter(b => ['APPROVED', 'ACTIVE'].includes(b.status));
            case 'history':
                return sortedBookings.filter(b => ['COMPLETED', 'CANCELLED'].includes(b.status));
            case 'earnings':
                return sortedBookings; // Used for calcs
            default:
                return [];
        }
    };

    const filteredBookings = filterBookingsByTab();

    return (
        <div className="owner-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1>Owner Dashboard</h1>
                    <Link to="/add-car" className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Car
                    </Link>
                </div>

                {/* Tabs */}
                <div className="dashboard-tabs">
                    <button
                        className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active & Upcoming
                    </button>
                    <button
                        className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Requests
                        {bookings.filter(b => b.status === 'PENDING').length > 0 && (
                            <span className="badge">{bookings.filter(b => b.status === 'PENDING').length}</span>
                        )}
                    </button>
                    <button
                        className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </button>
                    <button
                        className={`tab ${activeTab === 'cars' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cars')}
                    >
                        My Cars
                    </button>
                    <button
                        className={`tab ${activeTab === 'earnings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('earnings')}
                    >
                        Earnings
                    </button>
                </div>

                {/* Tab Content */}
                <div className="dashboard-content">
                    {loading ? (
                        <div className="loading-state">Loading...</div>
                    ) : activeTab === 'cars' ? (
                        <div className="cars-list">
                            {myCars.length === 0 ? (
                                <div className="empty-state">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <h3>No cars listed yet</h3>
                                    <p>Start earning by listing your first car</p>
                                    <Link to="/add-car" className="btn btn-primary">
                                        Add Your First Car
                                    </Link>
                                </div>
                            ) : (
                                myCars.map(car => (
                                    <div key={car.id || car._id} className="car-item">
                                        <img
                                            src={getFullImageUrl(car.image)}
                                            alt={`${car.brand} ${car.model}`}
                                            className="car-item-image"
                                        />
                                        <div className="car-item-details">
                                            <h3>{car.brand} {car.model}</h3>
                                            <p className="car-item-location">{car.location}</p>
                                            <p className="car-item-price">₹{car.pricePerDay}/day</p>
                                        </div>
                                        <div className="car-item-actions">
                                            <Link to={`/edit-car/${car.id || car._id}`} className="btn btn-secondary btn-sm">
                                                Edit
                                            </Link>
                                            <button onClick={() => handleDeleteCar(car.id || car._id)} className="btn btn-outline btn-sm">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : activeTab === 'earnings' ? (
                        <div className="earnings-view">
                            <div className="earnings-card">
                                <h3>Total Earnings</h3>
                                <p className="earnings-amount">₹{calculateEarnings()}</p>
                            </div>
                            <div className="earnings-stats">
                                <div className="stat-card">
                                    <div className="stat-value">{bookings.filter(b => b.status === 'COMPLETED').length}</div>
                                    <div className="stat-label">Completed Trips</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{bookings.filter(b => b.status === 'ACTIVE').length}</div>
                                    <div className="stat-label">Active Trips</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{bookings.filter(b => b.status === 'PENDING').length}</div>
                                    <div className="stat-label">Pending Requests</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bookings-list">
                            {filteredBookings.length === 0 ? (
                                <div className="empty-state">
                                    <h3>No bookings found</h3>
                                    <p>No bookings in this category.</p>
                                </div>
                            ) : (
                                filteredBookings.map(booking => (
                                    <div key={booking.id || booking._id} className="booking-item">
                                        <div className="booking-info">
                                            <h4>{booking.car?.brand} {booking.car?.model}</h4>

                                            <div className="renter-info">
                                                <p><strong>Renter:</strong> {booking.user?.name || booking.renter?.name}</p>
                                                {booking.user?.email && (
                                                    <p className="renter-email">{booking.user.email}</p>
                                                )}
                                                {booking.user?.phone && (
                                                    <p className="renter-phone">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        {booking.user.phone}
                                                    </p>
                                                )}
                                            </div>

                                            <p className="booking-dates">
                                                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                                <span className="booking-days">({Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} days)</span>
                                            </p>
                                        </div>
                                        <div className="booking-status">
                                            <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                                            <p className="booking-price">₹{booking.totalPrice}</p>

                                            <div className="booking-actions">
                                                {booking.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleBookingAction(booking.id || booking._id, 'APPROVED')}
                                                            className="btn btn-success btn-sm"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleBookingAction(booking.id || booking._id, 'CANCELLED')}
                                                            className="btn btn-danger btn-sm"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {booking.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleBookingAction(booking.id || booking._id, 'ACTIVE')}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        Start Trip
                                                    </button>
                                                )}

                                                {booking.status === 'ACTIVE' && (
                                                    <button
                                                        onClick={() => handleBookingAction(booking.id || booking._id, 'COMPLETED')}
                                                        className="btn btn-success btn-sm"
                                                    >
                                                        Complete Trip
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Mock data
const getMockCars = () => [
    {
        _id: '1',
        brand: 'Honda',
        model: 'City',
        pricePerDay: 1500,
        location: 'Mumbai, Maharashtra',
        image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400',
    },
];

const getMockBookings = () => [
    {
        _id: '1',
        car: { brand: 'Honda', model: 'City' },
        renter: { name: 'John Doe' },
        startDate: '2026-01-10',
        endDate: '2026-01-15',
        status: 'confirmed',
        totalPrice: 7500,
    },
];

export default OwnerDashboard;
