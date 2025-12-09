// Use dynamic config or fallback
const API_URL = (typeof CONFIG !== 'undefined' && CONFIG.API_URL) ? `${CONFIG.API_URL}/auth` : '/api/auth';

const Auth = {
    // Check auth status with backend
    async checkAuth() {
        try {
            console.log('Checking auth...');
            const res = await fetch(`${API_URL}/me`, { credentials: 'include' });
            console.log('Check auth res:', res.status);
            if (res.ok) {
                const data = await res.json();
                console.log('Check auth data:', data);
                if (data.authenticated) {
                    this.user = data.username;
                    localStorage.setItem('fishnchips_username', data.username); // Keep for UI reference/fast load
                    this.updateNav();
                    return true;
                }
            }
        } catch (e) {
            console.error('Auth check error:', e);
        }
        
        // If failed
        this.user = null;
        localStorage.removeItem('fishnchips_username');
        localStorage.removeItem('fishnchips_token'); // Clean up old token if exists
        this.updateNav();
        return false;
    },

    async register(username, password) {
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });
            
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Registration failed');
            }
            
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            throw error; // Propagate to UI
        }
    },

    async login(username, password) {
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Login failed');
            }

            const data = await res.json();
            // Token is in HttpOnly cookie now
            localStorage.setItem('fishnchips_username', data.username);
            
            location.href = 'index.html';
            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error; // Propagate to UI
        }
    },

    async logout() {
        try {
            await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
        } catch (e) {
            console.error('Logout error', e);
        }
        // Clear local state immediately
        this.user = null;
        localStorage.removeItem('fishnchips_username');
        localStorage.removeItem('fishnchips_token');
        this.updateNav(); // Update UI before redirect
        location.href = 'login.html';
    },

    updateNav() {
        const link = document.getElementById('authLink');
        if (!link) return;
        
        // Fallback to localStorage for immediate render, validated by checkAuth async
        const username = localStorage.getItem('fishnchips_username');
        
        if (username) {
            link.textContent = `Logout (${username})`;
            link.href = '#';
            link.onclick = (e) => {
                e.preventDefault();
                this.logout();
            };
        } else {
            link.textContent = 'Login';
            link.href = 'login.html';
            link.onclick = null;
        }
    }
};

// Form listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Auth.js loaded');

    // Password Toggle Logic
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', () => {
            const targetId = icon.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    await Auth.checkAuth();
    Auth.updateNav();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errDiv = loginForm.querySelector('.error-message');
            if (errDiv) { errDiv.style.display = 'none'; errDiv.textContent = ''; }

            const data = new FormData(loginForm);
            try {
                await Auth.login(data.get('username'), data.get('password'));
            } catch (err) {
                if (errDiv) {
                    errDiv.style.display = 'block';
                    errDiv.textContent = err.message;
                } else {
                    alert(err.message);
                }
            }
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errDiv = signupForm.querySelector('.error-message');
            if (errDiv) { errDiv.style.display = 'none'; errDiv.textContent = ''; }

            const data = new FormData(signupForm);
            const username = data.get('username');
            const password = data.get('password');
            const confirmPassword = data.get('confirmPassword');

            if (password !== confirmPassword) {
                 const errDiv = signupForm.querySelector('.error-message');
                 if (errDiv) {
                    errDiv.style.display = 'block';
                    errDiv.textContent = 'Passwords do not match';
                 }
                 return;
            }

            try {
                const success = await Auth.register(username, password);
                if (success) {
                    location.href = 'signup-success.html';
                }
            } catch (err) {
                if (errDiv) {
                    errDiv.style.display = 'block';
                    errDiv.textContent = err.message;
                } else {
                    alert(err.message);
                }
            }
        });
    }
});
