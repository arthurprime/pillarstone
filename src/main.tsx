import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './lib/auth'
import { isSupabaseConfigured } from './lib/supabase'
import ErrorBoundary from './components/ErrorBoundary'
import MissingConfig from './components/MissingConfig'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      {isSupabaseConfigured ? (
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      ) : (
        <MissingConfig />
      )}
    </ErrorBoundary>
  </React.StrictMode>,
)
