import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import {
  addDocument,
  updateDocument,
  deleteDocument,
  checkIfDocumentExists,
} from '../../../services/firestoreService';
import {
  IconeCaminhao,
  IconeBusca,
  IconeEditar,
  IconeLixeira,
} from '../../../utils/icons';
import {
  formatarWhatsappParaLink,
  formatarWhatsappParaExibicao,
} from '../../../utils/formatters';
import InputField from '../../../components/ui/forms/InputField';

const GerenciarFornecedoresTab = ({ setActiveTab }) => {
  const { showConfirmationModal, showToast } = useUI();
  const { fornecedores } = useData();
  const [editing, setEditing] = useState(null);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [busca, setBusca] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const nomeInputRef = useRef(null);

  useEffect(() => {
    if (editing && nomeInputRef.current) {
      nomeInputRef.current.focus();
    }
  }, [editing]);

  const filtered = useMemo(
    () =>
      fornecedores.filter((f) =>
        f.nome.toLowerCase().includes(busca.toLowerCase()),
      ),
    [fornecedores, busca],
  );

  const validateForm = async () => {
    const errors = {};
    if (!nome.trim()) {
      errors.nome = 'O nome é obrigatório.';
    } else {
      const exists = await checkIfDocumentExists(
        'fornecedores',
        'nome',
        nome.trim(),
        editing ? editing.id : null,
      );
      if (exists) {
        errors.nome = 'Já existe um fornecedor com este nome.';
      }
    }
    if (!whatsapp.trim()) errors.whatsapp = 'O WhatsApp é obrigatório.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const isValid = await validateForm();
    if (!isValid) return;

    setIsSaving(true);
    const formattedNumber = formatarWhatsappParaLink(whatsapp);
    const data = {
      nome: nome.trim(),
      whatsapp: formattedNumber,
      observacoes: observacoes || null,
    };
    try {
      if (editing) {
        await updateDocument('fornecedores', editing.id, data);
        showToast('Fornecedor atualizado!');
      } else {
        await addDocument('fornecedores', data);
        showToast('Fornecedor salvo!');
      }
      resetForm();
    } catch (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (f) => {
    setEditing(f);
    setNome(f.nome);
    setWhatsapp(f.whatsapp);
    setObservacoes(f.observacoes || '');
    setFormErrors({});
  };
  const handleDelete = (id) => {
    showConfirmationModal(
      'Tem certeza que deseja apagar este fornecedor?',
      async () => {
        try {
          await deleteDocument('fornecedores', id);
          showToast('Fornecedor apagado.');
        } catch (error) {
          showToast('Erro ao apagar: ' + error.message, 'error');
        }
      },
    );
  };
  const resetForm = () => {
    setEditing(null);
    setNome('');
    setWhatsapp('');
    setObservacoes('');
    setFormErrors({});
  };

  return (
    <div className="card" data-cy="card-gerenciar-fornecedores">
      <h2>
        <IconeCaminhao /> Gerenciar Fornecedores
      </h2>
      <form onSubmit={handleSave}>
        <InputField
          data-cy="input-fornecedor-nome"
          label="Nome"
          type="text"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            setFormErrors((prev) => ({ ...prev, nome: '' }));
          }}
          placeholder="Nome da empresa"
          required
          error={formErrors.nome}
          ref={nomeInputRef}
        />
        <InputField
          data-cy="input-fornecedor-whatsapp"
          label="WhatsApp"
          type="text"
          value={whatsapp}
          onChange={(e) => {
            setWhatsapp(e.target.value);
            setFormErrors((prev) => ({ ...prev, whatsapp: '' }));
          }}
          placeholder="(XX) XXXXX-XXXX"
          required
          error={formErrors.whatsapp}
        />
        <InputField
          data-cy="input-fornecedor-obs"
          label="Observações"
          type="text"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Ex: Entregas às terças"
        />
        <button
          data-cy="btn-adicionar-fornecedor"
          type="submit"
          className="button-primary"
          disabled={isSaving}
        >
          {isSaving
            ? editing
              ? 'Atualizando...'
              : 'Adicionando...'
            : editing
              ? 'Atualizar'
              : 'Adicionar'}
        </button>
        {editing && (
          <button type="button" onClick={resetForm} className="button-link">
            Cancelar Edição
          </button>
        )}
      </form>
      <div className="divider" />
      <div className="form-group">
        <InputField
          label="Procurar fornecedor"
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Procurar fornecedor..."
          icon={IconeBusca}
        />
      </div>
      <div className="list-container">
        {filtered.length > 0 ? (
          filtered.map((f) => (
            <div key={f.id} className="list-item">
              <div className="list-item-info">
                <p>
                  <strong>{f.nome}</strong>
                </p>
                <a
                  href={`https://wa.me/${f.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formatarWhatsappParaExibicao(f.whatsapp)}
                </a>
                {f.observacoes && (
                  <p className="sub-text">Obs: {f.observacoes}</p>
                )}
              </div>
              <div className="list-item-actions">
                <button
                  className="button-icon"
                  onClick={() => handleEdit(f)}
                  aria-label={`Editar ${f.nome}`}
                >
                  <IconeEditar />
                </button>
                <button
                  className="button-icon danger"
                  onClick={() => handleDelete(f.id)}
                  aria-label={`Apagar ${f.nome}`}
                >
                  <IconeLixeira />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <IconeCaminhao />
            <h3>Nenhum Fornecedor Registrado</h3>
            <p className="sub-text">
              Registre seu primeiro fornecedor no formulário acima.
            </p>
            <button
              className="button-primary"
              onClick={() => setActiveTab('insumos')}
            >
              Agora, registre um insumo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default GerenciarFornecedoresTab;
