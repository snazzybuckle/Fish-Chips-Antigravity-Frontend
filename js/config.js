const CONFIG = {
    // Auto-detect environment
    API_URL: (function() {
        const hostname = window.location.hostname;
        const port = window.location.port;

        // 1. If running on localhost/127.0.0.1
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // If we are on port 3000 (Backend serving frontend), use relative path
            if (port === '3000') {
                return '/api';
            }
            // If we are on Live Server (usually 5500, 8080 or file://), point to backend port 3000
            return 'http://localhost:3000/api';
        }

        // 2. Production (Deployed site)
        // Assume frontend and backend are on same origin
        return '/api';
    })()
};
