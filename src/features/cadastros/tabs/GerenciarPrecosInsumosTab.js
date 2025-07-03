import React, { useState, useMemo } from 'react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import {
  addDocument,
  addDocumentToSubcollection,
  checkIfDocumentExists,
} from '../../../services/firestoreService';
import { IconeCaixa, IconeBusca, IconeMais } from '../../../utils/icons';
import { formatarValor, formatarData } from '../../../utils/formatters';
import Modal from '../../../components/ui/Modal';
import InputField from '../../../components/ui/forms/InputField';
import SelectField from '../../../components/ui/forms/SelectField';

// --- COMPONENTES MODAL (AGORA DENTRO DESTE ARQUIVO PARA AGILIZAR) ---

const QuickAddFornecedorModal = ({ onClose, onFornecedorAdded }) => {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { showToast } = useUI();

  const validateForm = async () => {
    const errors = {};
    const numeroLimpo = whatsapp.replace(/\D/g, '');
    if (!nome.trim()) errors.nome = 'O nome é obrigatório.';
    if (!numeroLimpo) errors.whatsapp = 'O WhatsApp é obrigatório.';
    else {
      const isDuplicate = await checkIfDocumentExists(
        'fornecedores',
        'whatsapp',
        numeroLimpo,
      );
      if (isDuplicate)
        errors.whatsapp = 'Este número de WhatsApp já está cadastrado.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving || !(await validateForm())) return;
    setIsSaving(true);
    const numeroLimpo = whatsapp.replace(/\D/g, '');
    try {
      const docRef = await addDocument('fornecedores', {
        nome: nome.trim(),
        whatsapp: numeroLimpo,
        observacoes: null,
      });
      showToast('Fornecedor salvo!');
      onFornecedorAdded(docRef.id);
      onClose();
    } catch (error) {
      showToast(`Erro ao salvar: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title="Novo Fornecedor" showCancel={true} onCancel={onClose}>
      <form onSubmit={handleSave} noValidate>
        <InputField
          label="Nome"
          type="text"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            setFormErrors({});
          }}
          placeholder="Nome da empresa"
          required
          error={formErrors.nome}
        />
        <InputField
          label="WhatsApp"
          type="text"
          value={whatsapp}
          onChange={(e) => {
            setWhatsapp(e.target.value);
            setFormErrors({});
          }}
          placeholder="(XX) XXXXX-XXXX"
          required
          error={formErrors.whatsapp}
        />
        <div
          className="modal-actions"
          style={{ padding: '1rem 0 0 0', justifyContent: 'flex-end' }}
        >
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button-primary" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const QuickAddInsumoModal = ({ onClose, onInsumoAdded }) => {
  const [nome, setNome] = useState('');
  const [unidadeAnalise, setUnidadeAnalise] = useState('kg');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { showToast } = useUI();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setFormErrors({ nome: 'O nome é obrigatório.' });
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    try {
      const isDuplicate = await checkIfDocumentExists(
        'produtosDeCompra',
        'nome',
        nome.trim(),
      );
      if (isDuplicate) {
        setFormErrors({ nome: 'Este insumo já está cadastrado.' });
        setIsSaving(false);
        return;
      }
      const docRef = await addDocument('produtosDeCompra', {
        nome: nome.trim(),
        unidadeAnalise,
      });
      showToast('Insumo registrado!');
      onInsumoAdded(docRef.id);
      onClose();
    } catch (error) {
      showToast(`Erro ao registrar insumo: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title="Novo Insumo" showCancel={true} onCancel={onClose}>
      <form onSubmit={handleSave} noValidate>
        <InputField
          label="Nome do Insumo"
          type="text"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            setFormErrors({});
          }}
          placeholder="Ex: Farinha de Trigo"
          required
          error={formErrors.nome}
        />
        <SelectField
          label="Unidade para Análise de Custo"
          value={unidadeAnalise}
          onChange={(e) => setUnidadeAnalise(e.target.value)}
          options={[
            { value: 'kg', label: 'Quilograma (kg)' },
            { value: 'L', label: 'Litro (L)' },
            { value: 'un', label: 'Unidade (un)' },
          ]}
          required
        />
        <div
          className="modal-actions"
          style={{ padding: '1rem 0 0 0', justifyContent: 'flex-end' }}
        >
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button-primary" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const GerenciarPrecosInsumosTab = () => {
  const { showToast } = useUI();
  const { produtosDeCompra, fornecedores } = useData();

  const initialState = {
    insumoId: '',
    fornecedorId: '',
    dataOferta: new Date().toISOString().split('T')[0],
    precoPorUnidadeAnalise: '',
    tipoDePreco: 'unitario',
    tipoDePrecoOutroDesc: '',
    quantidadeMinima: '',
    validadeOferta: '',
    condicoesEspeciais: '',
  };

  const [formState, setFormState] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [buscaPreco, setBuscaPreco] = useState('');
  const [showQuickAddFornecedor, setShowQuickAddFornecedor] = useState(false);
  const [showQuickAddInsumo, setShowQuickAddInsumo] = useState(false);

  const selectedInsumo = useMemo(
    () => produtosDeCompra.find((p) => p.id === formState.insumoId),
    [produtosDeCompra, formState.insumoId],
  );
  const filteredInsumos = useMemo(
    () =>
      produtosDeCompra.filter((p) =>
        p.nome.toLowerCase().includes(buscaPreco.toLowerCase()),
      ),
    [produtosDeCompra, buscaPreco],
  );

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSavePreco = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    const {
      insumoId,
      fornecedorId,
      dataOferta,
      precoPorUnidadeAnalise,
      tipoDePreco,
      tipoDePrecoOutroDesc,
      quantidadeMinima,
      validadeOferta,
      condicoesEspeciais,
    } = formState;
    const preco = parseFloat(String(precoPorUnidadeAnalise).replace(',', '.'));

    try {
      const offerRecord = {
        tipo: 'oferta',
        fornecedorId,
        data: new Date(dataOferta),
        precoPorUnidadeAnalise: preco,
        tipoDePreco,
        tipoDePrecoOutroDesc:
          tipoDePreco === 'outro' ? tipoDePrecoOutroDesc.trim() : null,
        quantidadeMinima: quantidadeMinima
          ? parseFloat(quantidadeMinima)
          : null,
        validadeOferta: validadeOferta ? new Date(validadeOferta) : null,
        condicoesEspeciais: condicoesEspeciais.trim() || null,
      };
      await addDocumentToSubcollection(
        'produtosDeCompra',
        insumoId,
        'historicoPrecos',
        offerRecord,
      );
      showToast(`Preço de oferta registrado com sucesso!`);
      resetForm();
    } catch (error) {
      showToast(`Erro ao registrar preço de oferta: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => setFormState(initialState);

  return (
    <div className="card">
      {showQuickAddFornecedor && (
        <QuickAddFornecedorModal
          onClose={() => setShowQuickAddFornecedor(false)}
          onFornecedorAdded={(id) =>
            setFormState((prev) => ({ ...prev, fornecedorId: id }))
          }
        />
      )}
      {showQuickAddInsumo && (
        <QuickAddInsumoModal
          onClose={() => setShowQuickAddInsumo(false)}
          onInsumoAdded={(id) =>
            setFormState((prev) => ({ ...prev, insumoId: id }))
          }
        />
      )}

      <h3>
        {' '}
        <IconeMais /> Registrar Preço de Insumo (Oferta){' '}
      </h3>
      <form onSubmit={handleSavePreco} noValidate>
        <fieldset>
          <legend>Informações Básicas</legend>
          <div className="input-with-button">
            <SelectField
              label="Insumo"
              name="insumoId"
              value={formState.insumoId}
              onChange={handleFormChange}
              options={[
                { value: '', label: 'Selecione um insumo...', disabled: true },
                ...produtosDeCompra.map((p) => ({
                  value: p.id,
                  label: `${p.nome} (${p.unidadeAnalise})`,
                })),
              ]}
              required
              error={formErrors.insumoId}
              aria-label="Selecionar Insumo"
            />
            <button
              type="button"
              onClick={() => setShowQuickAddInsumo(true)}
              className="button-link-add"
            >
              + Novo
            </button>
          </div>
          <div className="input-with-button">
            <SelectField
              label="Fornecedor"
              name="fornecedorId"
              value={formState.fornecedorId}
              onChange={handleFormChange}
              options={[
                {
                  value: '',
                  label: 'Selecione um fornecedor...',
                  disabled: true,
                },
                ...fornecedores.map((f) => ({ value: f.id, label: f.nome })),
              ]}
              required
              error={formErrors.fornecedorId}
              aria-label="Selecionar Fornecedor"
            />
            <button
              type="button"
              onClick={() => setShowQuickAddFornecedor(true)}
              className="button-link-add"
            >
              + Novo
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Detalhes da Oferta</legend>
          <div className="form-grid-2-cols">
            <InputField
              label={`Preço por ${selectedInsumo?.unidadeAnalise || 'Unidade'}`}
              name="precoPorUnidadeAnalise"
              type="number"
              step="0.01"
              value={formState.precoPorUnidadeAnalise}
              onChange={handleFormChange}
              placeholder="Ex: 2.50"
              required
              error={formErrors.precoPorUnidadeAnalise}
              aria-label="Preço por Unidade"
            />
            <InputField
              label={`Qtd. Mínima (${selectedInsumo?.unidadeAnalise || 'Un'})`}
              name="quantidadeMinima"
              type="number"
              step="0.01"
              value={formState.quantidadeMinima}
              onChange={handleFormChange}
              placeholder="Opcional. Ex: 10"
              aria-label="Quantidade Mínima"
            />
          </div>
          <div className="form-grid-2-cols">
            <InputField
              label="Data da Cotação"
              name="dataOferta"
              type="date"
              value={formState.dataOferta}
              onChange={handleFormChange}
              required
              aria-label="Data da Cotação"
            />
            <InputField
              label="Validade da Oferta"
              name="validadeOferta"
              type="date"
              value={formState.validadeOferta}
              onChange={handleFormChange}
              aria-label="Validade da Oferta"
            />
          </div>
          <SelectField
            label="Tipo de Preço"
            name="tipoDePreco"
            value={formState.tipoDePreco}
            onChange={handleFormChange}
            options={[
              { value: 'unitario', label: 'Unitário' },
              { value: 'atacado', label: 'Por Atacado' },
              { value: 'outro', label: 'Outro' },
            ]}
            aria-label="Tipo de Preço"
          />
          {formState.tipoDePreco === 'outro' && (
            <InputField
              label="Descrição do Tipo de Preço"
              name="tipoDePrecoOutroDesc"
              type="text"
              value={formState.tipoDePrecoOutroDesc}
              onChange={handleFormChange}
              placeholder="Ex: Preço promocional"
              error={formErrors.tipoDePrecoOutroDesc}
              aria-label="Descrição do Tipo de Preço"
            />
          )}
          <InputField
            label="Condições Especiais"
            name="condicoesEspeciais"
            type="textarea"
            value={formState.condicoesEspeciais}
            onChange={handleFormChange}
            placeholder="Opcional. Ex: Entrega grátis acima de R$100"
            aria-label="Condições Especiais"
          />
        </fieldset>

        <button
          type="submit"
          className="button-primary"
          disabled={isSaving}
          style={{ marginTop: '1rem' }}
        >
          {' '}
          {isSaving ? 'Registrando...' : 'Registrar Preço'}{' '}
        </button>
        <button type="button" onClick={resetForm} className="button-link">
          {' '}
          Limpar Formulário{' '}
        </button>
      </form>

      <div className="divider" />

      <h3>
        {' '}
        <IconeBusca /> Histórico de Preços de Insumos{' '}
      </h3>
      <div className="form-group">
        <InputField
          label="Procurar Insumo no Histórico"
          type="text"
          value={buscaPreco}
          onChange={(e) => setBuscaPreco(e.target.value)}
          placeholder="Procurar insumo..."
          icon={IconeBusca}
        />
      </div>

      {filteredInsumos.map((insumo) => (
        <div
          key={insumo.id}
          className="card"
          style={{ marginBottom: '1rem', overflowX: 'auto' }}
        >
          <h4>
            {insumo.nome} ({insumo.unidadeAnalise})
          </h4>
          {insumo.historicoPrecos?.length > 0 ? (
            <table className="table-precos">
              <thead>
                <tr>
                  <th>Fornecedor</th>
                  <th>Tipo</th>
                  <th>Qtd. Mín.</th>
                  <th>Preço (R$)</th>
                  <th>Validade</th>
                  <th>Condições</th>
                </tr>
              </thead>
              <tbody>
                {insumo.historicoPrecos.map((precoRec, idx) => (
                  <tr key={precoRec.id || idx}>
                    <td>
                      {fornecedores.find((f) => f.id === precoRec.fornecedorId)
                        ?.nome || 'N/A'}
                    </td>
                    <td>{precoRec.tipoDePreco || precoRec.tipo}</td>
                    <td>
                      {precoRec.quantidadeMinima
                        ? `${precoRec.quantidadeMinima} ${insumo.unidadeAnalise}`
                        : 'N/A'}
                    </td>
                    <td>{formatarValor(precoRec.precoPorUnidadeAnalise)}</td>
                    <td>
                      {precoRec.validadeOferta
                        ? formatarData(precoRec.validadeOferta)
                        : 'N/A'}
                    </td>
                    <td>{precoRec.condicoesEspeciais || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="sub-text">
              Nenhum histórico de preços para este insumo.
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default GerenciarPrecosInsumosTab;
