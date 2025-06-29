import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { IconeCaminhao } from '../../utils/icons';

const AccessSelectionPage = () => {
    const [view, setView] = useState('selection'); // 'selection', 'login', 'register'
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

// Dentro de AccessSelectionPage.js

const handleRegister = async (e) => {
    e.preventDefault();
    try {
        await registerUser(email, password, 'colaborador');
        // Após o sucesso, mostre o modal
        showModal("Cadastro realizado com sucesso! Você já pode fazer o login.");
        // E MUDE A VIEW PARA LOGIN!
        setView('login'); 
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
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
                        </div>
                        <div className="form-group">
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
                        </div>
                        <button type="submit" className="button-primary" style={{width: '100%'}}>Entrar</button>
                        <button type="button" onClick={() => setView('selection')} className="button-link">Voltar</button>
                    </form>
                );
            case 'register':
                return (
                    <form onSubmit={handleRegister}>
                        <h3>Registrar Novo Usuário</h3>
                        <div className="form-group">
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
                        </div>
                        <div className="form-group">
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha (mínimo 6 caracteres)" required />
                        </div>
                        <button type="submit" className="button-primary" style={{width: '100%'}}>Registrar</button>
                        <button type="button" onClick={() => setView('selection')} className="button-link">Voltar</button>
                    </form>
                );
            default: // selection
                return (
                    <>
                        <p className="login-subtitle">Bem-vindo!</p>
                        <div className="access-selection" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <button onClick={() => setView('login')} className="button-primary large">Entrar</button>
                            <button onClick={() => setView('register')} className="button-secondary large">Registrar Novo Colaborador</button>
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