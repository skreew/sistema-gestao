import React from 'react';

const Modal = ({ children, onConfirm, showCancel, onCancel, title, confirmText = "Fechar" }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            {title && <h2>{title}</h2>}
            <div className="modal-body">
                {typeof children === 'string' ? <p>{children}</p> : children}
            </div>
            <div className="modal-actions">
                {showCancel && <button onClick={onCancel} className="button-secondary">Cancelar</button>}
                <button data-cy="modal-confirm-button" onClick={onConfirm} className="button-primary">{confirmText}</button>
            </div>
        </div>
    </div>
);

export default Modal;