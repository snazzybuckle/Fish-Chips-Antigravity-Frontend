# Fish & Chips Frontend

This is the frontend for the Fish & Chips e-commerce application. It is a static website built with HTML5, CSS3, and Vanilla JavaScript, designed to provide a premium user experience with modern aesthetics.

## 🎨 Tech Stack

- **HTML5**: Semantic markup
- **CSS3**: Styling with responsive design and modern layouts
- **JavaScript (Vanilla)**: Client-side logic and DOM manipulation

## 📂 Project Structure

```
frontend/
├── assets/          # Images and static assets
├── styles/          # CSS stylesheets
├── js/              # JavaScript files
│   ├── main.js      # Main logic
│   └── ...
├── index.html       # Homepage
├── about.html       # About Us page
├── contact.html     # Contact page
├── login.html       # Login page
├── signup.html      # Registration page
├── checkout.html    # Checkout page
```

## 🚀 Getting Started

### Installation

No installation of dependencies is required as this is a static site.

### Running the App

You can run this project using any static file server.

**Option 1: Using Live Server (VS Code Extension)**
1. Open the project in VS Code.
2. Right-click on `index.html`.
3. Select "Open with Live Server".

**Option 2: Using Node.js `http-server`**
1. Install `http-server` globally (if not already installed):
   ```bash
   npm install --global http-server
   ```
2. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
3. Start the server:
   ```bash
   http-server .
   ```

Then, open your browser and navigate to the local address provided (usually `http://127.0.0.1:8080`).

## 🔗 Backend Integration

This frontend is designed to communicate with the backend API.
Ensure the backend server is running (default: `http://localhost:3000`).

The frontend expects the backend API to be available for authentication and cart operations.
