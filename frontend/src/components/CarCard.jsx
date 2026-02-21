import { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CarCard.css';
import { getFullImageUrl } from '../utils/urlUtils';

const CarCard = memo(({ car }) => {
    const {
        id,
        _id,
        brand,
        model,
        pricePerDay,
        location,
        image,
        averageRating = 0,
        reviewCount = 0,
        fuelType,
        transmission,
        seats,
    } = car;

    const carId = id || _id;
    // useAuth coming from AuthContext
    const { isAuthenticated, token } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const checkFavorite = async () => {
            if (!isAuthenticated || !token) return;
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/favorites/check/${carId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsFavorite(data.isFavorite);
                }
            } catch (error) {
                console.error("Error checking favorite:", error);
            }
        };
        checkFavorite();
    }, [carId, isAuthenticated, token]);

    const toggleFavorite = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return;

        const newState = !isFavorite;
        setIsFavorite(newState);
        // sending request to backend for updating

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_BASE_URL}/favorites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ carId })
            });

            if (!response.ok) {
                setIsFavorite(!newState);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            setIsFavorite(!newState);
        }
    };

    return (
        <Link to={`/cars/${carId}`} className="car-card">
            <div className="car-card-image-wrapper">
                <img
                    src={getFullImageUrl(image)}
                    alt={`${brand} ${model}`}
                    className="car-card-image"
                    loading="lazy"
                />
                <div className="car-card-badge">{fuelType}</div>

                {isAuthenticated && (
                    <button
                        className={`car-card-favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={toggleFavorite}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {/* d = drawing instructions for heart to make as favourite. */}
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                )}
            </div>

            <div className="car-card-content">
                <div className="car-card-header">
                    <h3 className="car-card-title">
                        {brand} {model}
                    </h3>
                    <div className="car-card-rating">
                    {/* Star Icon */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{averageRating?.toFixed(1) || '0.0'}</span>
                        {reviewCount > 0 && (
                            <span className="car-card-reviews">({reviewCount})</span>
                        )}
                        {car.owner?.isVerified && (
                            <div className="verified-badge" title="Verified Owner">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                <div className="car-card-specs">
                    <span className="spec-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                        {transmission || 'Manual'}
                    </span>
                    <span className="spec-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21h10" /><path d="M12 21V13" /><path d="M21 21v-7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v7" /></svg>
                        {seats || 5} Seats
                    </span>
                </div>

                <p className="car-card-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {location}
                </p>

                <div className="car-card-footer">
                    <div className="car-card-price">
                        <span className="car-card-price-amount">₹{Math.round(pricePerDay)}</span>
                        <span className="car-card-price-period">/ day</span>
                    </div>
                </div>
            </div>
        </Link>
    );
});

export default CarCard;
