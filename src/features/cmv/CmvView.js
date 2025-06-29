import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { setDocument, incrementField } from '../../services/firestoreService';
import { IconeCmv } from '../../utils/icons';
import { formatarValorPreciso } from '../../utils/formatters';

const CmvView = () => {
    const { produtosDeCompra, insumos } = useData();
    const { showModal } = useUI();
    const [selectedProdutoId, setSelectedProdutoId] = useState('');
    const [valorNota, setValorNota] = useState('');

    const handleUpdateInsumoCost = async (e) => {
        e.preventDefault();
        const produtoSelecionado = produtosDeCompra.find(p => p.id === selectedProdutoId);
        const valor = parseFloat(String(valorNota).replace(',', '.'));

        if (!produtoSelecionado || isNaN(valor) || valor <= 0) {
            showModal("Selecione um produto e insira um valor de nota válido.");
            return;
        }

        const { medidaPadrao } = produtoSelecionado;
        if (!medidaPadrao || !medidaPadrao.valor) {
            showModal("O produto selecionado não tem uma medida padrão calculada. Verifique o cadastro.");
            return;
        }

        const precoFinal = valor / medidaPadrao.valor;

        const insumoData = {
            nome: produtoSelecionado.nome,
            fornecedorId: produtoSelecionado.fornecedorId,
            preco_por_unidade_padrao: precoFinal,
            unidade_padrao: medidaPadrao.unidade,
            ultima_compra_desc: `Nota de R$ ${valor.toFixed(2)} para ${medidaPadrao.valor}${medidaPadrao.unidade}`,
        };

        try {
            // Usamos setDocument com o ID do produto de compra para criar/atualizar o insumo correspondente.
            await setDocument("insumos", produtoSelecionado.id, insumoData);
            await incrementField("insumos", produtoSelecionado.id, "estoqueAtual", medidaPadrao.valor);

            showModal(`Custo atualizado e estoque incrementado! Novo custo: ${formatarValorPreciso(precoFinal)}/${medidaPadrao.unidade}.`);
            setSelectedProdutoId('');
            setValorNota('');
        } catch (error) {
            showModal("Erro ao atualizar custo: " + error.message);
        }
    };

    return (
        <div className="card">
            <h2><IconeCmv /> Registrar Compra e Atualizar Custo</h2>
            <form onSubmit={handleUpdateInsumoCost}>
                <div className="form-group">
                    <label>1. Selecione o item do Catálogo</label>
                    <select value={selectedProdutoId} onChange={e => setSelectedProdutoId(e.target.value)} required>
                        <option value="">Selecione um produto...</option>
                        {produtosDeCompra.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.nome} ({p.detalheCompra.unidadeCompra})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>2. Valor Total da Nota Fiscal (R$)</label>
                    <input 
                        type="text" 
                        value={valorNota}
                        onChange={e => setValorNota(e.target.value)}
                        placeholder="Ex: 150,25"
                        required 
                    />
                </div>
                <button type="submit" className="button-primary">Calcular Custo e Adicionar ao Estoque</button>
            </form>
            <div className="divider" />
            <h3>Custos Atuais dos Insumos</h3>
            <div className="list-container">
                {insumos.length > 0 ? insumos.map(i => (
                    <div key={i.id} className="list-item">
                        <div className='list-item-info'>
                            <p><strong>{i.nome}</strong></p>
                            <p className='sub-text'>Estoque: {i.estoqueAtual || 0} {i.unidade_padrao}</p>
                        </div>
                        <p>{formatarValorPreciso(i.preco_por_unidade_padrao)} / {i.unidade_padrao}</p>
                    </div>
                )) : <p>Nenhum custo de insumo registrado.</p>}
            </div>
        </div>
    );
};

export default CmvView;