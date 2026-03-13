import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AdminAuthProvider } from './admin-panel/context/AdminAuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <UserAuthProvider>
          <App />
        </UserAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
