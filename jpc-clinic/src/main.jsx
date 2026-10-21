import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

if ('serviceWorker' in navigator) {
    if (import.meta.env.PROD) {
        // Production lang ang may Service Worker
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker Registered!');
                    console.log('Scope:', registration.scope);
                })
                .catch((error) => {
                    console.error('❌ Service Worker Registration Failed!');
                    console.error(error);
                });
        });
    } else {
        // Sa development: burahin ang lumang Service Worker at cache para hindi lumang code ang lumabas
        navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach((r) => r.unregister());
        });
        if (window.caches) {
            caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
        }
    }
}