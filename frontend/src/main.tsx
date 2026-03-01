import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SessionProvider } from './context/SessionContext';
import { SettingsProvider } from './context/SettingsContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </SettingsProvider>
  </React.StrictMode>,
);
