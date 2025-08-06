import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { DetailFilters, ProcedureDetails as ProcedureDetailsType } from '../types/sigtap';
import { getProcedureDetails } from '../services/sigtapService';
import { validarCompetencia, formatNumericInput, getCurrentCompetencia } from '../utils/validation';

interface ProcedureDetailsProps {
  environment: 'homologacao' | 'producao';
  initialCode?: string;
}

const ProcedureDetails: React.FC<ProcedureDetailsProps> = ({ 
  environment, 
  initialCode = '' 
}) => {
  const [filters, setFilters] = useState<DetailFilters>({
    codigoProcedimento: initialCode,
    competenciaDetalhe: '',
    categoriaDetalhes: 'DESCRICAO'
  });
  const [details, setDetails] = useState<ProcedureDetailsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const categoryOptions = [
    { value: 'DESCRICAO', label: 'Descrição' },
    { value: 'CIDS', label: 'CIDs Vinculados' },
    { value: 'CBOS', label: 'CBOs Vinculados' },
    { value: 'CATEGORIAS_CBO', label: 'Categorias CBO' },
    { value: 'TIPOS_LEITO', label: 'Tipos de Leito' },
    { value: 'SERVICOS_CLASSIFICACOES', label: 'Serviços de Classificações' },
    { value: 'HABILITACOES', label: 'Habilitações' },
    { value: 'GRUPOS_HABILITACAO', label: 'Grupos Habilitação' },
    { value: 'INCREMENTOS', label: 'Incrementos' },
    { value: 'COMPONENTES_REDE', label: 'Componentes de Rede' },
    { value: 'ORIGENS_SIGTAP', label: 'Origens SIGTAP' },
    { value: 'ORIGENS_SIA_SIH', label: 'Origens SIA/SIH' },
    { value: 'REGRAS_CONDICIONADA', label: 'Regras Condicionadas' },
    { value: 'RENASES', label: 'RENASES' },
    { value: 'TUSS', label: 'TUSS' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!filters.codigoProcedimento) {
      setError('Código do procedimento é obrigatório!');
      return;
    }

    if (filters.competenciaDetalhe && !validarCompetencia(filters.competenciaDetalhe)) {
      setError('Competência deve estar no formato AAAAMM (ex: 202501) e ser uma data válida!');
      return;
    }

    setLoading(true);
    setDetails(null);

    try {
      const procedureDetails = await getProcedureDetails(filters, environment);
      setDetails(procedureDetails);
      setSuccess('Detalhes do procedimento carregados com sucesso! (Demonstração)');
    } catch (err) {
      setError('Erro ao detalhar procedimento: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DetailFilters, value: string) => {
    if (field === 'competenciaDetalhe') {
      value = formatNumericInput(value, 6);
    } else if (field === 'codigoProcedimento') {
      value = formatNumericInput(value, 10);
    }
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText size={24} />
        Detalhar Procedimento
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código do Procedimento *
            </label>
            <input
              type="text"
              value={filters.codigoProcedimento}
              onChange={(e) => handleInputChange('codigoProcedimento', e.target.value)}
              placeholder="Ex: 0203010027"
              maxLength={10}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Competência (AAAAMM)
            </label>
            <input
              type="text"
              value={filters.competenciaDetalhe}
              onChange={(e) => handleInputChange('competenciaDetalhe', e.target.value)}
              placeholder={`Ex: ${getCurrentCompetencia()}`}
              maxLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Detalhes Adicionais
          </label>
          <select
            value={filters.categoriaDetalhes}
            onChange={(e) => handleInputChange('categoriaDetalhes', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
          {loading ? 'Carregando...' : 'Detalhar Procedimento'}
        </button>
      </form>

      {error && (
        <div className="mt-6 bg-red-500 text-white p-4 rounded-lg flex items-center gap-2">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="mt-6 bg-green-500 text-white p-4 rounded-lg flex items-center gap-2">
          ✅ {success}
        </div>
      )}

      {details && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="font-bold text-blue-600 text-xl mb-2 flex items-center gap-2">
            🔍 Código: {details.codigo}
          </div>
          <div className="text-gray-800 font-semibold text-lg mb-4">{details.nome}</div>
          <div className="space-y-3 text-gray-700">
            <p><strong>📝 Descrição:</strong> {details.descricao}</p>
            <p><strong>💰 Valor SH:</strong> {details.valorSH}</p>
            <p><strong>💰 Valor SA:</strong> {details.valorSA}</p>
            <p><strong>👤 Sexo Permitido:</strong> {details.sexoPermitido}</p>
            <p><strong>🎂 Idade Mínima:</strong> {details.idadeMinima}</p>
            <p><strong>🎂 Idade Máxima:</strong> {details.idadeMaxima}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcedureDetails;