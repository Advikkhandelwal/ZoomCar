import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { carAPI } from '../services/api';
import MapComponent from '../components/MapComponent';
import './BrowseCarsPage.css';

const BrowseCarsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        location: searchParams.get('location') || '',
        startDate: searchParams.get('startDate') || '',
        endDate: searchParams.get('endDate') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        fuelType: searchParams.get('fuelType') || '',
        transmission: searchParams.get('transmission') || '',
        seats: searchParams.get('seats') || '',
        sortBy: searchParams.get('sortBy') || '',
    });

    useEffect(() => {
        fetchCars();
    }, [searchParams]);

    const fetchCars = async () => {
        setLoading(true);
        try {
            // Remove empty filters
            const queryFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );

            const response = await carAPI.getAllCars(queryFilters);
            setCars(Array.isArray(response) ? response : response.cars || []);
        } catch (error) {
            console.error('Failed to fetch cars:', error);
            setCars([]); // Clear cars on error
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value,
        });
    };

    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        setSearchParams(params);
    };

    const handleClearFilters = () => {
        const initialFilters = {
            location: '',
            startDate: '',
            endDate: '',
            minPrice: '',
            maxPrice: '',
            fuelType: '',
            transmission: '',
            seats: '',
            sortBy: '',
        };
        setFilters(initialFilters);
        setSearchParams({});
    };

    return (
        <div className="browse-page">
            <div className="container-wide">
                <div className="browse-layout">
                    {/* Filters Sidebar */}
                    <aside className="filters-sidebar">
                        <div className="filters-header">
                            <h3>Filters</h3>
                            <button onClick={handleClearFilters} className="filters-clear">
                                Clear all
                            </button>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={filters.location}
                                onChange={handleFilterChange}
                                placeholder="Enter city or area"
                                className="form-input"
                            />
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Dates</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className="form-input"
                                    placeholder="Start Date"
                                />
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className="form-input"
                                    placeholder="End Date"
                                />
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Price Range (per day)</label>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    name="minPrice"
                                    value={filters.minPrice}
                                    onChange={handleFilterChange}
                                    placeholder="Min"
                                    className="form-input"
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                    placeholder="Max"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Fuel Type</label>
                            <select
                                name="fuelType"
                                value={filters.fuelType}
                                onChange={handleFilterChange}
                                className="form-select"
                            >
                                <option value="">All</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Transmission</label>
                            <select
                                name="transmission"
                                value={filters.transmission}
                                onChange={handleFilterChange}
                                className="form-select"
                            >
                                <option value="">All</option>
                                <option value="Manual">Manual</option>
                                <option value="Automatic">Automatic</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Min Seats</label>
                            <select
                                name="seats"
                                value={filters.seats}
                                onChange={handleFilterChange}
                                className="form-select"
                            >
                                <option value="">Any</option>
                                <option value="2">2+</option>
                                <option value="4">4+</option>
                                <option value="5">5+</option>
                                <option value="7">7+</option>
                            </select>
                        </div>

                        <button onClick={handleApplyFilters} className="btn btn-primary" style={{ width: '100%' }}>
                            Apply Filters
                        </button>
                    </aside>

                    {/* Cars Grid */}
                    <main className="browse-content">
                        <div className="browse-header">
                            <div>
                                <h1 className="browse-title">Available Cars</h1>
                                <p className="browse-count">
                                    {loading ? 'Loading...' : `${cars.length} cars available`}
                                </p>
                            </div>

                            <div className="sort-container">
                                <select
                                    name="sortBy"
                                    value={filters.sortBy}
                                    onChange={(e) => {
                                        const newFilters = { ...filters, sortBy: e.target.value };
                                        setFilters(newFilters);
                                    }}
                                    className="form-select"
                                    style={{ width: '200px' }}
                                >
                                    <option value="">Sort By: Newest</option>
                                    <option value="priceAsc">Price: Low to High</option>
                                    <option value="priceDesc">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                            </div>
                        </div>

                        {/* Map View */}
                        {!loading && cars.length > 0 && (
                            <MapComponent cars={cars} />
                        )}

                        {loading ? (
                            <div className="cars-grid">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="skeleton-card"></div>
                                ))}
                            </div>
                        ) : cars.length > 0 ? (
                            <div className="cars-grid">
                                {cars.map((car) => (
                                    <CarCard key={car.id || car._id} car={car} />
                                ))}
                            </div>
                        ) : (
                            <div className="no-results">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                                    <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <h3>No cars found</h3>
                                <p>Try adjusting your filters to find what you're looking for.</p>
                                <button onClick={handleClearFilters} className="btn btn-primary">
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default BrowseCarsPage;
