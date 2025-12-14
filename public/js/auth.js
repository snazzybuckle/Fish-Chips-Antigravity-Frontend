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
            
            if (window.logAnalyticsEvent) {
                window.logAnalyticsEvent('login', { method: 'email' });
            }

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
        localStorage.removeItem('fishnchips_cart');
        this.updateNav(); // Update UI before redirect
        location.href = 'login.html';
    },

    toggleDropdown(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const menu = document.getElementById('authDropdown');
        if (menu) {
            menu.classList.toggle('active');
        }
    },

    updateNav() {
        // Target the container LI we created
        const container = document.getElementById('authItem');
        if (!container) return;
        
        const username = localStorage.getItem('fishnchips_username');
        
        if (username) {
            // Logged In - Render Dropdown Structure
            container.innerHTML = `
                <div class="auth-dropdown-container" onclick="Auth.toggleDropdown(event)">
                    <img src="assets/imgs/default-user.svg" alt="Profile" class="nav-profile-pic logged-in">
                    
                    <div class="dropdown-menu" id="authDropdown">
                        <div class="dropdown-header">
                            <span class="dropdown-user-name">${username}</span>
                            <span class="dropdown-user-handle">Foodie Member</span>
                        </div>
                        <a href="#" class="dropdown-item"><i class="fas fa-user"></i> Account</a>
                        <a href="#" class="dropdown-item"><i class="fas fa-credit-card"></i> Payment</a>
                        <a href="#" class="dropdown-item"><i class="fas fa-cog"></i> Settings</a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item text-danger" onclick="Auth.logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                </div>
            `;
        } else {
            // Logged Out - Standard Link
            container.innerHTML = `<a href="login.html" id="authLink" class="nav-login-btn">Login</a>`;
        }
    }
};

// Global click listener to close dropdown
document.addEventListener('click', (e) => {
    const menu = document.getElementById('authDropdown');
    const container = document.querySelector('.auth-dropdown-container');
    
    // If click is outside the container, remove active class
    if (menu && container && !container.contains(e.target)) {
        menu.classList.remove('active');
    }
});

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
                    if (window.logAnalyticsEvent) {
                        window.logAnalyticsEvent('sign_up', { method: 'email' });
                    }
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
