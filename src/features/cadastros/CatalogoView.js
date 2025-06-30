import React, { useState, useMemo } from 'react';
import { useUI } from '../../context/UIContext';
import { useData } from '../../context/DataContext';
import { addDocument, addDocumentToSubcollection } from '../../services/firestoreService';
import { IconeCatalogo } from '../../utils/icons';
import { formatarValorPreciso, formatarValor } from '../../utils/formatters';

const CatalogoView = () => {
    const { showModal } = useUI();
    const { fornecedores, produtosDeCompra } = useData();

    const initialFormState = {
        id: null, nome: '', unidadeAnalise: 'kg', fornecedorId: '',
        dataCompra: new Date().toISOString().split('T')[0],
        precoTotalNota: '',
        // Novos campos para compra em atacado/embalagem
        isEmbalagem: false,
        quantidadeEmbalagens: '1',
        unidadesPorEmbalagem: '',
        pesoPorUnidade: '',
    };

    const [insumoForm, setInsumoForm] = useState(initialFormState);
    const [isNewInsumo, setIsNewInsumo] = useState(false);

    const handleInsumoFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setInsumoForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleInsumoNomeBlur = () => {
        const existingInsumo = produtosDeCompra.find(p => p.nome.toLowerCase() === insumoForm.nome.toLowerCase());
        if (existingInsumo) {
            setInsumoForm(prev => ({ ...prev, id: existingInsumo.id, unidadeAnalise: existingInsumo.unidadeAnalise }));
            setIsNewInsumo(false);
        } else {
            setInsumoForm(prev => ({ ...prev, id: null }));
            setIsNewInsumo(true);
        }
    };

    const { custoUnitarioCalculado, erroCalculo } = useMemo(() => {
        const { precoTotalNota, isEmbalagem, quantidadeEmbalagens, unidadesPorEmbalagem, pesoPorUnidade, unidadeAnalise } = insumoForm;
        const preco = parseFloat(String(precoTotalNota).replace(',', '.'));
        if (isNaN(preco) || preco <= 0) return { custoUnitarioCalculado: null, erroCalculo: null };

        if (isEmbalagem) {
            const qtdeEmb = parseFloat(String(quantidadeEmbalagens).replace(',', '.'));
            const unidsPorEmb = parseFloat(String(unidadesPorEmbalagem).replace(',', '.'));
            const pesoPorUnid = parseFloat(String(pesoPorUnidade).replace(',', '.'));

            if (isNaN(qtdeEmb) || isNaN(unidsPorEmb) || isNaN(pesoPorUnid) || qtdeEmb <= 0 || unidsPorEmb <= 0 || pesoPorUnid <= 0) {
                return { custoUnitarioCalculado: null, erroCalculo: "Preencha os dados da embalagem." };
            }
            const totalUnidadesBase = qtdeEmb * unidsPorEmb * pesoPorUnid;
            if (totalUnidadesBase === 0) return { custoUnitarioCalculado: null, erroCalculo: "Total de unidades não pode ser zero." };

            const custoFinal = preco / totalUnidadesBase;
            return { custoUnitarioCalculado: `${formatarValorPreciso(custoFinal)} / ${unidadeAnalise}`, erroCalculo: null };
        }
        return { custoUnitarioCalculado: null, erroCalculo: null };

    }, [insumoForm]);

    const handleSaveInsumoOrPurchase = async (e) => {
        e.preventDefault();
        const { nome, unidadeAnalise, fornecedorId, dataCompra, precoTotalNota, id, isEmbalagem, quantidadeEmbalagens, unidadesPorEmbalagem, pesoPorUnidade } = insumoForm;

        const preco = parseFloat(String(precoTotalNota).replace(',', '.'));
        if (!nome || !unidadeAnalise || !fornecedorId || isNaN(preco) || preco <= 0) {
            showModal("Preencha nome, unidade, fornecedor e preço total corretamente.");
            return;
        }

        let quantidadeTotalUnidadeAnalise = 0;
        let precoPorUnidadeAnalise = 0;

        if(isEmbalagem) {
            const qtdeEmb = parseFloat(String(quantidadeEmbalagens).replace(',', '.'));
            const unidsPorEmb = parseFloat(String(unidadesPorEmbalagem).replace(',', '.'));
            const pesoPorUnid = parseFloat(String(pesoPorUnidade).replace(',', '.'));
            if (isNaN(qtdeEmb) || isNaN(unidsPorEmb) || isNaN(pesoPorUnid) || pesoPorUnid <= 0) {
                showModal("Dados da embalagem inválidos."); return;
            }
            quantidadeTotalUnidadeAnalise = qtdeEmb * unidsPorEmb * pesoPorUnid;
            precoPorUnidadeAnalise = preco / quantidadeTotalUnidadeAnalise;
        } else {
            showModal("O modo de compra 'unitário' ainda precisa ser implementado. Selecione 'Embalagem/Caixa'.");
            return; // Bloqueia a lógica não implementada
        }

        if (quantidadeTotalUnidadeAnalise <= 0) {
            showModal("A quantidade final calculada não pode ser zero.");
            return;
        }

        try {
            let currentInsumoId = id;
            if (isNewInsumo || !currentInsumoId) {
                const newInsumoRef = await addDocument("produtosDeCompra", { nome, unidadeAnalise });
                currentInsumoId = newInsumoRef.id;
            }

            const purchaseRecord = {
                fornecedorId, dataCompra: new Date(dataCompra), precoTotalNota: preco,
                quantidadeComprada: quantidadeTotalUnidadeAnalise, // Salva o total calculado na unidade de análise
                unidadeAnalise: unidadeAnalise,
                precoPorUnidadeAnalise,
                detalhesCompra: { isEmbalagem, quantidadeEmbalagens, unidadesPorEmbalagem, pesoPorUnidade }
            };
            await addDocumentToSubcollection("produtosDeCompra", currentInsumoId, "historicoPrecos", purchaseRecord);
            showModal(`Compra registrada para ${nome}! Custo: ${formatarValorPreciso(precoPorUnidadeAnalise)}/${unidadeAnalise}`);

            setInsumoForm(initialFormState);
            setIsNewInsumo(false);
        } catch (error) {
            showModal("Erro ao salvar compra: " + error.message);
        }
    };

    return (
        <div>
            <div className="card">
                <h2><IconeCatalogo /> Catálogo e Compras</h2>
                <p>Cadastre novos insumos e registre suas compras para calcular os custos com precisão.</p>
            </div>

            <div className="card">
                <h3>Registrar Nova Compra</h3>
                <form onSubmit={handleSaveInsumoOrPurchase}>
                    <div className="form-group">
                        <label>Nome do Insumo</label>
                        <input name="nome" type="text" value={insumoForm.nome} onChange={handleInsumoFormChange} onBlur={handleInsumoNomeBlur} placeholder="Digite o nome de um insumo novo ou existente" required />
                    </div>

                    {isNewInsumo && (
                        <div className="form-group">
                            <label>Unidade para Análise de Custo (Ex: kg, L, un)</label>
                            <select name="unidadeAnalise" value={insumoForm.unidadeAnalise} onChange={handleInsumoFormChange} required>
                                <option value="kg">Quilograma (kg)</option>
                                <option value="L">Litro (L)</option>
                                <option value="un">Unidade (un)</option>
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Fornecedor</label>
                        <select name="fornecedorId" value={insumoForm.fornecedorId} onChange={handleInsumoFormChange} required>
                            <option value="">Selecione um fornecedor...</option>
                            {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                        </select>
                    </div>

                    <div className="divider-soft"></div>
                    <h4>Detalhes da Compra</h4>

                    <div className="form-group">
                        <label>
                            <input type="checkbox" name="isEmbalagem" checked={insumoForm.isEmbalagem} onChange={handleInsumoFormChange} />
                            A compra foi por Embalagem/Caixa?
                        </label>
                    </div>

                    {insumoForm.isEmbalagem && (
                        <div className="form-group-inline">
                            <div className="form-group">
                                <label>Qtde. Embalagens</label>
                                <input name="quantidadeEmbalagens" type="text" value={insumoForm.quantidadeEmbalagens} onChange={handleInsumoFormChange} placeholder="Ex: 1" />
                            </div>
                            <div className="form-group">
                                <label>Unidades por Embalagem</label>
                                <input name="unidadesPorEmbalagem" type="text" value={insumoForm.unidadesPorEmbalagem} onChange={handleInsumoFormChange} placeholder="Ex: 12" />
                            </div>
                            <div className="form-group">
                                <label>Peso/Vol. por Unidade ({insumoForm.unidadeAnalise})</label>
                                <input name="pesoPorUnidade" type="text" value={insumoForm.pesoPorUnidade} onChange={handleInsumoFormChange} placeholder="Ex: 0.400 para 400g" />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Preço Total na Nota (R$)</label>
                        <input name="precoTotalNota" type="text" value={insumoForm.precoTotalNota} onChange={handleInsumoFormChange} placeholder="Ex: 120.00" required />
                    </div>

                    {custoUnitarioCalculado && <p style={{fontWeight: 'bold', color: 'var(--cor-sucesso)'}}>Custo Calculado: {custoUnitarioCalculado}</p>}
                    {erroCalculo && <p style={{fontWeight: 'bold', color: 'var(--cor-perigo)'}}>{erroCalculo}</p>}

                    <button type="submit" className="button-primary" style={{marginTop: '1rem'}}>
                        {isNewInsumo ? 'Cadastrar Insumo e Registrar Compra' : 'Registrar Nova Compra'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CatalogoView;