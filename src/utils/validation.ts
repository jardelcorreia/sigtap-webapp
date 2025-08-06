export const validarCompetencia = (competencia: string): boolean => {
  if (!competencia) return true;
  if (competencia.length !== 6) return false;
  
  const ano = parseInt(competencia.substring(0, 4));
  const mes = parseInt(competencia.substring(4, 6));
  
  const anoAtual = new Date().getFullYear();
  
  if (ano < 2008 || ano > anoAtual) return false;
  if (mes < 1 || mes > 12) return false;
  
  return true;
};

export const getCurrentCompetencia = (): string => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  return `${ano}${mes}`;
};

export const formatNumericInput = (value: string, maxLength: number): string => {
  const numericValue = value.replace(/\D/g, '');
  return numericValue.length > maxLength ? numericValue.slice(0, maxLength) : numericValue;
};