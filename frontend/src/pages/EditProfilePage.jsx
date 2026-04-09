import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { getFullImageUrl } from '../utils/urlUtils';
import './ProfilePage.css'; // Reuse profile styles

const EditProfilePage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '', // Read-only
                phone: user.phone || '',
            });
            setPreviewUrl(user.image || '');
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('phone', formData.phone);

            const updatedUser = await userAPI.updateProfile(data);

            // Update auth context
            updateUser(updatedUser);

            alert('Profile updated successfully!');
            navigate('/profile');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-container make-small">
                    <h1>Edit Profile</h1>

                    <form onSubmit={handleSubmit} className="edit-profile-form">
                        <div className="profile-image-upload">
                            <div className="profile-avatar-large">
                                {previewUrl ? (
                                    <img src={getFullImageUrl(previewUrl)} alt="Profile Preview" className="avatar-image" />
                                ) : (
                                    formData.name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                className="form-input"
                                disabled
                            />
                            <p className="form-help">Email cannot be changed</p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone" className="form-label">Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;
