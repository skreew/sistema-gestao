import { formatarValor, formatarData, formatarWhatsappParaLink, formatarWhatsappParaExibicao } from '../formatters';

describe('Formatters', () => {
  // Testes para formatarValor
  it('formatarValor should format number to BRL currency', () => {
    expect(formatarValor(123.45)).toBe('R$ 123,45');
    expect(formatarValor(0)).toBe('R$ 0,00');
  });

  it('formatarValor should return R$ 0,00 for non-number input', () => {
    expect(formatarValor(null)).toBe('R$ 0,00');
    expect(formatarValor(undefined)).toBe('R$ 0,00');
  });

  // Testes para formatarData
  it('formatarData should format Firestore timestamp to pt-BR date', () => {
    const timestamp = { seconds: 1672531200, nanoseconds: 0 }; // 2023-01-01
    expect(formatarData(timestamp)).toBe('01/01/2023');
  });

  it('formatarData should return N/A for invalid timestamp', () => {
    expect(formatarData(null)).toBe('N/A');
    expect(formatarData({})).toBe('N/A');
  });

  // Testes para WhatsApp
  it('formatarWhatsappParaLink should format number to a WhatsApp link format', () => {
    expect(formatarWhatsappParaLink('11987654321')).toBe('5511987654321');
    expect(formatarWhatsappParaLink('(11) 98765-4321')).toBe('5511987654321');
  });

  it('formatarWhatsappParaExibicao should format number for display', () => {
    expect(formatarWhatsappParaExibicao('5511987654321')).toBe('(11) 98765-4321');
  });
});