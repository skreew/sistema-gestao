import React from 'react';
import { useAuth } from '../../context/Auth';
import { useData } from '../../context/DataContext';
import { IconeCaminhao, IconeCheck, IconeCirculo } from '../../utils/icons';

const OnboardingView = () => {
    const { user, updateOnboardingStatus } = useAuth();
    const { fornecedores, produtosDeCompra, produtos } = useData();

    const checklist = [
        { text: 'Cadastre seu primeiro fornecedor', isComplete: fornecedores.length > 0 },
        { text: 'Cadastre um item de compra (insumo)', isComplete: produtosDeCompra.length > 0 },
        { text: 'Registre uma compra para ter um custo', isComplete: produtosDeCompra.some(p => p.bestPrice) },
        { text: 'Crie sua primeira Ficha Técnica', isComplete: produtos.length > 0 },
    ];
    const allComplete = checklist.every(item => item.isComplete);

    return (
        <div className="login-container">
            <div className="login-card card" style={{maxWidth: '600px'}}>
                <h1><IconeCaminhao /> Primeiros Passos!</h1>
                <p>Bem-vindo(a)! Complete os passos abaixo para configurar o sistema.</p>
                <div className="divider" />
                <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                    {checklist.map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', fontSize: '1.1rem' }}>
                            <span style={{ marginRight: '1rem', color: item.isComplete ? 'var(--cor-sucesso)' : 'var(--cor-borda)' }}>
                                {item.isComplete ? <IconeCheck /> : <IconeCirculo />}
                            </span>
                            {item.text}
                        </li>
                    ))}
                </ul>
                <button onClick={() => updateOnboardingStatus(user.uid, true)} className="button-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={!allComplete}>
                    {allComplete ? "Vamos Começar!" : "Complete os passos para continuar"}
                </button>
            </div>
        </div>
    );
};
export default OnboardingView;