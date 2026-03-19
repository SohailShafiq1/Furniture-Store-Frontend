import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useUserAuth } from './UserAuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const GUEST_CART_KEY = 'furniture_store_guest_cart';

export const CartProvider = ({ children }) => {
  const { user, token } = useUserAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch cart when user logs in, or load guest cart from localStorage
  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      // Load guest cart from localStorage
      loadGuestCart();
    }
  }, [user, token]);

  const loadGuestCart = () => {
    try {
      const savedCart = localStorage.getItem(GUEST_CART_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } else {
        setCart({ items: [], totalPrice: 0 });
      }
    } catch (err) {
      console.error('Error loading guest cart:', err);
      setCart({ items: [], totalPrice: 0 });
    }
  };

  const saveGuestCart = (cartData) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
    } catch (err) {
      console.error('Error saving guest cart:', err);
    }
  };

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

  const addToCart = async (productId, variation, quantity, price, productDetails = null) => {
    // Allow both logged-in and guest users
    if (!productId) {
      console.error('Invalid product');
      return false;
    }

    try {
      if (user && token) {
        // Logged-in user - save to database
        const res = await axios.post(`${API_BASE_URL}/cart/add`, {
          productId, variation, quantity, price
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          setCart(res.data.cart);
          return true;
        }
      } else {
        // Guest user - save to localStorage
        const newCart = { ...cart };
        const existingItemIndex = newCart.items.findIndex(
          item => item.product === productId && item.variation === variation
        );

        if (existingItemIndex > -1) {
          newCart.items[existingItemIndex].quantity += quantity;
        } else {
          newCart.items.push({
            _id: `guest_${Date.now()}`,
            product: productId,
            variation,
            quantity,
            price,
            ...(productDetails && { productDetails }) // Store product details for checkout display
          });
        }

        // Calculate total price
        newCart.totalPrice = newCart.items.reduce(
          (total, item) => total + (item.price * item.quantity),
          0
        );

        setCart(newCart);
        saveGuestCart(newCart);
        return true;
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (user && token) {
        // Logged-in user
        const res = await axios.put(`${API_BASE_URL}/cart/update/${itemId}`, {
          quantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          setCart(res.data.cart);
        }
      } else {
        // Guest user - update localStorage
        const newCart = { ...cart };
        const item = newCart.items.find(item => item._id === itemId);
        if (item) {
          item.quantity = quantity;
          newCart.totalPrice = newCart.items.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
          );
          setCart(newCart);
          saveGuestCart(newCart);
        }
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (user && token) {
        // Logged-in user
        const res = await axios.delete(`${API_BASE_URL}/cart/remove/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          setCart(res.data.cart);
        }
      } else {
        // Guest user - remove from localStorage
        const newCart = { ...cart };
        newCart.items = newCart.items.filter(item => item._id !== itemId);
        newCart.totalPrice = newCart.items.reduce(
          (total, item) => total + (item.price * item.quantity),
          0
        );
        setCart(newCart);
        saveGuestCart(newCart);
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const clearCart = async () => {
    try {
      if (user && token) {
        // Logged-in user
        await axios.delete(`${API_BASE_URL}/cart/clear`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Guest user - clear localStorage
        localStorage.removeItem(GUEST_CART_KEY);
      }
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
