import React, { useState } from 'react';
import { Search, Eye, Loader2 } from 'lucide-react';
import { SearchFilters, ProcedureSearchResult } from '../types/sigtap';
import { searchProcedures } from '../services/sigtapService';
import { validarCompetencia, formatNumericInput, getCurrentCompetencia } from '../utils/validation';

interface SearchProceduresProps {
  environment: 'homologacao' | 'producao';
  onShowProcedureDetails: (codigo: string) => void;
}

const SearchProcedures: React.FC<SearchProceduresProps> = ({ 
  environment, 
  onShowProcedureDetails 
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    codigoGrupo: '',
    codigoSubgrupo: '',
    competencia: '',
    quantidadeRegistros: '20'
  });
  const [results, setResults] = useState<ProcedureSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const groupOptions = [
    { value: '', label: 'Selecione um grupo' },
    { value: '01', label: '01 - AÇÕES DE PROMOÇÃO E PREVENÇÃO EM SAÚDE' },
    { value: '02', label: '02 - PROCEDIMENTOS COM FINALIDADE DIAGNÓSTICA' },
    { value: '03', label: '03 - PROCEDIMENTOS CLÍNICOS' },
    { value: '04', label: '04 - PROCEDIMENTOS CIRÚRGICOS' },
    { value: '05', label: '05 - TRANSPLANTES DE ÓRGÃOS, TECIDOS E CÉLULAS' },
    { value: '06', label: '06 - MEDICAMENTOS' },
    { value: '07', label: '07 - ÓRTESES, PRÓTESES E MATERIAIS ESPECIAIS' },
    { value: '08', label: '08 - AÇÕES COMPLEMENTARES DA ATENÇÃO À SAÚDE' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!filters.codigoGrupo) {
      setError('Código do grupo é obrigatório!');
      return;
    }

    if (filters.competencia && !validarCompetencia(filters.competencia)) {
      setError('Competência deve estar no formato AAAAMM (ex: 202501) e ser uma data válida!');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const procedureResults = await searchProcedures(filters, environment);
      setResults(procedureResults);
      setSuccess('Procedimentos encontrados com sucesso! (Demonstração)');
    } catch (err) {
      setError('Erro ao pesquisar procedimentos: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    if (field === 'competencia') {
      value = formatNumericInput(value, 6);
    }
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Search size={24} />
        Pesquisar Procedimentos
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código do Grupo *
            </label>
            <select
              value={filters.codigoGrupo}
              onChange={(e) => handleInputChange('codigoGrupo', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
              required
            >
              {groupOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código do Subgrupo (Opcional)
            </label>
            <input
              type="text"
              value={filters.codigoSubgrupo}
              onChange={(e) => handleInputChange('codigoSubgrupo', e.target.value)}
              placeholder="Ex: 01"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Competência (AAAAMM)
            </label>
            <input
              type="text"
              value={filters.competencia}
              onChange={(e) => handleInputChange('competencia', e.target.value)}
              placeholder={`Ex: ${getCurrentCompetencia()}`}
              maxLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Registros por página
            </label>
            <select
              value={filters.quantidadeRegistros}
              onChange={(e) => handleInputChange('quantidadeRegistros', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
          {loading ? 'Pesquisando...' : 'Pesquisar Procedimentos'}
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

      {results.length > 0 && (
        <div className="mt-8 space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="font-bold text-blue-600 text-lg mb-2 flex items-center gap-2">
                📋 {result.codigo}
              </div>
              <div className="text-gray-800 mb-4">{result.nome}</div>
              <button
                onClick={() => onShowProcedureDetails(result.codigo)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
              >
                <Eye size={16} />
                Ver Detalhes
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchProcedures;