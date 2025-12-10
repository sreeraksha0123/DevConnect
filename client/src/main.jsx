import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Set default theme to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.classList.add(savedTheme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);