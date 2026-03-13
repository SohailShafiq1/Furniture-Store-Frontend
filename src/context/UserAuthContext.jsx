import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('userToken') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('userToken', token);
            // Optionally fetch user profile info here to sync
        } else {
            localStorage.removeItem('userToken');
        }
        setLoading(false);
    }, [token]);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <UserAuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </UserAuthContext.Provider>
    );
};

export const useUserAuth = () => useContext(UserAuthContext);