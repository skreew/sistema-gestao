import React, { createContext, useState, useContext } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [modal, setModal] = useState({ isOpen: false, message: '' });
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });

    const showModal = (message) => setModal({ isOpen: true, message });
    const closeModal = () => setModal({ isOpen: false, message: '' });

    const showConfirmationModal = (message, onConfirm) => setConfirmationModal({ isOpen: true, message, onConfirm });
    const closeConfirmationModal = () => setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} });

    const handleConfirmAction = () => {
        if (typeof confirmationModal.onConfirm === 'function') {
            confirmationModal.onConfirm();
        }
        closeConfirmationModal();
    };

    const value = {
        modal, showModal, closeModal,
        confirmationModal, showConfirmationModal, closeConfirmationModal, handleConfirmAction
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => useContext(UIContext);