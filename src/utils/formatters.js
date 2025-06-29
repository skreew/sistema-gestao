export const formatarWhatsappParaLink = (numeroInput) => {
    let digitos = (numeroInput || '').replace(/\D/g, '');
    if (!digitos) return null;
    if (digitos.length < 10) return null;
    if (digitos.length >= 12 && digitos.startsWith('55')) return digitos;
    if (digitos.length === 11 || digitos.length === 10) return `55${digitos}`;
    return null;
};

export const formatarWhatsappParaExibicao = (numeroSalvo) => {
    const digitos = String(numeroSalvo || '').replace(/\D/g, '');
    if (digitos.startsWith('55')) {
        const numeroSemDDI = digitos.substring(2);
        if (numeroSemDDI.length === 11) {
            return `(${numeroSemDDI.substring(0, 2)}) ${numeroSemDDI.substring(2, 7)}-${numeroSemDDI.substring(7)}`;
        }
        if (numeroSemDDI.length === 10) {
            return `(${numeroSemDDI.substring(0, 2)}) ${numeroSemDDI.substring(2, 6)}-${numeroSemDDI.substring(6)}`;
        }
    }
    return numeroSalvo;
};

export const formatarValor = (valor) => {
    if (typeof valor !== 'number') return 'R$ 0,00';
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

export const formatarValorPreciso = (valor) => {
    if (typeof valor !== 'number') return 'R$ 0,00000';
    return `R$ ${valor.toFixed(5).replace('.', ',')}`;
}

export const formatarData = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'Data inválida';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
};