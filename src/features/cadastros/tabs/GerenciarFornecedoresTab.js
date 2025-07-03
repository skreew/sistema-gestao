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
import { formatarWhatsappParaExibicao } from '../../../utils/formatters';
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
    console.log('--- Executando validateForm ---');
    const errors = {};
    const numeroLimpo = whatsapp.replace(/\D/g, '');
    console.log(`Número de WhatsApp limpo para verificação: '${numeroLimpo}'`);
    console.log(
      `Verificando se é edição. ID do documento sendo editado: ${editing}`,
    );

    if (!nome.trim()) errors.nome = 'O nome é obrigatório.';
    if (!numeroLimpo) errors.whatsapp = 'O WhatsApp é obrigatório.';
    else {
      const isDuplicate = await checkIfDocumentExists(
        'fornecedores',
        'whatsapp',
        numeroLimpo,
        editing,
      );
      console.log(
        `Resultado da verificação de duplicidade: isDuplicate = ${isDuplicate}`,
      );
      if (isDuplicate) {
        console.log(
          'ERRO: Duplicidade encontrada! Adicionando erro ao formulário.',
        );
        errors.whatsapp = 'Este número de WhatsApp já está cadastrado.';
      }
    }

    setFormErrors(errors);
    const formIsValid = Object.keys(errors).length === 0;
    console.log(`Validação concluída. Formulário é válido? ${formIsValid}`);
    return formIsValid;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    console.log('--- Botão Salvar/Atualizar Clicado ---');
    if (isSaving) return;

    const isValid = await validateForm();
    if (!isValid) {
      console.log('O formulário é INVÁLIDO. Abortando salvamento.');
      return;
    }

    console.log('O formulário é VÁLIDO. Prosseguindo com o salvamento.');
    setIsSaving(true);
    // ... o resto da função de salvar continua igual
    const numeroLimpo = whatsapp.replace(/\D/g, '');
    const data = {
      nome: nome.trim(),
      whatsapp: numeroLimpo,
      observacoes: observacoes.trim() || null,
    };

    try {
      if (editing) {
        console.log(`EXECUTANDO ATUALIZAÇÃO para o ID: ${editing}`);
        await updateDocument('fornecedores', editing, data);
        showToast('Fornecedor atualizado!');
      } else {
        console.log(`EXECUTANDO CRIAÇÃO de novo fornecedor.`);
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
    console.log(`--- Clicado em EDITAR no fornecedor ID: ${f.id} ---`);
    setEditing(f.id);
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
    console.log('--- Limpando o formulário (resetForm) ---');
    setEditing(null);
    setNome('');
    setWhatsapp('');
    setObservacoes('');
    setFormErrors({});
  };

  return (
    <div className="card" data-cy="card-gerenciar-fornecedores">
      {/* O JSX aqui continua o mesmo */}
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
          </div>
        )}
      </div>
    </div>
  );
};
export default GerenciarFornecedoresTab;
