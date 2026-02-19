import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { useAuth } from '../context/AuthContext';
import './BrowseCarsPage.css'; // Re-use styles

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/favorites`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setFavorites(data);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchFavorites();
        }
    }, [token]);

    if (loading) return <div className="loading-spinner">Loading favorites...</div>;

    return (
        <div className="browse-cars-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Favorites</h1>
                    <p>Your personal wishlist of cars</p>
                </div>

                {favorites.length === 0 ? (
                    <div className="no-results">
                        <h3>No favorites yet</h3>
                        <p>Browse our collection and save cars you like!</p>
                        <Link to="/cars" className="btn btn-primary">Browse Cars</Link>
                    </div>
                ) : (
                    <div className="cars-grid">
                        {favorites.map(car => (
                            <CarCard key={car.id} car={car} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
