import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add custom cursor class to body
document.body.classList.add('custom-cursor-active');

// Remove custom cursor on mobile/touch devices
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

if (isTouchDevice()) {
  document.body.classList.remove('custom-cursor-active');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
