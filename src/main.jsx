import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AdminAuthProvider } from './admin-panel/context/AdminAuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import { CartProvider } from './context/CartContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <UserAuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </UserAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
