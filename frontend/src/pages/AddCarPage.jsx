import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import './AddCarPage.css';

const AddCarPage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        engine: '',
        fuelType: '',
        color: '',
        pricePerDay: '',
        location: '',
        latitude: '',
        longitude: '',
        transmission: 'Manual',
        seats: '5',
    });
    const [imageFile, setImageFile] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleMapClick = (lat, lng) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6)
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleAddPhone = async () => {
        if (!phoneNumber || phoneNumber.trim() === '') {
            alert('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('phone', phoneNumber);
            formData.append('name', user.name);

            const updatedUser = await userAPI.updateProfile(formData);
            updateUser(updatedUser);
            setShowPhoneModal(false);

            // Automatically submit the form after phone is added
            await submitCarListing();
        } catch (error) {
            console.error('Failed to add phone:', error);
            alert('Failed to add phone number. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const submitCarListing = async () => {
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            if (imageFile) {
                data.append('image', imageFile);
            }

            await carAPI.createCar(data);
            alert('Car added successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to add car:', error);
            alert(`Failed to add car: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if user has a phone number
        if (!user?.phone) {
            setShowPhoneModal(true);
            return;
        }

        // User has phone, proceed with submission
        await submitCarListing();
    };

    return (
        <div className="add-car-page">
            <div className="container">
                <div className="add-car-container">
                    <h1 className="page-title">List Your Car</h1>
                    <p className="page-subtitle">Fill in the details to start earning from your car</p>

                    <form onSubmit={handleSubmit} className="add-car-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="brand" className="form-label">
                                    Brand *
                                </label>
                                <input
                                    type="text"
                                    id="brand"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., Honda, Toyota"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="model" className="form-label">
                                    Model *
                                </label>
                                <input
                                    type="text"
                                    id="model"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., City, Fortuner"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="engine" className="form-label">
                                    Engine
                                </label>
                                <input
                                    type="text"
                                    id="engine"
                                    name="engine"
                                    value={formData.engine}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., 1.5L i-VTEC"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="fuelType" className="form-label">
                                    Fuel Type *
                                </label>
                                <select
                                    id="fuelType"
                                    name="fuelType"
                                    value={formData.fuelType}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Select fuel type</option>
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Electric">Electric</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="transmission" className="form-label">
                                    Transmission *
                                </label>
                                <select
                                    id="transmission"
                                    name="transmission"
                                    value={formData.transmission}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Select transmission</option>
                                    <option value="Manual">Manual</option>
                                    <option value="Automatic">Automatic</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="seats" className="form-label">
                                    Seats *
                                </label>
                                <select
                                    id="seats"
                                    name="seats"
                                    value={formData.seats}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="2">2</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="7">7</option>
                                    <option value="8">8+</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="color" className="form-label">
                                    Color
                                </label>
                                <input
                                    type="text"
                                    id="color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., Silver, Black"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="pricePerDay" className="form-label">
                                    Price Per Day (₹) *
                                </label>
                                <input
                                    type="number"
                                    id="pricePerDay"
                                    name="pricePerDay"
                                    value={formData.pricePerDay}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., 1500"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="location" className="form-label">
                                Location *
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Mumbai, Maharashtra"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="latitude" className="form-label">
                                    Latitude (Optional)
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    id="latitude"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., 19.0760"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="longitude" className="form-label">
                                    Longitude (Optional)
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    id="longitude"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., 72.8777"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Pick Location on Map</label>
                            <div className="map-picker-container">
                                <MapComponent 
                                    onMapClick={handleMapClick}
                                    car={{
                                        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                                        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                                        brand: formData.brand || 'Your',
                                        model: formData.model || 'Car',
                                        pricePerDay: formData.pricePerDay || 0,
                                        location: formData.location || 'Selected Location'
                                    }}
                                    height="300px"
                                />
                                <p className="form-help">Click on the map to set the exact location of your car</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="image" className="form-label">
                                Car Image
                            </label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                onChange={handleImageChange}
                                className="form-input"
                                accept="image/*"
                            />
                            <p className="form-help">Upload an image of your car</p>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Adding Car...' : 'Add Car'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Phone Number Modal */}
            {showPhoneModal && (
                <div className="modal-overlay" onClick={() => setShowPhoneModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Add Phone Number</h2>
                        <p>You need to add a phone number to list a car. This allows renters to contact you after booking.</p>

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
                                disabled={loading}
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

export default AddCarPage;
