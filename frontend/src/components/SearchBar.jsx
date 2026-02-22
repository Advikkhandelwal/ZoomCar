import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ onSearch, compact = false }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        location: '',
        startDate: '',
        endDate: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (onSearch) {
            onSearch(formData);
        } else {
            // Navigate to browse page with search params
            const params = new URLSearchParams();
            if (formData.location) params.append('location', formData.location);
            if (formData.startDate) params.append('startDate', formData.startDate);
            if (formData.endDate) params.append('endDate', formData.endDate);

            navigate(`/browse?${params.toString()}`);
        }
    };

    return (
        <form className={`search-bar ${compact ? 'search-bar-compact' : ''}`} onSubmit={handleSubmit}>
            <div className="search-bar-field">
                <label htmlFor="location" className="search-bar-label">
                    Location
                </label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Where do you need a car?"
                    value={formData.location}
                    onChange={handleChange}
                    className="search-bar-input"
                />
            </div>

            <div className="search-bar-divider"></div>

            <div className="search-bar-field">
                <label htmlFor="startDate" className="search-bar-label">
                    Start Date
                </label>
                <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="search-bar-input"
                />
            </div>

            <div className="search-bar-divider"></div>

            <div className="search-bar-field">
                <label htmlFor="endDate" className="search-bar-label">
                    End Date
                </label>
                <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="search-bar-input"
                />
            </div>

            <button type="submit" className="search-bar-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Search</span>
            </button>
        </form>
    );
};

export default SearchBar;
