import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

registerSW({ immediate: true });

// Global error handlers to prevent unhandled promise rejections from breaking the app silently
window.addEventListener('error', (e) => {
  console.error("Global captured error:", e.error);
  // We don't prevent default here so ErrorBoundary can catch React errors
});

window.addEventListener('unhandledrejection', (e) => {
  e.preventDefault(); 
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
