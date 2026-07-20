import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import './index.css'
import App from './App.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <NotificationProvider>
    <App />
  </NotificationProvider>
  </GoogleOAuthProvider>
  
    
  </BrowserRouter>,
)
