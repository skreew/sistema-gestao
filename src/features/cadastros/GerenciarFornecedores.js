import React, { useState, useMemo } from 'react';
import { useUI } from '../../context/UIContext';
import { useData } from '../../context/DataContext';
import { addDocument, updateDocument, deleteDocument } from '../../services/firestoreService';
import { IconeCaminhao, IconeBusca, IconeEditar, IconeLixeira } from '../../utils/icons';
import { formatarWhatsappParaLink, formatarWhatsappParaExibicao } from '../../utils/formatters';

const GerenciarFornecedores = () => {
    const { showModal, showConfirmationModal } = useUI();
    const { fornecedores } = useData();
    const [editingFornecedor, setEditingFornecedor] = useState(null);
    const [nome, setNome] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [busca, setBusca] = useState('');

    const fornecedoresFiltrados = useMemo(() =>
        fornecedores.filter(f => f.nome.toLowerCase().includes(busca.toLowerCase())),
        [fornecedores, busca]
    );

    const handleSalvar = async (e) => {
        e.preventDefault();
        const numeroFormatado = formatarWhatsappParaLink(whatsapp);
        if (!nome || !numeroFormatado) {
            showModal('Preencha o nome e um WhatsApp válido.');
            return;
        }
        const data = { nome, whatsapp: numeroFormatado, observacoes: observacoes || null };
        try {
            if (editingFornecedor) {
                await updateDocument("fornecedores", editingFornecedor.id, data);
                showModal('Fornecedor atualizado!');
            } else {
                await addDocument("fornecedores", data);
                showModal('Fornecedor salvo!');
            }
            resetForm();
        } catch (error) {
            showModal('Erro ao salvar: ' + error.message);
        }
    };

    const handleEditar = (fornecedor) => {
        setEditingFornecedor(fornecedor); setNome(fornecedor.nome);
        setWhatsapp(fornecedor.whatsapp); setObservacoes(fornecedor.observacoes || '');
    };

    const handleDelete = (id) => {
        showConfirmationModal("Excluir este fornecedor?", async () => {
            try {
                await deleteDocument("fornecedores", id);
                showModal("Fornecedor excluído.");
            } catch (error) {
                showModal("Erro ao excluir: " + error.message);
            }
        });
    };

    const resetForm = () => {
        setEditingFornecedor(null); setNome('');
        setWhatsapp(''); setObservacoes('');
    };

    return (
        <div className="card" data-cy="card-gerenciar-fornecedores">
            <h2><IconeCaminhao /> Gerenciar Fornecedores</h2>
            <form onSubmit={handleSalvar}>
                <div className="form-group">
                    <label>Nome</label>
                    <input data-cy="input-fornecedor-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da empresa" required />
                </div>
                <div className="form-group">
                    <label>WhatsApp</label>
                    <input data-cy="input-fornecedor-whatsapp" type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(XX) XXXXX-XXXX" required />
                </div>
                <div className="form-group">
                    <label>Observações</label>
                    <input data-cy="input-fornecedor-obs" type="text" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Ex: Entregas às terças" />
                </div>
                <button data-cy="btn-adicionar-fornecedor" type="submit" className="button-primary">{editingFornecedor ? 'Atualizar Fornecedor' : 'Adicionar Fornecedor'}</button>
                {editingFornecedor && <button type="button" onClick={resetForm} className="button-link">Cancelar Edição</button>}
            </form>
            <div className="divider" />
            <div className="form-group">
                <label>Buscar Fornecedor</label>
                <div className="input-with-icon">
                  <span className="icon"><IconeBusca /></span>
                  <input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Digite para buscar..." />
                </div>
            </div>
            <div className="list-container">
                {fornecedoresFiltrados.map(f => (
                    <div key={f.id} className="list-item">
                        <div className="list-item-info">
                            <p><strong>{f.nome}</strong></p>
                            <a href={`https://wa.me/${f.whatsapp}`} target="_blank" rel="noopener noreferrer">{formatarWhatsappParaExibicao(f.whatsapp)}</a>
                            {f.observacoes && <p className='sub-text'>Obs: {f.observacoes}</p>}
                        </div>
                        <div className="list-item-actions">
                            <button className="button-icon" onClick={() => handleEditar(f)}><IconeEditar /></button>
                            <button className="button-icon" onClick={() => handleDelete(f.id)}><IconeLixeira /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GerenciarFornecedores;