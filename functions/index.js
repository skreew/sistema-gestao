// Arquivo: functions/index.js (versão simplificada)

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// Função base para recalcular o custo de um produto
async function recalcularCustoProduto(produtoDoc) {
    const produtoData = produtoDoc.data();
    let novoCustoTotal = 0;

    if (!produtoData.ficha || produtoData.ficha.length === 0) {
        return produtoDoc.ref.update({ custo_total_calculado: 0 });
    }
    
    // Pega todos os IDs de insumos da ficha de uma vez
    const insumosIds = produtoData.ficha.map(item => item.insumo_id);
    const insumosDocs = await db.collection('insumos').where(admin.firestore.FieldPath.documentId(), 'in', insumosIds).get();
    
    const precosInsumos = new Map();
    insumosDocs.forEach(doc => {
        precosInsumos.set(doc.id, doc.data().preco_por_unidade_padrao);
    });

    for (const itemFicha of produtoData.ficha) {
        const precoPadrao = precosInsumos.get(itemFicha.insumo_id);
        
        if (precoPadrao === undefined) {
            functions.logger.error(`Preço para o insumo ${itemFicha.insumo_id} não encontrado!`);
            continue; // Pula este item se não encontrar o preço
        }
        
        // Cálculo agora é uma simples multiplicação
        novoCustoTotal += precoPadrao * itemFicha.qtd;
    }

    novoCustoTotal += produtoData.custo_operacional || 0;

    functions.logger.log(`Produto ${produtoDoc.id} (${produtoData.nome}) atualizado. Novo custo: ${novoCustoTotal.toFixed(2)}`);
    return produtoDoc.ref.update({
        custo_total_calculado: novoCustoTotal,
        data_atualizacao_custo: admin.firestore.FieldValue.serverTimestamp()
    });
}

// Trigger que dispara na ATUALIZAÇÃO de um insumo
exports.recalcularCMVaoAtualizarInsumo = functions
    .region("southamerica-east1")
    .firestore.document("insumos/{insumoId}")
    .onUpdate(async (change, context) => {
        const novoPreco = change.after.data().preco_por_unidade_padrao;
        const precoAntigo = change.before.data().preco_por_unidade_padrao;

        if (novoPreco === precoAntigo) {
            return null; // Nenhuma ação se o preço não mudou
        }

        const insumoId = context.params.insumoId;
        const produtosQuery = db.collection("produtos").where("ficha_insumos_ids", "array-contains", insumoId);
        const produtosSnapshot = await produtosQuery.get();

        if (produtosSnapshot.empty) {
            return null;
        }

        const promises = produtosSnapshot.docs.map(doc => recalcularCustoProduto(doc));
        return Promise.all(promises);
    });

// Trigger que dispara na CRIAÇÃO de um novo produto
exports.calcularCMVInicial = functions
    .region("southamerica-east1")
    .firestore.document("produtos/{produtoId}")
    .onCreate(async (snap, context) => {
        return recalcularCustoProduto(snap);
    });