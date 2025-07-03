import React, { useState, useMemo } from 'react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import {
  addDocument,
  addPurchaseTransaction,
  checkIfDocumentExists,
} from '../../../services/firestoreService';
// A importação de formatarData foi removida, e a de formatarValor foi mantida.
import { formatarValor, formatarValorPreciso } from '../../../utils/formatters';
import Modal from '../../../components/ui/Modal';
import InputField from '../../../components/ui/forms/InputField';
import SelectField from '../../../components/ui/forms/SelectField';

// O componente QuickAddFornecedorModal continua o mesmo, já está correto.
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
      if (isDuplicate) {
        errors.whatsapp = 'Este número de WhatsApp já está cadastrado.';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const isValid = await validateForm();
    if (!isValid) return;

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
      showToast('Erro ao salvar: ' + error.message, 'error');
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
            setFormErrors((prev) => ({ ...prev, nome: '' }));
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
            setFormErrors((prev) => ({ ...prev, whatsapp: '' }));
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

// O componente QuickAddInsumoModal também continua o mesmo.
const QuickAddInsumoModal = ({ onClose, onInsumoAdded }) => {
  const [nome, setNome] = useState('');
  const [unidadeAnalise, setUnidadeAnalise] = useState('kg');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { showToast } = useUI();

  const validateForm = () => {
    const errors = {};
    if (!nome.trim()) errors.nome = 'O nome do insumo é obrigatório.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    try {
      const docRef = await addDocument('produtosDeCompra', {
        nome: nome.trim(),
        unidadeAnalise,
      });
      showToast('Insumo registrado!');
      onInsumoAdded(docRef.id);
      onClose();
    } catch (error) {
      showToast('Erro ao registrar insumo: ' + error.message, 'error');
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
            setFormErrors((prev) => ({ ...prev, nome: '' }));
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

const RegistrarCompraTab = () => {
  const { showToast } = useUI();
  const { fornecedores, produtosDeCompra } = useData();
  const [purchaseForm, setPurchaseForm] = useState({
    insumoId: '',
    fornecedorId: '',
    dataCompra: new Date().toISOString().split('T')[0],
    quantidadeComprada: '',
    precoTotalNota: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showQuickAddFornecedor, setShowQuickAddFornecedor] = useState(false);
  const [showQuickAddInsumo, setShowQuickAddInsumo] = useState(false);

  const selectedInsumo = useMemo(
    () => produtosDeCompra.find((p) => p.id === purchaseForm.insumoId),
    [produtosDeCompra, purchaseForm.insumoId],
  );

  const lastPriceForSelectedInsumo = useMemo(() => {
    if (!selectedInsumo?.historicoPrecos?.length) return null;

    return [...selectedInsumo.historicoPrecos]
      .filter((rec) => rec.tipo === 'compra')
      .sort(
        (a, b) => (b.data.seconds || b.data) - (a.data.seconds || a.data),
      )[0];
  }, [selectedInsumo]);

  const resetPurchaseForm = () => {
    setPurchaseForm({
      insumoId: '',
      fornecedorId: '',
      dataCompra: new Date().toISOString().split('T')[0],
      quantidadeComprada: '',
      precoTotalNota: '',
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!purchaseForm.insumoId) errors.insumoId = 'Selecione um insumo.';
    if (!purchaseForm.fornecedorId)
      errors.fornecedorId = 'Selecione um fornecedor.';
    if (
      isNaN(
        parseFloat(String(purchaseForm.quantidadeComprada).replace(',', '.')),
      ) ||
      parseFloat(String(purchaseForm.quantidadeComprada).replace(',', '.')) <= 0
    )
      errors.quantidadeComprada = 'Quantidade inválida.';
    if (
      isNaN(
        parseFloat(String(purchaseForm.precoTotalNota).replace(',', '.')),
      ) ||
      parseFloat(String(purchaseForm.precoTotalNota).replace(',', '.')) <= 0
    )
      errors.precoTotalNota = 'Preço total inválido.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePurchaseFormChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    const {
      insumoId,
      fornecedorId,
      dataCompra,
      quantidadeComprada,
      precoTotalNota,
    } = purchaseForm;
    const qtd = parseFloat(String(quantidadeComprada).replace(',', '.'));
    const precoTotal = parseFloat(String(precoTotalNota).replace(',', '.'));

    try {
      const precoPorUnidadeAnalise = precoTotal / qtd;
      const purchaseRecord = {
        tipo: 'compra',
        fornecedorId,
        data: new Date(dataCompra),
        precoTotalNota: precoTotal,
        quantidadeComprada: qtd,
        unidadeComprada: selectedInsumo.unidadeAnalise,
        precoPorUnidadeAnalise,
      };

      const expenseRecord = {
        valor: precoTotal,
        data: new Date(dataCompra),
        descricao: `Compra de ${selectedInsumo.nome}`,
        categoria: 'Insumos',
      };

      await addPurchaseTransaction(insumoId, purchaseRecord, expenseRecord);
      showToast(
        `Compra registrada para ${selectedInsumo.nome} e despesa no Fluxo de Caixa!`,
      );
      resetPurchaseForm();
    } catch (error) {
      showToast('Erro ao registrar compra: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <h3>Registrar Nova Compra</h3>
      <form onSubmit={handleSavePurchase}>
        <SelectField
          label="Insumo"
          name="insumoId"
          value={purchaseForm.insumoId}
          onChange={handlePurchaseFormChange}
          options={[
            { value: '', label: 'Selecione um insumo...', disabled: true },
            ...produtosDeCompra.map((p) => ({
              value: p.id,
              label: `${p.nome} (${p.unidadeAnalise})`,
            })),
          ]}
          required
          error={formErrors.insumoId}
        />
        <button
          type="button"
          className="button-link"
          onClick={() => setShowQuickAddInsumo(true)}
          style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}
        >
          + Novo Insumo
        </button>
        {selectedInsumo && lastPriceForSelectedInsumo && (
          <p
            className="sub-text"
            style={{ marginTop: '0.5rem', color: 'var(--cor-primaria-escura)' }}
          >
            Último preço pago:{' '}
            <strong>
              {formatarValor(lastPriceForSelectedInsumo.precoPorUnidadeAnalise)}
              /{selectedInsumo.unidadeAnalise}
            </strong>{' '}
            (Fornecedor:{' '}
            {fornecedores.find(
              (f) => f.id === lastPriceForSelectedInsumo.fornecedorId,
            )?.nome || 'N/A'}
            )
          </p>
        )}

        <SelectField
          label="Fornecedor"
          name="fornecedorId"
          value={purchaseForm.fornecedorId}
          onChange={handlePurchaseFormChange}
          options={[
            { value: '', label: 'Selecione um fornecedor...', disabled: true },
            ...fornecedores.map((f) => ({ value: f.id, label: f.nome })),
          ]}
          required
          error={formErrors.fornecedorId}
        />
        <button
          type="button"
          className="button-link"
          onClick={() => setShowQuickAddFornecedor(true)}
          style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}
        >
          + Novo Fornecedor
        </button>

        <InputField
          label="Data da Compra"
          name="dataCompra"
          type="date"
          value={purchaseForm.dataCompra}
          onChange={handlePurchaseFormChange}
          required
          error={formErrors.dataCompra}
        />

        <div className="form-group-inline">
          <InputField
            label={`Quantidade Comprada (${selectedInsumo?.unidadeAnalise || 'un'})`}
            name="quantidadeComprada"
            type="text"
            value={purchaseForm.quantidadeComprada}
            onChange={handlePurchaseFormChange}
            placeholder={`Ex: 25`}
            required
            error={formErrors.quantidadeComprada}
          />
          <InputField
            label="Preço Total na Nota (R$)"
            name="precoTotalNota"
            type="text"
            value={purchaseForm.precoTotalNota}
            onChange={handlePurchaseFormChange}
            placeholder="Ex: 120.00"
            required
            error={formErrors.precoTotalNota}
          />
        </div>

        {purchaseForm.quantidadeComprada &&
          purchaseForm.precoTotalNota &&
          !isNaN(
            parseFloat(
              String(purchaseForm.quantidadeComprada).replace(',', '.'),
            ),
          ) &&
          !isNaN(
            parseFloat(String(purchaseForm.precoTotalNota).replace(',', '.')),
          ) && (
            <p
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                marginTop: '1rem',
              }}
            >
              Custo por {selectedInsumo?.unidadeAnalise || 'un'}:{' '}
              {formatarValor(
                parseFloat(
                  String(purchaseForm.precoTotalNota).replace(',', '.'),
                ) /
                  parseFloat(
                    String(purchaseForm.quantidadeComprada).replace(',', '.'),
                  ),
              )}
            </p>
          )}

        <button type="submit" className="button-primary" disabled={isSaving}>
          {isSaving ? 'Registrando...' : 'Registrar Compra'}
        </button>
        <button
          type="button"
          onClick={resetPurchaseForm}
          className="button-link"
        >
          Limpar Formulário
        </button>
      </form>

      {showQuickAddFornecedor && (
        <QuickAddFornecedorModal
          onClose={() => setShowQuickAddFornecedor(false)}
          onFornecedorAdded={(id) =>
            setPurchaseForm((prev) => ({ ...prev, fornecedorId: id }))
          }
        />
      )}
      {showQuickAddInsumo && (
        <QuickAddInsumoModal
          onClose={() => setShowQuickAddInsumo(false)}
          onInsumoAdded={(id) =>
            setPurchaseForm((prev) => ({ ...prev, insumoId: id }))
          }
        />
      )}
    </div>
  );
};

export default RegistrarCompraTab;
