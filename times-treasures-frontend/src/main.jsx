import React from 'react';
import ReactDOM from 'react-dom/client'; 
import App from './App';
import './index.css';

const container = document.getElementById('root');

// Check if the container exists to prevent errors
if (container) {
  const root = ReactDOM.createRoot(container);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root container not found");
}
