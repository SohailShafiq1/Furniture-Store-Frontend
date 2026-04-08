import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useUserAuth } from './UserAuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const GUEST_CART_KEY = 'furniture_store_guest_cart';
const STORE_ATTRIBUTION_KEY = 'furniture_store_attribution';

export const CartProvider = ({ children }) => {
  const { user, token } = useUserAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0, storeId: null });
  const [attribution, setAttribution] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize Attribution from URL or Session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlStoreId = params.get('store');
    const adId = params.get('adId');
    const campaign = params.get('campaign');
    const source = params.get('source');

    if (urlStoreId) {
      const newAttribution = {
        storeId: urlStoreId,
        source: source || 'Ads',
        campaign: campaign || 'Campaign',
        adId: adId || 'AdUnit',
        timestamp: Date.now()
      };
      setAttribution(newAttribution);
      localStorage.setItem(STORE_ATTRIBUTION_KEY, JSON.stringify(newAttribution));
    } else {
      const saved = localStorage.getItem(STORE_ATTRIBUTION_KEY);
      if (saved) {
        setAttribution(JSON.parse(saved));
      }
    }
  }, []);

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
        setCart({ items: [], totalPrice: 0, storeId: null });
      }
    } catch (err) {
      console.error('Error loading guest cart:', err);
      setCart({ items: [], totalPrice: 0, storeId: null });
    }
  };

  const saveGuestCart = (cartData) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
    } catch (err) {
      console.error('Error saving guest cart:', err);
    }
  };

  const fetchCart = useCallback(async () => {
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
  }, [token]);

  const addToCart = useCallback(async (productId, variation, quantity, price, productDetails = null, selectedColor = null) => {
    // Allow both logged-in and guest users
    if (!productId) {
      console.error('Invalid product');
      return false;
    }

    try {
      // RULE: Determine Store Attribution
      let targetStoreId = attribution?.storeId;

      if (!targetStoreId) {
        // Try to fetch attribution from backend
        try {
          const res = await axios.get(`${API_BASE_URL}/products/attribution/${productId}`);
          targetStoreId = res.data.storeId;
        } catch (attrErr) {
          console.warn('Could not fetch product attribution, using fallback:', attrErr.message);
          // Fallback: Use null (let backend handle default store assignment)
          // or use localStorage attribution if available
          targetStoreId = attribution?.storeId || null;
        }
      }

      // STRICT RULE: Cart is locked to ONE store
      if (cart.storeId && cart.storeId !== targetStoreId && cart.items.length > 0) {
        // Prevent mixing stores or trigger auto-reassignment logic
        console.warn('Mixing stores not allowed. Reassigning to current store attribution.');
        // Reassignment logic: We could ask user or just follow current attribution
      }

      if (user && token) {
        // Logged-in user - save to database
        try {
          const res = await axios.post(`${API_BASE_URL}/cart/add`, {
            productId, 
            variation, 
            quantity, 
            price, 
            storeId: targetStoreId, 
            color: selectedColor
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data.success) {
            setCart(res.data.cart);
            return true;
          }
        } catch (cartErr) {
          console.error('Error adding to cart (logged-in user):', cartErr);
          console.error('Status:', cartErr.response?.status);
          console.error('Message:', cartErr.response?.data?.message);
          throw cartErr;
        }
      } else {
        // Guest user - save to localStorage
        const newCart = { ...cart, storeId: targetStoreId };
        const existingItemIndex = newCart.items.findIndex(
          item => item.product === productId && item.variation === variation && item.color === selectedColor
        );

        if (existingItemIndex > -1) {
          newCart.items[existingItemIndex].quantity += quantity;
        } else {
          newCart.items.push({
            _id: `guest_${Date.now()}`,
            product: productId,
            variation,
            color: selectedColor,
            quantity,
            storeId: targetStoreId,
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
  }, [user, token, attribution, cart.storeId, cart.items]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
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
  }, [user, token, cart]);

  const removeFromCart = useCallback(async (itemId) => {
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
  }, [user, token, cart]);

  const clearCart = useCallback(async () => {
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
  }, [user, token]);

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
