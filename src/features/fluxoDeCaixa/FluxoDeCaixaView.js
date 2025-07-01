import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { addDocument, deleteDocument } from '../../services/firestoreService';
import { IconeDinheiro, IconeMais, IconeLixeira, IconeBusca, IconeCalendario, IconeGrafico } from '../../utils/icons';
import { formatarValor, formatarData } from '../../utils/formatters';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';

const FluxoDeCaixaView = () => {
    const { faturamentos, despesas, loadingData } = useData();
    const { showToast, showConfirmationModal } = useUI();

    const [activeTab, setActiveTab] = useState('lancamento');
    const [tipoLancamento, setTipoLancamento] = useState('faturamento');
    const [valor, setValor] = useState('');
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [descricao, setDescricao] = useState('');
    const [categoriaDespesa, setCategoriaDespesa] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const categoriasDespesa = ['Aluguel', 'Salários', 'Contas de Consumo', 'Insumos', 'Marketing', 'Outros'];

    const [relatorioSearchTerm, setRelatorioSearchTerm] = useState('');
    const [relatorioFilterDateStart, setRelatorioFilterDateStart] = useState('');
    const [relatorioFilterDateEnd, setRelatorioFilterDateEnd] = useState('');
    const [relatorioFilterPeriod, setRelatorioFilterPeriod] = useState('all');

    const applyDateFilter = (startDate, endDate) => {
        setRelatorioFilterDateStart(startDate);
        setRelatorioFilterDateEnd(endDate);
    };

    const handlePeriodChange = (e) => {
        const period = e.target.value;
        setRelatorioFilterPeriod(period);
        const today = new Date();
        let startDate = '';
        let endDate = '';

        switch (period) {
            case 'today':
                startDate = today.toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
            case 'last7days':
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                startDate = sevenDaysAgo.toISOString().split('T')[0];
                endDate = new Date().toISOString().split('T')[0];
                break;
            case 'thismonth':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
                break;
            case 'thisyear':
                startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                endDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
                break;
            case 'all':
            default:
                startDate = '';
                endDate = '';
                break;
        }
        applyDateFilter(startDate, endDate);
    };

    const validateLancamentoForm = () => {
        const errors = {};
        if (isNaN(parseFloat(String(valor).replace(',', '.'))) || parseFloat(String(valor).replace(',', '.')) <= 0) errors.valor = "Valor inválido.";
        if (!data) errors.data = "Data é obrigatória.";
        if (tipoLancamento === 'despesa' && !categoriaDespesa) errors.categoriaDespesa = "Selecione uma categoria.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveLancamento = async (e) => {
        e.preventDefault();
        if (!validateLancamentoForm()) return;
        if (isSaving) return;

        setIsSaving(true);
        const valorNumerico = parseFloat(String(valor).replace(',', '.'));

        const lancamentoData = {
            valor: valorNumerico,
            data: new Date(data),
            descricao: descricao || null,
        };

        try {
            if (tipoLancamento === 'faturamento') {
                await addDocument('faturamento', lancamentoData);
                showToast('Faturação registada com sucesso!');
            } else {
                await addDocument('despesas', { ...lancamentoData, categoria: categoriaDespesa });
                showToast('Despesa registada com sucesso!');
            }
            resetForm();
        } catch (error) {
            showToast('Erro ao registar lançamento: ' + error.message, 'error');
        } finally { setIsSaving(false); }
    };

    const resetForm = () => {
        setValor('');
        setData(new Date().toISOString().split('T')[0]);
        setDescricao('');
        setCategoriaDespesa('');
        setFormErrors({});
    };

    const handleDeleteLancamento = (collectionName, id) => {
        showConfirmationModal("Tem certeza que deseja apagar este lançamento?", async () => {
            try {
                await deleteDocument(collectionName, id);
                showToast("Lançamento apagado.");
            } catch (error) {
                showToast("Erro ao apagar: " + error.message, 'error');
            }
        });
    };

    const combinedLancamentos = useMemo(() => {
        const all = [
            ...faturamentos.map(item => ({ ...item, tipo: 'faturamento', categoria: 'Faturamento' })),
            ...despesas.map(item => ({ ...item, tipo: 'despesa' }))
        ].sort((a, b) => {
            const dateA = a.data.toDate ? a.data.toDate() : new Date(a.data.seconds * 1000);
            const dateB = b.data.toDate ? b.data.toDate() : new Date(b.data.seconds * 1000);
            return dateB - dateA;
        });

        let filtered = all;

        if (relatorioSearchTerm) {
            filtered = filtered.filter(item =>
                item.descricao?.toLowerCase().includes(relatorioSearchTerm.toLowerCase()) ||
                item.categoria?.toLowerCase().includes(relatorioSearchTerm.toLowerCase())
            );
        }

        if (relatorioFilterDateStart) {
            const startDate = new Date(relatorioFilterDateStart);
            startDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(item => {
                const itemDate = item.data.toDate ? item.data.toDate() : new Date(item.data.seconds * 1000);
                return itemDate >= startDate;
            });
        }

        if (relatorioFilterDateEnd) {
            const endDate = new Date(relatorioFilterDateEnd);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(item => {
                const itemDate = item.data.toDate ? item.data.toDate() : new Date(item.data.seconds * 1000);
                return itemDate <= endDate;
            });
        }

        return filtered;
    }, [faturamentos, despesas, relatorioSearchTerm, relatorioFilterDateStart, relatorioFilterDateEnd]);

    const totalFaturamento = useMemo(() => combinedLancamentos.filter(l => l.tipo === 'faturamento').reduce((sum, l) => sum + l.valor, 0), [combinedLancamentos]);
    const totalDespesas = useMemo(() => combinedLancamentos.filter(l => l.tipo === 'despesa').reduce((sum, l) => sum + l.valor, 0), [combinedLancamentos]);
    const resultadoLiquido = totalFaturamento - totalDespesas;

    const getResultadoColor = (valor) => {
        if (valor > 0) return 'var(--cor-sucesso)';
        if (valor < 0) return 'var(--cor-perigo)';
        return 'var(--cor-texto)';
    };

    const generatePdf = () => {
        const doc = new jsPDF();
        doc.text("Relatório de Fluxo de Caixa", 14, 16);

        const tableColumn = ["Data", "Tipo", "Categoria", "Descrição", "Valor (R$)"];
        const tableRows = [];

        combinedLancamentos.forEach(lancamento => {
            const dataFormatada = formatarData(lancamento.data);
            const tipo = lancamento.tipo === 'faturamento' ? 'Faturamento' : 'Despesa';
            const categoria = lancamento.categoria || 'N/A';
            const descricao = lancamento.descricao || 'N/A';
            const valorFormatado = formatarValor(lancamento.valor);
            tableRows.push([dataFormatada, tipo, categoria, descricao, valorFormatado]);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'striped',
            styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
            headStyles: { fillColor: [0, 51, 160] },
            margin: { top: 15, left: 14, right: 14, bottom: 10 },
            didDrawPage: function (data) {
                // Footer
                let str = "Página " + doc.internal.getNumberOfPages();
                doc.setFontSize(10);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        let finalY = doc.autoTable.previous.finalY;
        doc.setFontSize(10);
        doc.text(`Total Faturação: ${formatarValor(totalFaturamento)}`, 14, finalY + 10);
        doc.text(`Total Despesas: ${formatarValor(totalDespesas)}`, 14, finalY + 17);
        doc.text(`Resultado Líquido: ${formatarValor(resultadoLiquido)}`, 14, finalY + 24);
        doc.save('fluxo_de_caixa.pdf');
    };

    const csvHeaders = [
        { label: "Data", key: "data" },
        { label: "Tipo", key: "tipo" },
        { label: "Categoria", key: "categoria" },
        { label: "Descrição", key: "descricao" },
        { label: "Valor", key: "valor" }
    ];

    const csvData = combinedLancamentos.map(lancamento => ({
        data: formatarData(lancamento.data),
        tipo: lancamento.tipo === 'faturamento' ? 'Faturamento' : 'Despesa',
        categoria: lancamento.categoria || '',
        descricao: lancamento.descricao || '',
        valor: lancamento.valor
    }));


    if (loadingData) return <div className="card"><h3>A carregar Fluxo de Caixa...</h3></div>;

    return (
        <div>
            <div className="card">
                <h2><IconeDinheiro /> Fluxo de Caixa</h2>
                <p>Controle as suas entradas e saídas para ter uma visão clara da saúde financeira do seu negócio.</p>
            </div>

            <div className="variantes-tabs">
                <button className={activeTab === 'lancamento' ? 'active' : ''} onClick={() => setActiveTab('lancamento')}>
                    Lançar
                </button>
                <button className={activeTab === 'relatorio' ? 'active' : ''} onClick={() => setActiveTab('relatorio')}>
                    Relatório
                </button>
            </div>

            {activeTab === 'lancamento' && (
                <div className="card">
                    <h3><IconeMais /> Novo Lançamento</h3>
                    <form onSubmit={handleSaveLancamento}>
                        <div className="form-group-inline">
                            <SelectField
                                label="Tipo de Lançamento"
                                value={tipoLancamento}
                                onChange={e => { setTipoLancamento(e.target.value); setFormErrors({}); }}
                                options={[
                                    { value: 'faturamento', label: 'Faturamento' },
                                    { value: 'despesa', label: 'Despesa' }
                                ]}
                            />
                            <InputField
                                label="Valor (R$)"
                                type="text"
                                value={valor}
                                onChange={e => { setValor(e.target.value); setFormErrors(prev => ({ ...prev, valor: '' })); }}
                                placeholder="0.00"
                                required
                                error={formErrors.valor}
                            />
                        </div>
                        <div className="form-group-inline">
                            <InputField
                                label="Data"
                                type="date"
                                value={data}
                                onChange={e => { setData(e.target.value); setFormErrors(prev => ({ ...prev, data: '' })); }}
                                required
                                error={formErrors.data}
                            />
                            {tipoLancamento === 'despesa' && (
                                <SelectField
                                    label="Categoria da Despesa"
                                    value={categoriaDespesa}
                                    onChange={e => { setCategoriaDespesa(e.target.value); setFormErrors(prev => ({ ...prev, categoriaDespesa: '' })); }}
                                    options={[
                                        { value: '', label: 'Selecione...', disabled: true },
                                        ...categoriasDespesa.map(cat => ({ value: cat, label: cat }))
                                    ]}
                                    required
                                    error={formErrors.categoriaDespesa}
                                />
                            )}
                        </div>
                        <InputField
                            label="Descrição (Opcional)"
                            type="textarea"
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                            placeholder="Ex: Venda do dia, Aluguel do mês"
                        />
                        <button type="submit" className="button-primary" disabled={isSaving}>
                            {isSaving ? 'A registar...' : 'Registar'}
                        </button>
                        <button type="button" onClick={resetForm} className="button-link">Limpar</button>
                    </form>
                </div>
            )}

            {activeTab === 'relatorio' && (
                <div className="card">
                    <h3><IconeGrafico /> Relatório de Fluxo de Caixa</h3>
                    <div className="form-group-inline">
                        <InputField
                            label="Procurar"
                            type="text"
                            value={relatorioSearchTerm}
                            onChange={e => setRelatorioSearchTerm(e.target.value)}
                            placeholder="Procurar por descrição ou categoria..."
                            icon={IconeBusca}
                        />
                        <SelectField
                            label="Período"
                            value={relatorioFilterPeriod}
                            onChange={handlePeriodChange}
                            options={[
                                { value: 'all', label: 'Todo o Período' },
                                { value: 'today', label: 'Hoje' },
                                { value: 'last7days', label: 'Últimos 7 dias' },
                                { value: 'thismonth', label: 'Este Mês' },
                                { value: 'thisyear', label: 'Este Ano' },
                            ]}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button onClick={generatePdf} className="button-secondary" disabled={combinedLancamentos.length === 0}>Exportar PDF</button>
                        <CSVLink data={csvData} headers={csvHeaders} filename={"fluxo_de_caixa.csv"} className="button-secondary" disabled={combinedLancamentos.length === 0}>
                            Exportar CSV
                        </CSVLink>
                    </div>

                    <div className="list-container">
                        {combinedLancamentos.length > 0 ? combinedLancamentos.map(lancamento => (
                            <div key={lancamento.id} className="list-item" style={{ borderLeft: `5px solid ${lancamento.tipo === 'faturamento' ? 'var(--cor-sucesso)' : 'var(--cor-perigo)'}` }}>
                                <div className="list-item-info">
                                    <p><strong>{lancamento.descricao || (lancamento.tipo === 'faturamento' ? 'Faturamento' : 'Despesa')}</strong></p>
                                    <p className="sub-text">
                                        {lancamento.tipo === 'despesa' && `Categoria: ${lancamento.categoria} | `}
                                        Data: {formatarData(lancamento.data)}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: lancamento.tipo === 'faturamento' ? 'var(--cor-sucesso)' : 'var(--cor-perigo)', fontWeight: 'bold' }}>
                                        {formatarValor(lancamento.valor)}
                                    </p>
                                    <button className="button-icon" onClick={() => handleDeleteLancamento(lancamento.tipo === 'faturamento' ? 'faturamento' : 'despesas', lancamento.id)} aria-label="Apagar lançamento"><IconeLixeira /></button>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">
                                <IconeDinheiro />
                                <h3>Nenhum Lançamento Encontrado</h3>
                                <p className="sub-text">Registe faturações e despesas na aba "Lançar" para ver o relatório.</p>
                            </div>
                        )}
                    </div>
                    <div className="divider" />
                    <div style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        <p>Total Faturação: <span style={{ color: 'var(--cor-sucesso)' }}>{formatarValor(totalFaturamento)}</span></p>
                        <p>Total Despesas: <span style={{ color: 'var(--cor-perigo)' }}>{formatarValor(totalDespesas)}</span></p>
                        <p>Resultado Líquido: <span style={{ color: getResultadoColor(resultadoLiquido) }}>{formatarValor(resultadoLiquido)}</span></p>
                    </div>
                </div>
            )}
        </div>
    );
};
export default FluxoDeCaixaView;