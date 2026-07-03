import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

// autoUpdate lifecycle: the fresh service worker takes control immediately
// (skipWaiting + clientsClaim) and this listener reloads the page when it
// does — so a returning visitor always renders the latest deploy without a
// manual refresh. The bare injected register script doesn't reload on its own.
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
