import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import { useState } from 'react';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowDropdown(false);
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                        {/* Logo */}
                        <Link to="/" className="navbar-logo">
                            <span className="navbar-logo-text">ZoomCar</span>
                        </Link>

                        {/* Desktop Links */}
                    <div className="navbar-links">
                        {isAuthenticated && (
                            <Link to="/become-host" className="navbar-link">
                                Become a Host
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <div className="navbar-profile">
                                <button
                                    className="navbar-profile-btn"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    <div className="navbar-avatar">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                </button>

                                {showDropdown && (
                                    <div className="navbar-dropdown">
                                        <Link to="/profile" className="navbar-dropdown-item" onClick={() => setShowDropdown(false)}>
                                            Profile
                                        </Link>
                                        <Link to="/bookings" className="navbar-dropdown-item" onClick={() => setShowDropdown(false)}>
                                            My Bookings
                                        </Link>
                                        <Link to="/favorites" className="navbar-dropdown-item" onClick={() => setShowDropdown(false)}>
                                            My Favorites
                                        </Link>
                                        <Link to="/dashboard" className="navbar-dropdown-item" onClick={() => setShowDropdown(false)}>
                                            Owner Dashboard
                                        </Link>
                                        <hr className="navbar-dropdown-divider" />
                                        <button className="navbar-dropdown-item" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="navbar-auth">
                                <Link to="/login" className="btn btn-secondary btn-sm">
                                    Log in
                                </Link>
                                <Link to="/signup" className="btn btn-primary btn-sm">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="navbar-mobile-toggle"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="navbar-mobile-menu">
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" className="navbar-mobile-item" onClick={() => setShowMobileMenu(false)}>
                                    Profile
                                </Link>
                                <Link to="/bookings" className="navbar-mobile-item" onClick={() => setShowMobileMenu(false)}>
                                    My Bookings
                                </Link>
                                <Link to="/favorites" className="navbar-mobile-item" onClick={() => setShowMobileMenu(false)}>
                                    My Favorites
                                </Link>
                                <Link to="/dashboard" className="navbar-mobile-item" onClick={() => setShowMobileMenu(false)}>
                                    Owner Dashboard
                                </Link>
                                <Link to="/become-host" className="navbar-mobile-item" onClick={() => setShowMobileMenu(false)}>
                                    Become a Host
                                </Link>
                                <button className="navbar-mobile-item" onClick={handleLogout}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="navbar-mobile-item" onClick={() => setShowMobileMenu(false)}>
                                    Log in
                                </Link>
                                <Link to="/signup" className="navbar-mobile-item" onClick={() => setShowMobileMenu(false)}>
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
