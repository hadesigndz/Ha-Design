import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress specific non-critical errors often caused by browser extensions
const IGNORED_ERRORS = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'message channel closed',
  'A listener indicated an asynchronous response'
];

const shouldIgnore = (msg) => {
  if (!msg) return false;
  const str = msg.toString();
  return IGNORED_ERRORS.some(err => str.includes(err));
};

const originalError = console.error;
console.error = (...args) => {
  if (args.length > 0 && shouldIgnore(args[0]?.toString())) return;
  originalError(...args);
};

window.addEventListener('error', (e) => {
  if (shouldIgnore(e.message)) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason?.message || e.reason?.toString();
  if (reason && shouldIgnore(reason)) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
