import React, { useState } from 'react';
import { useAuth } from '../../context/Auth';
import { useUI } from '../../context/UIContext';
import { IconeUsers } from '../../utils/icons';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';
// import { getAuth } from 'firebase/auth'; // Removido import não utilizado

function getFriendlyRegistrationError(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está sendo utilizado por outra conta.';
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Utilize pelo menos 6 caracteres.';
    default:
      return 'Ocorreu um erro desconhecido ao registrar o usuário.';
  }
}

const UserManagementView = () => {
  const { registerUser } = useAuth();
  const { showToast } = useUI();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('colaborador');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'O e-mail é obrigatório.';
    if (!password) errors.password = 'A senha é obrigatória.';
    if (password.length < 6)
      errors.password = 'A senha deve ter no mínimo 6 caracteres.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);

    try {
      await registerUser(email, password, role);
      showToast(`Usuário ${email} (${role}) criado com sucesso!`, 'success');

      setEmail('');
      setPassword('');
      setRole('colaborador');
      setFormErrors({});
    } catch (error) {
      showToast(getFriendlyRegistrationError(error.code), 'error');
    } finally {
      console.log('Sessão do gestor mantida.');
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>
          <IconeUsers /> Gestão de Usuários
        </h2>
        <p>
          Registre novos colaboradores ou gestores para o sistema. Eles poderão
          acessar utilizando o e-mail e a senha definidos aqui.
        </p>
      </div>
      <div className="card">
        <h3>Registrar Novo Usuário</h3>
        <form onSubmit={handleRegister}>
          <InputField
            label="E-mail do Novo Usuário"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormErrors((p) => ({ ...p, email: '' }));
            }}
            placeholder="email@exemplo.com"
            required
            error={formErrors.email}
          />
          <InputField
            label="Senha Provisória"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormErrors((p) => ({ ...p, password: '' }));
            }}
            placeholder="Mínimo 6 caracteres"
            required
            error={formErrors.password}
          />
          <SelectField
            label="Perfil de Acesso"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              {
                value: 'colaborador',
                label: 'Colaborador (Acesso a Pedidos e Catálogo)',
              },
              { value: 'gestor', label: 'Gestor (Acesso a todas as áreas)' },
            ]}
            required
          />
          <button type="submit" className="button-primary" disabled={isSaving}>
            {isSaving ? 'Registrando...' : 'Registrar Usuário'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserManagementView;
