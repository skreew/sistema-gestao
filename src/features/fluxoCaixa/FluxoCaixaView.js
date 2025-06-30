import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { addDocument, deleteDocument } from '../../services/firestoreService';
import { formatarData, formatarValor } from '../../utils/formatters';
import { IconeDinheiro, IconeLixeira, IconeMais } from '../../utils/icons';

const FluxoCaixaView = () => {
    const { user } = useAuth();
    const { entradasCaixa, saidasCaixa, loadingData } = useData();
    const { showModal, showConfirmationModal } = useUI();

    const today = new Date();
    const [mesFiltro, setMesFiltro] = useState(today.toISOString().slice(0, 7)); // Formato YYYY-MM

    const [tipoLancamento, setTipoLancamento] = useState('entrada'); // 'entrada' ou 'saida'
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [data, setData] = useState(today.toISOString().slice(0, 10)); // Formato YYYY-MM-DD
    const [categoria, setCategoria] = useState('Outros');

    const lancamentosFiltrados = useMemo(() => {
        const [ano, mes] = mesFiltro.split('-').map(Number);
        const inicioMes = new Date(ano, mes - 1, 1);
        const fimMes = new Date(ano, mes, 0, 23, 59, 59);

        const entradas = entradasCaixa
            .filter(e => e.data?.seconds >= inicioMes.getTime() / 1000 && e.data?.seconds <= fimMes.getTime() / 1000)
            .map(e => ({ ...e, tipo: 'entrada' }));

        const saidas = saidasCaixa
            .filter(s => s.data?.seconds >= inicioMes.getTime() / 1000 && s.data?.seconds <= fimMes.getTime() / 1000)
            .map(s => ({ ...s, tipo: 'saida' }));

        return [...entradas, ...saidas].sort((a, b) => b.data.seconds - a.data.seconds);
    }, [mesFiltro, entradasCaixa, saidasCaixa]);

    const totais = useMemo(() => {
        const totalEntradas = lancamentosFiltrados
            .filter(l => l.tipo === 'entrada')
            .reduce((acc, item) => acc + item.valor, 0);
        const totalSaidas = lancamentosFiltrados
            .filter(l => l.tipo === 'saida')
            .reduce((acc, item) => acc + item.valor, 0);
        return { totalEntradas, totalSaidas, resultadoLiquido: totalEntradas - totalSaidas };
    }, [lancamentosFiltrados]);

    const handleAddLancamento = async (e) => {
        e.preventDefault();
        const valorNumerico = parseFloat(String(valor).replace(',', '.'));
        if (!descricao || isNaN(valorNumerico) || valorNumerico <= 0 || !data) {
            showModal("Preencha descrição, valor e data corretamente.");
            return;
        }

        const collectionPath = `fluxoCaixa/${user.uid}/${tipoLancamento}s`;
        const dados = {
            descricao,
            valor: valorNumerico,
            data: new Date(data),
            ...(tipoLancamento === 'saida' && { categoria })
        };

        try {
            await addDocument(collectionPath, dados, false); // false para não adicionar 'criadoEm'
            showModal("Lançamento adicionado com sucesso!");
            setDescricao('');
            setValor('');
        } catch (error) {
            showModal(`Erro ao adicionar lançamento: ${error.message}`);
        }
    };

    const handleDeleteLancamento = (id, tipo) => {
        showConfirmationModal("Tem certeza que deseja excluir este lançamento?", async () => {
            const collectionPath = `fluxoCaixa/${user.uid}/${tipo}s`;
            try {
                await deleteDocument(collectionPath, id);
                showModal("Lançamento excluído.");
            } catch (error) {
                showModal(`Erro ao excluir: ${error.message}`);
            }
        });
    };

    return (
        <div>
            <div className="card">
                <h2><IconeDinheiro /> Fluxo de Caixa</h2>
                <p>Gerencie as entradas e saídas financeiras do seu negócio de forma simples.</p>
            </div>

            <div className="card">
                <h3>Resumo do Mês</h3>
                <div className="form-group" style={{maxWidth: '250px'}}>
                    <label>Selecione o Mês</label>
                    <input type="month" value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} />
                </div>
                <div className="grid-responsive" style={{textAlign: 'center', gap: '1rem'}}>
                    <div style={{color: 'var(--cor-sucesso)'}}><h4>Faturamento Bruto</h4><p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{formatarValor(totais.totalEntradas)}</p></div>
                    <div style={{color: 'var(--cor-perigo)'}}><h4>Total de Despesas</h4><p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{formatarValor(totais.totalSaidas)}</p></div>
                    <div style={{color: totais.resultadoLiquido >= 0 ? 'var(--cor-sucesso)' : 'var(--cor-perigo)'}}><h4>Resultado Líquido</h4><p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{formatarValor(totais.resultadoLiquido)}</p></div>
                </div>
            </div>

            <div className="grid-responsive">
                <div className="card">
                    <h3><IconeMais /> Novo Lançamento</h3>
                    <form onSubmit={handleAddLancamento}>
                        <div className="form-group">
                            <label>Tipo de Lançamento</label>
                            <select value={tipoLancamento} onChange={e => setTipoLancamento(e.target.value)}>
                                <option value="entrada">Entrada (Faturamento)</option>
                                <option value="saida">Saída (Despesa)</option>
                            </select>
                        </div>
                        <div className="form-group"><label>Descrição</label><input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} required /></div>
                        <div className="form-group"><label>Valor (R$)</label><input type="text" value={valor} onChange={e => setValor(e.target.value)} placeholder="150,00" required /></div>
                        <div className="form-group"><label>Data</label><input type="date" value={data} onChange={e => setData(e.target.value)} required /></div>
                        {tipoLancamento === 'saida' && (
                             <div className="form-group"><label>Categoria da Despesa</label>
                                <select value={categoria} onChange={e => setCategoria(e.target.value)}>
                                    <option>Fornecedor</option><option>Salário</option><option>Imposto</option>
                                    <option>Aluguel</option><option>Contas (Água, Luz, Gás)</option><option>Outros</option>
                                </select>
                            </div>
                        )}
                        <button type="submit" className="button-primary">Adicionar Lançamento</button>
                    </form>
                </div>
                <div className="card">
                    <h3>Lançamentos do Mês</h3>
                    <div className="list-container" style={{maxHeight: '400px'}}>
                        {loadingData ? <p>Carregando...</p> : lancamentosFiltrados.length > 0 ? lancamentosFiltrados.map(l => (
                            <div key={l.id} className="list-item">
                                <div className="list-item-info">
                                    <p style={{color: l.tipo === 'entrada' ? 'var(--cor-sucesso)' : 'var(--cor-perigo)'}}>
                                        <strong>{formatarValor(l.valor)}</strong> - {l.descricao}
                                    </p>
                                    <p className="sub-text">{formatarData(l.data)} {l.categoria && `(${l.categoria})`}</p>
                                </div>
                                <button className="button-icon" onClick={() => handleDeleteLancamento(l.id, l.tipo)}><IconeLixeira /></button>
                            </div>
                        )) : <p className="sub-text">Nenhum lançamento para o período selecionado.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FluxoCaixaView;