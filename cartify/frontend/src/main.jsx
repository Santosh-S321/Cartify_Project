import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

const router = createBrowserRouter(
  [
    { path: '/*', element: <App /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const updateSW = registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
});
