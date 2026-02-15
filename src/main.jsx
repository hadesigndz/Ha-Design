import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress ResizeObserver loop limit exceeded and message channel closed errors
const originalError = console.error;
console.error = (...args) => {
  if (
    /Loop limit exceeded/.test(args[0]) ||
    /message channel closed/.test(args[0])
  ) {
    return;
  }
  originalError(...args);
};

window.addEventListener('error', (e) => {
  if (e.message.includes('message channel closed') || e.message.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
