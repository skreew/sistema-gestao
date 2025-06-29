import React from 'react';
import { IconeCmv } from '../../utils/icons';

const GestorLoginPage = ({ onLogin, onBack, email, setEmail, password, setPassword }) => {
    return (
        <div className="login-container">
            <div className="login-card card">
                <h1 className="login-title"><IconeCmv /> Acesso Gestor</h1>
                <form onSubmit={onLogin}>
                    <div className="form-group">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
                    </div>
                    <div className="form-group">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
                    </div>
                    <button type="submit" className="button-primary large">Entrar</button>
                </form>
                <button type="button" onClick={onBack} className="button-link">Voltar</button>
            </div>
        </div>
    );
};

export default GestorLoginPage;