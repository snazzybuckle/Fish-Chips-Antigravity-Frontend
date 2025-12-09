const Cart = {
    items: [],
    API_URL: (typeof CONFIG !== 'undefined' && CONFIG.API_URL) ? `${CONFIG.API_URL}/cart` : '/api/cart',

    async init() {
        if (Auth.getToken()) {
            await this.fetchRemoteCart();
        } else {
            // Guest mode: use local storage (optional fallback)
            // For now we will just show empty cart if not logged in
            // or we could keep the guest localStorage logic.
            // Let's keep guest logic separate or just do nothing.
            // If the user wants guest cart, we can keep the old logic too.
            this.items = [];
            this.updateUI();
        }
    },

    async fetchRemoteCart() {
        try {
            const res = await fetch(this.API_URL, {
                headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
            });
            if (res.ok) {
                this.items = await res.json();
                this.updateUI();
            }
        } catch (err) {
            console.error('Failed to fetch cart:', err);
        }
    },

    async syncItem(product) {
        if (!Auth.getToken()) {
            alert('Please login to add items to basket');
            location.href = 'login.html';
            return;
        }

        try {
            await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify(product)
            });
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
        if (!Auth.getToken()) return;

        try {
            await fetch(`${this.API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
            });
            await this.fetchRemoteCart();
        } catch (err) {
            console.error(err);
        }
    },

    async clear() {
        if (!Auth.getToken()) return;

        try {
            await fetch(this.API_URL, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
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
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});
