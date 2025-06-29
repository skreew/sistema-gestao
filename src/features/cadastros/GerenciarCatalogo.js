import React, { useState, useMemo } from 'react';
import { useUI } from '../../context/UIContext';
import { useData } from '../../context/DataContext';
import { addDocument, updateDocument, deleteDocument } from '../../services/firestoreService';
import { IconeCatalogo, IconeBusca, IconeEditar, IconeLixeira } from '../../utils/icons';

const GerenciarCatalogo = () => {
    const { showModal, showConfirmationModal } = useUI();
    const { produtosDeCompra, fornecedores } = useData();

    const initialState = {
        nome: '',
        fornecedorId: '',
        detalheCompra: {
            tipoBase: 'peso',
            unidadeCompra: '',
            conteudo: '',
            unidadeConteudo: 'kg',
        },
    };

    const [editing, setEditing] = useState(null);
    const [formState, setFormState] = useState(initialState);
    const [busca, setBusca] = useState('');

    const produtosFiltrados = useMemo(() =>
        produtosDeCompra.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())),
      [produtosDeCompra, busca]
    );

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("detalheCompra.")) {
            const field = name.split('.')[1];
            if (field === 'tipoBase') {
                const newUnit = value === 'peso' ? 'kg' : 'ml';
                setFormState(prev => ({...prev, detalheCompra: {...prev.detalheCompra, tipoBase: value, unidadeConteudo: newUnit}}));
            } else {
                setFormState(prev => ({...prev, detalheCompra: {...prev.detalheCompra, [field]: value}}));
            }
        } else {
            setFormState(prev => ({ ...prev, [name]: value }));
        }
    };

    const calcularMedidaPadrao = (detalhe) => {
        const { tipoBase, conteudo, unidadeConteudo } = detalhe;
        const valor = parseFloat(String(conteudo).replace(',', '.'));
        if (isNaN(valor)) return null;

        if (tipoBase === 'peso') return { valor: unidadeConteudo === 'kg' ? valor * 1000 : valor, unidade: 'g' };
        if (tipoBase === 'volume') return { valor: unidadeConteudo === 'L' ? valor * 1000 : valor, unidade: 'ml' };
        if (tipoBase === 'unidade') return { valor: valor, unidade: 'un' };
        return null;
    };

    const handleSalvar = async (e) => {
        e.preventDefault();
        const { nome, fornecedorId, detalheCompra } = formState;
        if (!nome || !fornecedorId || !detalheCompra.unidadeCompra || !detalheCompra.conteudo) {
            showModal("Preencha todos os campos obrigatórios do produto.");
            return;
        }
        const medidaPadrao = calcularMedidaPadrao(detalheCompra);
        if (!medidaPadrao) {
            showModal("Medida inválida. Verifique os valores de conteúdo.");
            return;
        }
        const dataToSave = { nome, fornecedorId, detalheCompra, medidaPadrao };

        try {
            if (editing) {
                await updateDocument("produtosDeCompra", editing.id, dataToSave);
                showModal("Produto atualizado!");
            } else {
                await addDocument("produtosDeCompra", dataToSave);
                showModal("Produto salvo no catálogo!");
            }
            resetForm();
        } catch (error) {
            showModal("Erro ao salvar: " + error.message);
        }
    };

    const handleEditar = (produto) => {
        setEditing(produto);
        setFormState({
            nome: produto.nome,
            fornecedorId: produto.fornecedorId,
            detalheCompra: produto.detalheCompra
        });
    };

    const handleDelete = (id) => {
         showConfirmationModal("Excluir este produto do catálogo?", async () => {
            try {
                await deleteDocument("produtosDeCompra", id);
                showModal("Produto excluído.");
            } catch (error) {
                showModal("Erro ao excluir: " + error.message);
            }
        });
    };

    const resetForm = () => { setEditing(null); setFormState(initialState); };

    const formatarDetalheCompraParaExibicao = (detalhe) => {
        if (!detalhe || !detalhe.unidadeCompra) return '';
        return `${detalhe.unidadeCompra} de ${detalhe.conteudo} ${detalhe.unidadeConteudo || ''}`;
    };

    return (
        <div className="card">
            <h2><IconeCatalogo /> Gerenciar Catálogo de Compra</h2>
            <form onSubmit={handleSalvar}>
                <div className="form-group"><label>Nome do Produto no Catálogo</label><input name="nome" type="text" value={formState.nome} onChange={handleFormChange} placeholder="Ex: Queijo Mussarela Peça" required /></div>
                <div className="form-group"><label>Como o produto é medido?</label><select name="detalheCompra.tipoBase" value={formState.detalheCompra.tipoBase} onChange={handleFormChange}><option value="peso">Por Peso (g, kg)</option><option value="volume">Por Volume (ml, L)</option><option value="unidade">Por Unidade (un, cx, pct)</option></select></div>
                <div className="form-group-inline">
                    <div className="form-group"><label>Forma de Compra</label><input name="detalheCompra.unidadeCompra" type="text" value={formState.detalheCompra.unidadeCompra} onChange={handleFormChange} placeholder="Ex: Peça, Caixa" required /></div>
                    {(formState.detalheCompra.tipoBase === 'peso' || formState.detalheCompra.tipoBase === 'volume') && (<><div className="form-group"><label>Quantidade</label><input name="detalheCompra.conteudo" type="text" value={formState.detalheCompra.conteudo} onChange={handleFormChange} placeholder="Ex: 2.5" required /></div><div className="form-group"><label>Medida</label><select name="detalheCompra.unidadeConteudo" value={formState.detalheCompra.unidadeConteudo} onChange={handleFormChange}>{formState.detalheCompra.tipoBase === 'peso' ? (<><option value="kg">kg</option><option value="g">g</option></>) : (<><option value="L">L</option><option value="ml">ml</option></>)}</select></div></>)}
                    {formState.detalheCompra.tipoBase === 'unidade' && (<div className="form-group"><label>Nº de Itens</label><input name="detalheCompra.conteudo" type="number" value={formState.detalheCompra.conteudo} onChange={handleFormChange} placeholder="Ex: 12" required /></div>)}
                </div>
                <div className="form-group"><label>Fornecedor Padrão</label><select name="fornecedorId" value={formState.fornecedorId} onChange={handleFormChange} required><option value="">Selecione...</option>{fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}</select></div>
                <button type="submit" className="button-primary">{editing ? 'Atualizar Produto' : 'Salvar Novo Produto'}</button>
                {editing && <button type="button" onClick={resetForm} className="button-link">Cancelar</button>}
            </form>
            <div className="divider" />
            <div className="form-group"><label>Buscar Produto</label><div className="input-with-icon"><IconeBusca /><input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Digite para buscar..." /></div></div>
            <div className="list-container">
                {produtosFiltrados.map(p => (
                    <div key={p.id} className="list-item">
                        <div className="list-item-info">
                            <p><strong>{p.nome}</strong></p>
                            <p className="sub-text">Detalhe: {formatarDetalheCompraParaExibicao(p.detalheCompra)}</p>
                            <p className="sub-text">Padrão: {p.medidaPadrao.valor}{p.medidaPadrao.unidade}</p>
                            <p className="sub-text">Fornecedor: {fornecedores.find(f => f.id === p.fornecedorId)?.nome || 'N/A'}</p>
                        </div>
                        <div className="list-item-actions">
                            <button className="button-icon" onClick={() => handleEditar(p)}><IconeEditar /></button>
                            <button className="button-icon" onClick={() => handleDelete(p.id)}><IconeLixeira /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default GerenciarCatalogo;