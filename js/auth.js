// Use dynamic config or fallback
const API_URL = (typeof CONFIG !== 'undefined' && CONFIG.API_URL) ? `${CONFIG.API_URL}/auth` : '/api/auth';

const Auth = {
    getToken() {
        return localStorage.getItem('fishnchips_token');
    },

    getCurrentUser() {
        return localStorage.getItem('fishnchips_username');
    },

    async register(username, password) {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Registration failed');
            }
            
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            alert(error.message);
            return false;
        }
    },

    async login(username, password) {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Login failed');
            }

            const data = await res.json();
            localStorage.setItem('fishnchips_token', data.token);
            localStorage.setItem('fishnchips_username', data.username);
            
            // Reload page to update UI
            location.href = 'index.html';
            return true;
        } catch (error) {
            console.error('Login error:', error);
            alert(error.message);
            return false;
        }
    },

    logout() {
        localStorage.removeItem('fishnchips_token');
        localStorage.removeItem('fishnchips_username');
        location.href = 'index.html';
    },

    updateNav() {
        const link = document.getElementById('authLink');
        if (!link) return;
        
        const username = this.getCurrentUser();
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
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNav();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(loginForm);
            await Auth.login(data.get('username'), data.get('password'));
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(signupForm);
            const success = await Auth.register(data.get('username'), data.get('password'));
            if (success) {
                alert('Account created! Please log in.');
                location.href = 'login.html';
            }
        });
    }
});
