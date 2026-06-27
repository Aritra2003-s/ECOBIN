import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Styles (Importing the global App.css we created)
import './App.css';

// 1. Get the root element
const rootElement = document.getElementById('root');

// 2. Add a safety check to prevent crashing if index.html is missing the div
if (!rootElement) {
  throw new Error("Failed to find the root element. Ensure index.html has <div id='root'></div>");
}

// 3. Render the application
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* AuthProvider is outside so it can access navigation logic if needed */}
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);