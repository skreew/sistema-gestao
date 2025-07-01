import React, { useState } from 'react';
import { useAuth } from '../../context/Auth';
import { useUI } from '../../context/UIContext';
import { IconeCaminhao } from '../../utils/icons';
import InputField from '../ui/forms/InputField';

function getFriendlyAuthError(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'E-mail ou palavra-passe inválidos.';
        case 'auth/invalid-email':
            return 'O formato do e-mail é inválido.';
        default:
            return 'Ocorreu um erro. Verifique a sua conexão e as credenciais do Firebase.';
    }
}

const AccessSelectionPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const { loginUser } = useAuth();
    const { showToast } = useUI();

    const validateLoginForm = () => {
        const errors = {};
        if (!email) errors.email = "O e-mail é obrigatório.";
        if (!password) errors.password = "A palavra-passe é obrigatória.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateLoginForm()) return;
        setIsSaving(true);
        try {
            await loginUser(email, password);
            // O login bem-sucedido irá redirecionar automaticamente através do AuthProvider
        } catch (error) {
            showToast(getFriendlyAuthError(error.code), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card card">
                <h1><IconeCaminhao /> Sistema de Gestão</h1>
                <form onSubmit={handleLogin}>
                    <h3>Aceder ao Sistema</h3>
                    <InputField
                        data-cy="input-email-login"
                        label="E-mail"
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setFormErrors(prev => ({ ...prev, email: '' })); }}
                        placeholder="seu-email@exemplo.com"
                        required
                        error={formErrors.email}
                    />
                    <InputField
                        data-cy="input-senha-login"
                        label="Palavra-passe"
                        type="password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setFormErrors(prev => ({ ...prev, password: '' })); }}
                        placeholder="Sua palavra-passe"
                        required
                        error={formErrors.password}
                    />
                    <button data-cy="btn-login-submit" type="submit" className="button-primary" style={{width: '100%', marginTop: '1rem'}} disabled={isSaving}>
                        {isSaving ? 'A entrar...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AccessSelectionPage;