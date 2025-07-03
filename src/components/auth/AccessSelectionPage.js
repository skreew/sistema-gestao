import React, { useState } from 'react';
import { useAuth } from '../../context/Auth';
import { useUI } from '../../context/UIContext';
import { IconeUsers } from '../../utils/icons';
import InputField from '../ui/forms/InputField';

const AccessSelectionPage = () => {
  const { loginUser } = useAuth();
  const { showToast } = useUI();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'E-mail é obrigatório.';
    if (!password) errors.password = 'Senha é obrigatória.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoggingIn(true);
    try {
      await loginUser(email, password);
      showToast('Login bem-sucedido!');
    } catch (error) {
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        errorMessage = 'E-mail ou senha inválidos.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Formato de e-mail inválido.';
      }
      showToast(errorMessage, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card card">
        <h1>
          <IconeUsers className="text-cor-primaria" /> Sistema de Gestão
        </h1>
        <p className="text-gray-600 mb-8">Faça login para acessar o sistema.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="seu.email@exemplo.com"
            required
            error={formErrors.email}
            icon={IconeUsers}
          />
          {/* Reutilizando IconeUsers para senha para simplicidade, pode ser alterado para um ícone de cadeado se disponível */}
          <InputField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="Sua senha"
            required
            error={formErrors.password}
            icon={IconeUsers}
          />
          <button
            type="submit"
            className="button-primary w-full py-3 text-lg"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Acessando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccessSelectionPage;
