import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { NotificationProvider } from './notifications/NotificationContext.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
)
