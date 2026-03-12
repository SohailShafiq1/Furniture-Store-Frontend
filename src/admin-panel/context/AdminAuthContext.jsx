import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  const login = (adminData, authToken) => {
    localStorage.setItem('adminToken', authToken);
    localStorage.setItem('adminUser', JSON.stringify(adminData));
    setToken(authToken);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setAdmin(null);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) setAdmin(JSON.parse(savedUser));
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
