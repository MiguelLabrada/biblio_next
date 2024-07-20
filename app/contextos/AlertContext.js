"use client";
import { createContext, useState, useContext } from 'react';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState({ show: false, message: '' });

    const showAlert = (message) => {
        setAlert({ show: true, message });
    };

    const closeAlert = () => {
        setAlert({ show: false, message: '' });
    };

    return (
        <AlertContext.Provider value={{ alert, showAlert, closeAlert }}>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    return useContext(AlertContext);
};