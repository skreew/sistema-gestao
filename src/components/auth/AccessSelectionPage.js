import React from 'react';
import { IconeCaminhao } from '../../utils/icons';

const AccessSelectionPage = ({ onColaborador, onShowGestorLogin }) => {
    return (
        <div className="login-container">
            <div className="login-card card">
                <h1 className="login-title"><IconeCaminhao /> Sistema de Pedidos</h1>
                <p className="login-subtitle">Escolha seu tipo de acesso</p>
                <div className="access-selection">
                    <button onClick={onColaborador} className="button-primary large">Sou Colaborador</button>
                    <button onClick={onShowGestorLogin} className="button-link">Sou Gestor</button>
                </div>
            </div>
        </div>
    );
};

export default AccessSelectionPage;