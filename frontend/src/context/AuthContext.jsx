import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await authAPI.getCurrentUser();
                    setUser(userData);
                } catch (err) {
                    // Only log if it's not a 403/401 (expected for unauthenticated)
                    if (err.response && ![401, 403].includes(err.response.status)) {
                        console.error('Auth check failed:', err);
                    }
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (emailOrToken, passwordOrType) => {
        try {
            setError(null);
            let response;

            if (passwordOrType === 'google') {
                response = await authAPI.googleAuth(emailOrToken);
            } else {
                response = await authAPI.login(emailOrToken, passwordOrType);
            }

            const { user, token } = response;
            localStorage.setItem('token', token);
            setUser(user);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const signup = async (userData) => {
        try {
            setError(null);
            const response = await authAPI.signup(userData);
            localStorage.setItem('token', response.token);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const googleLogin = async (googleToken) => {
        try {
            setError(null);
            const response = await authAPI.googleAuth(googleToken);
            localStorage.setItem('token', response.token);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        googleLogin,
        logout,
        updateUser,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
