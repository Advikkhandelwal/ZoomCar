import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, error } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

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
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            console.error('Login failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            await login(credentialResponse.credential, 'google'); // Updated to pass token and type
            navigate('/');
        } catch (err) {
            console.error('Google login failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.error('Google Login Failed');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Log in to your ZoomCar account</p>

                    {error && (
                        <div className="auth-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="auth-loading-spinner" style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <div className="spinner" style={{ 
                                width: '40px', 
                                height: '40px', 
                                border: '4px solid #f3f3f3', 
                                borderTop: '4px solid #FF385C', 
                                borderRadius: '50%', 
                                animation: 'spin 1s linear infinite', 
                                margin: '0 auto 1rem' 
                            }}></div>
                            <p style={{ color: '#717171' }}>Authenticating...</p>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                                    Log in
                                </button>
                            </form>

                            <div className="auth-divider">
                                <span>or</span>
                            </div>

                            <div className="google-login-container">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    theme="outline"
                                    size="large"
                                    text="continue_with"
                                    width="100%"
                                />
                            </div>

                            <p className="auth-footer">
                                Don't have an account?{' '}
                                <Link to="/signup" className="auth-link">
                                    Sign up
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
