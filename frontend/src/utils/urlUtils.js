const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Ensures an image URL is absolute and correctly points to the backend if it's a relative path.
 * @param {string} url - The image URL or relative path.
 * @returns {string} - The absolute image URL.
 */
export const getFullImageUrl = (url) => {
    if (!url) return 'https://placehold.co/400x300/e2e8f0/475569?text=No+Image';

    // Ensure url is a string and trim it
    const cleanUrl = String(url).trim();

    // Handle legacy localhost URLs in the database
    if (cleanUrl.includes('localhost:3001')) {
        const path = cleanUrl.split('localhost:3001')[1];
        const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanBaseUrl}${cleanPath}`;
    }

    // Handle legacy local upload paths that won't exist in production
    if (cleanUrl.startsWith('/uploads/')) {
        return 'https://placehold.co/400x300/e2e8f0/475569?text=Legacy+Image';
    }

    // If it's already an absolute URL (starts with http or https), return as is
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        return cleanUrl;
    }

    // If it's a relative path, prepend the API base URL
    const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const cleanPath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;

    return `${cleanBaseUrl}${cleanPath}`;
};
