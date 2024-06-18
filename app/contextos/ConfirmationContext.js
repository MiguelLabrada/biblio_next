"use client";
import { createContext, useState, useContext } from 'react';

const ConfirmationContext = createContext();

export const ConfirmationProvider = ({ children }) => {
    const [confirmation, setConfirmation] = useState({ 
        showReserveConfirmation: false, 
        showLoanConfirmation: false, 
        id: '', 
        title: '', 
        message: '' 
    });

    const showReserveConfirmation = (id, title, message) => {
        setConfirmation({ showReserveConfirmation: true, showLoanConfirmation: false, id, title, message });
    };

    const showLoanConfirmation = (id, title, message) => {
        setConfirmation({ showReserveConfirmation: false, showLoanConfirmation: true, id, title, message });
    };

    const closeConfirmation = () => {
        setConfirmation({ showReserveConfirmation: false, showLoanConfirmation: false, id : '', title: '', message: '' });
    };

    return (
        <ConfirmationContext.Provider value={{ confirmation, showReserveConfirmation, showLoanConfirmation, closeConfirmation }}>
            {children}
        </ConfirmationContext.Provider>
    );
};

export const useConfirmation = () => {
    return useContext(ConfirmationContext);
};