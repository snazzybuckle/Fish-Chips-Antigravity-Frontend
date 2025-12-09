const Cart = {
    items: [],
    API_URL: (typeof CONFIG !== 'undefined' && CONFIG.API_URL) ? `${CONFIG.API_URL}/cart` : '/api/cart',

    async init() {
        // Always try to fetch remote cart. Backend handles 401 if not logged in.
        await this.fetchRemoteCart();
    },

    async fetchRemoteCart() {
        try {
            const res = await fetch(this.API_URL, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' // Send cookies
            });
            if (res.ok) {
                this.items = await res.json();
                this.updateUI();
            } else if (res.status === 401) {
                // Not logged in or session expired
                this.items = [];
                this.updateUI();
            }
        } catch (err) {
            console.error('Failed to fetch cart:', err);
        }
    },

    async syncItem(product) {
        // We rely on backend response. If 401, redirect to login.
        try {
            const res = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Send cookies
                body: JSON.stringify(product)
            });

            if (res.status === 401) {
                this.showLoginToast('Please login to add items to basket');
                return;
            }
            
            await this.fetchRemoteCart(); // Refresh from source of truth
        } catch (err) {
            console.error('Failed to sync item:', err);
        }
    },

    async add(product) {
        // Optimistic UI update could be done here, but let's sync first
        const existing = this.items.find(p => p.id === product.id);
        const quantity = existing ? existing.quantity + 1 : 1;
        
        await this.syncItem({ ...product, quantity });
        this.showNotification(`Added ${product.name}`);
    },

    async updateQuantity(id, change) {
        const item = this.items.find(p => p.id === id);
        if (!item) return;

        const newQty = item.quantity + change;
        if (newQty <= 0) {
            await this.remove(id);
        } else {
            await this.syncItem({ ...item, quantity: newQty });
        }
    },

    async remove(id) {
        try {
            await fetch(`${this.API_URL}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            await this.fetchRemoteCart();
        } catch (err) {
            console.error(err);
        }
    },

    async clear() {
        try {
            await fetch(this.API_URL, {
                method: 'DELETE',
                credentials: 'include'
            });
            this.items = [];
            this.updateUI();
        } catch (err) {
            console.error(err);
        }
    },

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    },

    updateUI() {
        const badges = document.querySelectorAll('.cart-count');
        badges.forEach(badge => {
            badge.textContent = this.getCount();
            badge.style.display = this.getCount() > 0 ? 'flex' : 'none';
        });

        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalElement = document.getElementById('cartTotal');
        
        if (cartItemsContainer && cartTotalElement) {
            cartItemsContainer.innerHTML = '';
            
            if (this.items.length === 0) {
                cartItemsContainer.innerHTML = '<div class="empty-cart">Your basket is empty</div>';
            } else {
                this.items.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'cart-item';
                    itemEl.innerHTML = `
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>£${item.price.toFixed(2)}</p>
                        </div>
                        <div class="cart-item-controls">
                            <button onclick="Cart.updateQuantity('${item.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="Cart.updateQuantity('${item.id}', 1)">+</button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(itemEl);
                });
            }
            
            cartTotalElement.textContent = `£${this.getTotal().toFixed(2)}`;
        }
    },

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        notification.offsetHeight; // reflow
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    },

    showLoginToast(message) {
        // Create toast with login redirect
        const toast = document.createElement('div');
        toast.className = 'notification login-toast';
        toast.innerHTML = `<i class="fas fa-lock" style="margin-right: 8px;"></i>${message}`;
        toast.style.background = 'linear-gradient(135deg, #d4a373, #bc6c25)';
        document.body.appendChild(toast);
        toast.offsetHeight; // reflow
        toast.classList.add('show');
        
        // Redirect after 1.5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                location.href = 'login.html';
            }, 300);
        }, 1500);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});
