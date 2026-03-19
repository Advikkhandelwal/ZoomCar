// API Service Layer for ZoomCar
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
        ...options.headers,
    };

    // Only set Content-Type to application/json if not already set and body is not FormData
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

// Authentication APIs
export const authAPI = {
    login: async (email, password) => {
        return fetchWithAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    signup: async (userData) => {
        return fetchWithAuth('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    googleAuth: async (googleToken) => {
        return fetchWithAuth('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ token: googleToken }),
        });
    },

    getCurrentUser: async () => {
        return fetchWithAuth('/auth/me');
    },
};

// Car APIs
export const carAPI = {
    getAllCars: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return fetchWithAuth(`/cars${queryParams ? `?${queryParams}` : ''}`);
    },

    getCarById: async (id) => {
        return fetchWithAuth(`/cars/${id}`);
    },

    createCar: async (carData) => {
        // Creating a car is an owner/host action, so it should go through the owner routes
        const isFormData = carData instanceof FormData;

        return fetchWithAuth('/owner/cars', {
            method: 'POST',
            body: isFormData ? carData : JSON.stringify(carData),
            headers: isFormData ? {} : { 'Content-Type': 'application/json' }, // Let browser set boundary for FormData
        });
    },

    updateCar: async (id, carData) => {
        const isFormData = carData instanceof FormData;
        return fetchWithAuth(`/cars/${id}`, {
            method: 'PUT',
            body: isFormData ? carData : JSON.stringify(carData),
            headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        });
    },

    deleteCar: async (id) => {
        return fetchWithAuth(`/cars/${id}`, {
            method: 'DELETE',
        });
    },

    getOwnerCars: async () => {
        return fetchWithAuth('/owner/cars');
    },

    uploadCarImage: async (formData) => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/cars/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Image upload failed');
        }

        return response.json();
    },

    updateBookingStatus: async (id, status) => {
        return fetchWithAuth(`/owner/bookings/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },
};

// Booking APIs
export const bookingAPI = {
    createBooking: async (bookingData) => {
        return fetchWithAuth('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    },

    getUserBookings: async () => {
        return fetchWithAuth('/bookings');
    },

    getOwnerBookings: async () => {
        return fetchWithAuth('/owner/bookings');
    },

    getBookingById: async (id) => {
        return fetchWithAuth(`/bookings/${id}`);
    },

    updateBookingStatus: async (id, status) => {
        return fetchWithAuth(`/bookings/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },

    cancelBooking: async (id) => {
        return fetchWithAuth(`/bookings/${id}/cancel`, {
            method: 'PATCH',
        });
    },

    checkAvailability: async (carId, startDate, endDate) => {
        const params = new URLSearchParams({ startDate, endDate }).toString();
        return fetchWithAuth(`/bookings/check-availability/${carId}?${params}`);
    },

    getCarBookings: async (carId) => {
        return fetchWithAuth(`/bookings/car/${carId}`);
    },
};

// User APIs
export const userAPI = {
    getProfile: async () => {
        return fetchWithAuth('/users/profile');
    },

    updateProfile: async (userData) => {
        const isFormData = userData instanceof FormData;
        return fetchWithAuth('/users/profile', {
            method: 'PUT',
            body: isFormData ? userData : JSON.stringify(userData),
            headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        });
    },

    getUserById: async (id) => {
        return fetchWithAuth(`/users/${id}`);
    },
};

// Review APIs
export const reviewAPI = {
    createReview: async (reviewData) => {
        return fetchWithAuth('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    },

    getCarReviews: async (carId) => {
        return fetchWithAuth(`/reviews/car/${carId}`);
    },

    checkEligibility: async (bookingId) => {
        return fetchWithAuth(`/reviews/eligibility/${bookingId}`);
    },

    getUserReviews: async () => {
        return fetchWithAuth('/reviews/user');
    },
};

// Verification APIs
export const verificationAPI = {
    getStatus: async () => {
        return fetchWithAuth('/verification/status');
    },
    uploadDocs: async (docs) => {
        return fetchWithAuth('/verification/upload', {
            method: 'POST',
            body: JSON.stringify(docs),
        });
    },
    verifyUser: async (userId, isVerified) => {
        return fetchWithAuth('/verification/verify', {
            method: 'POST',
            body: JSON.stringify({ userId, isVerified }),
        });
    },
};

// Trip APIs
export const tripAPI = {
    uploadPhotos: async (photoData) => {
        return fetchWithAuth('/trips/photos', {
            method: 'POST',
            body: JSON.stringify(photoData),
        });
    },
    getPhotos: async (bookingId) => {
        return fetchWithAuth(`/trips/photos/${bookingId}`);
    },
};

export default {
    auth: authAPI,
    car: carAPI,
    booking: bookingAPI,
    user: userAPI,
    review: reviewAPI,
    verification: verificationAPI,
    trip: tripAPI,
};
