"use client";
import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    isAuthenticated: false,
    jwt: null,
    id: null,
    role: null,
    username: null
  });

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setAuthData({
        isAuthenticated: true,
        jwt: token,
        id: localStorage.getItem('id'),
        role: localStorage.getItem('role'),
        username: localStorage.getItem('username')
      });
    }
  }, []);

  const login = (jwt, id, role, username) => {
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('id', id);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);

    setAuthData({
      isAuthenticated: true,
      jwt: jwt,
      id: id,
      role: role,
      username: username
    });
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    setAuthData({
      isAuthenticated: false,
      jwt: null,
      id: null,
      role: null,
      username: null
    });
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);