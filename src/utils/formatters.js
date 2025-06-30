export const formatarWhatsappParaLink = (numeroInput) => {
    let digitos = (numeroInput || '').replace(/\D/g, '');
    if (!digitos) return '';
    if (digitos.length >= 12 && digitos.startsWith('55')) return digitos;
    return `55${digitos}`;
};
export const formatarWhatsappParaExibicao = (numeroSalvo) => {
    const digitos = String(numeroSalvo || '').replace(/\D/g, '');
    const num = digitos.startsWith('55') ? digitos.substring(2) : digitos;
    if (num.length === 11) return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
    if (num.length === 10) return `(${num.substring(0, 2)}) ${num.substring(2, 6)}-${num.substring(6)}`;
    return numeroSalvo;
};
export const formatarValor = (valor) => typeof valor === 'number' ? `R$ ${valor.toFixed(2).replace('.', ',')}` : 'R$ 0,00';
export const formatarValorPreciso = (valor) => typeof valor === 'number' ? `R$ ${valor.toFixed(5).replace('.', ',')}` : 'N/A';
export const formatarData = (timestamp) => {
    if (!timestamp?.seconds) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR');
};