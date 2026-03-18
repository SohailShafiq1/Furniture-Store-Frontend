import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useUserAuth } from './UserAuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, token } = useUserAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch cart when user logs in
  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      // Clear cart on logout
      setCart({ items: [], totalPrice: 0 });
    }
  }, [user, token]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, variation, quantity, price) => {
    if (!user) {
      // Handle guest cart or prompt for login
      alert('Please log in to add items to cart');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/cart/add`, {
        productId, variation, quantity, price
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setCart(res.data.cart);
        return true;
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/cart/update/${itemId}`, {
        quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart({ items: [], totalPrice: 0 });
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart,
      fetchCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};
