import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { useData } from '../../context/DataContext'; # Importação corrigida
import { useUI } from '../../context/UIContext';
import { addDocumentToSubcollection } from '../../services/firestoreService';
import { formatarValorPreciso } from '../../utils/formatters';

const RegistrarCompraModal = ({ item, onClose }) => {
    const { fornecedores } = useData();
    const { showModal } = useUI();
    const [fornecedorId, setFornecedorId] = useState('');
    const [dataCompra, setDataCompra] = useState(new Date().toISOString().split('T')[0]);
    const [quantidadeComprada, setQuantidadeComprada] = useState('');
    const [precoTotalNota, setPrecoTotalNota] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        const qtd = parseFloat(String(quantidadeComprada).replace(',', '.'));
        const precoTotal = parseFloat(String(precoTotalNota).replace(',', '.'));
        if (!fornecedorId || isNaN(qtd) || qtd <= 0 || isNaN(precoTotal) || precoTotal <= 0) {
            showModal("Preencha todos os campos corretamente."); return;
        }
        const precoPorUnidadeAnalise = precoTotal / qtd;
        const purchaseRecord = {
            fornecedorId,
            dataCompra: new Date(dataCompra),
            precoTotalNota: precoTotal,
            quantidadeComprada: qtd,
            unidadeComprada: item.unidadeAnalise, // Unidade da compra é a unidade de análise
            precoPorUnidadeAnalise,
        };
        try {
            await addDocumentToSubcollection("produtosDeCompra", item.id, "historicoPrecos", purchaseRecord);
            showModal(`Compra registrada! Novo custo por ${item.unidadeAnalise}: ${formatarValorPreciso(precoPorUnidadeAnalise)}`);
            onClose();
        } catch (error) { showModal("Erro ao registrar compra: " + error.message); }
    };

    return (
        <Modal title={`Registrar Compra: "${item.nome}"`} onConfirm={handleRegister} showCancel={true} onCancel={onClose} confirmText="Registrar">
            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <label>Fornecedor</label>
                    <select value={fornecedorId} onChange={e => setFornecedorId(e.target.value)} required aria-label="Selecione o fornecedor">
                        <option value="">Selecione...</option>
                        {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                    </select>
                </div>
                <div className="form-group-inline">
                    <div className="form-group">
                        <label>Qtd. Comprada ({item.unidadeAnalise})</label>
                        <input type="text" value={quantidadeComprada} onChange={e => setQuantidadeComprada(e.target.value)} required aria-label={`Quantidade comprada em ${item.unidadeAnalise}`}/>
                    </div>
                    <div className="form-group">
                        <label>Preço Total da Nota (R$)</label>
                        <input type="text" value={precoTotalNota} onChange={e => setPrecoTotalNota(e.target.value)} required aria-label="Preço total na nota fiscal"/>
                    </div>
                </div>
                <div className="form-group"><label>Data da Compra</label><input type="date" value={dataCompra} onChange={e => setDataCompra(e.target.value)} required /></div>
                {quantidadeComprada && precoTotalNota && !isNaN(parseFloat(quantidadeComprada)) && !isNaN(parseFloat(precoTotalNota)) && (
                    <p style={{textAlign: 'center', fontWeight: 'bold'}}>Custo por {item.unidadeAnalise}: {formatarValorPreciso(parseFloat(precoTotalNota)/parseFloat(quantidadeComprada))}</p>
                )}
            </form>
        </Modal>
    );
};
export default RegistrarCompraModal;