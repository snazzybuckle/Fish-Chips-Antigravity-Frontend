const CONFIG = {
    // Auto-detect environment
    API_URL: (function() {
        const hostname = window.location.hostname;
        const port = window.location.port;

        // 0. Check if running from file system
        if (window.location.protocol === 'file:') {
             alert('Warning: You are running this website from a local file. Login will NOT work due to browser security restrictions (Cookies). Please use "Open with Live Server" or run a local server.');
             // Return fallback to avoid crash, but it won't work well
             return 'http://localhost:10000/api'; 
        }

        // 1. If running on localhost/127.0.0.1
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // If we are on port 10000 (Backend serving frontend), use relative path
            if (port === '10000') {
                return '/api';
            }
            // If we are on Live Server (usually 5500, 8080 or file://), point to backend port 10000
            return 'http://localhost:10000/api';
        }

        // 2. Production (Deployed site)
        // IMPORTANT: Replace this with your actual Render backend Web Service URL
        // Example: 'https://fish-chips-backend.onrender.com/api'
        // For now, we'll use a placeholder that you MUST update after creating your backend service.
        const PRODUCTION_BACKEND_URL = 'https://secure-login-page-backend.onrender.com/api';
        
        // If you want the frontend on the same origin as backend (single service), use '/api'
        // If separate services, use the full URL above.
        // Detect: if current host contains 'onrender.com' and path doesn't have '/api', use full URL
        if (hostname.includes('onrender.com')) {
            // Check if we are on the BACKEND service (which also serves frontend)
            // or on a SEPARATE static frontend service
            // If the backend serves frontend, relative path works. 
            // If separate, we need the full backend URL.
            // Safest: always use the full URL if we're on a static site.
            return PRODUCTION_BACKEND_URL;
        }

        // Fallback for other production hosts (custom domain, etc.)
        return PRODUCTION_BACKEND_URL;
    })()
};
