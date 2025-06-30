import React, { createContext, useState, useContext } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [modal, setModal] = useState({ isOpen: false, message: '', title: '' });
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, message: '', title: '', onConfirm: () => {} });

    const showModal = (message, title) => setModal({ isOpen: true, message, title });
    const closeModal = () => setModal({ isOpen: false, message: '', title: '' });

    const showConfirmationModal = (message, onConfirm, title) => setConfirmationModal({ isOpen: true, message, onConfirm, title });
    const closeConfirmationModal = () => setConfirmationModal({ isOpen: false, message: '', title: '', onConfirm: () => {} });

    const handleConfirmAction = () => {
        if (typeof confirmationModal.onConfirm === 'function') {
            confirmationModal.onConfirm();
        }
        closeConfirmationModal();
    };

    const value = { modal, showModal, closeModal, confirmationModal, showConfirmationModal, closeConfirmationModal, handleConfirmAction };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => useContext(UIContext);