import React, { createContext, useState, useContext } from 'react';
import toast from 'react-hot-toast';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [modal, setModal] = useState({ isOpen: false, message: '' });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast(message);
  };

  const showModal = (message) => setModal({ isOpen: true, message });
  const closeModal = () => setModal({ isOpen: false, message: '' });

  const showConfirmationModal = (message, onConfirm) =>
    setConfirmationModal({ isOpen: true, message, onConfirm });
  const closeConfirmationModal = () =>
    setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} });

  const handleConfirmAction = () => {
    if (typeof confirmationModal.onConfirm === 'function') {
      confirmationModal.onConfirm();
    }
    closeConfirmationModal();
  };

  const value = {
    modal,
    showModal,
    closeModal,
    confirmationModal,
    showConfirmationModal,
    closeConfirmationModal,
    handleConfirmAction,
    showToast,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => useContext(UIContext);
