import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { IconeCaminhao } from '../../utils/icons';

const AccessSelectionPage = () => {
    const [view, setView] = useState('selection');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loginUser, registerUser } = useAuth();
    const { showModal } = useUI();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await loginUser(email, password);
        } catch (error) {
            showModal("E-mail ou senha inválidos. Tente novamente.");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await registerUser(email, password, 'colaborador');
            // O usuário será logado automaticamente pelo onAuthStateChanged
            showModal("Cadastro realizado com sucesso!");
        } catch (error) {
            showModal(`Erro no cadastro: ${error.message}`);
        }
    };

    const renderContent = () => {
        switch (view) {
            case 'login':
                return (
                    <form onSubmit={handleLogin}>
                        <h3>Acessar o Sistema</h3>
                        <div className="form-group">
                            <input data-cy="input-email-login" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
                        </div>
                        <div className="form-group">
                            <input data-cy="input-senha-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
                        </div>
                        <button data-cy="btn-login-submit" type="submit" className="button-primary" style={{width: '100%'}}>Entrar</button>
                        <button type="button" onClick={() => setView('selection')} className="button-link">Voltar</button>
                    </form>
                );
            case 'register':
                return (
                    <form onSubmit={handleRegister}>
                        <h3>Registrar Novo Usuário</h3>
                        <div className="form-group">
                            <input data-cy="input-email-registro" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
                        </div>
                        <div className="form-group">
                            <input data-cy="input-senha-registro" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha (mínimo 6 caracteres)" required />
                        </div>
                        <button data-cy="btn-register-submit" type="submit" className="button-primary" style={{width: '100%'}}>Registrar</button>
                        <button type="button" onClick={() => setView('selection')} className="button-link">Voltar</button>
                    </form>
                );
            default:
                return (
                    <>
                        <p className="login-subtitle">Bem-vindo!</p>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <button data-cy="btn-show-login" onClick={() => setView('login')} className="button-primary large">Entrar</button>
                            <button data-cy="btn-show-register" onClick={() => setView('register')} className="button-secondary large">Registrar Novo Colaborador</button>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="login-container">
            <div className="login-card card">
                <h1 className="login-title"><IconeCaminhao /> Sistema de Pedidos</h1>
                {renderContent()}
            </div>
        </div>
    );
};

export default AccessSelectionPage;