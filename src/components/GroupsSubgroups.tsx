import React, { useState } from 'react';
import { BarChart3, List, Loader2 } from 'lucide-react';
import { Group, Subgroup } from '../types/sigtap';
import { listGroups, listSubgroups } from '../services/sigtapService';

const GroupsSubgroups: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
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

  const handleListAllGroups = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setGroups([]);
    setSubgroups([]);

    try {
      const groupsList = await listGroups('producao');
      setGroups(groupsList);
      setSuccess('Grupos listados com sucesso! (Demonstração)');
    } catch (err) {
      setError('Erro ao listar grupos: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleListSubgroups = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGroup) {
      setError('Selecione um grupo para listar os subgrupos!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setSubgroups([]);

    try {
      const subgroupsList = await listSubgroups(selectedGroup, 'producao');
      setSubgroups(subgroupsList);
      setSuccess(`Subgrupos do grupo ${selectedGroup} listados com sucesso! (Demonstração)`);
    } catch (err) {
      setError('Erro ao listar subgrupos: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSubgroupsForGroup = async (codigoGrupo: string) => {
    setSelectedGroup(codigoGrupo);
    setLoading(true);
    setError('');
    setSuccess('');
    setSubgroups([]);

    try {
      const subgroupsList = await listSubgroups(codigoGrupo, 'producao');
      setSubgroups(subgroupsList);
      setSuccess(`Subgrupos do grupo ${codigoGrupo} listados com sucesso! (Demonstração)`);
    } catch (err) {
      setError('Erro ao listar subgrupos: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BarChart3 size={24} />
        Consultar Grupos e Subgrupos
      </h2>

      <div className="mb-6">
        <button
          onClick={handleListAllGroups}
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <List size={20} />}
          Listar Todos os Grupos
        </button>
      </div>

      <form onSubmit={handleListSubgroups} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código do Grupo (para listar subgrupos)
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            >
              {groupOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <List size={20} />}
              Listar Subgrupos
            </button>
          </div>
        </div>
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

      {groups.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Grupos:</h3>
          {groups.map((group, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="font-bold text-blue-600 text-lg mb-2 flex items-center gap-2">
                📊 {group.codigo}
              </div>
              <div className="text-gray-800 mb-4">{group.nome}</div>
              <button
                onClick={() => handleLoadSubgroupsForGroup(group.codigo)}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
              >
                <List size={16} />
                Ver Subgrupos
              </button>
            </div>
          ))}
        </div>
      )}

      {subgroups.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Subgrupos:</h3>
          {subgroups.map((subgroup, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="font-bold text-blue-600 text-lg mb-2 flex items-center gap-2">
                📋 {subgroup.grupo}.{subgroup.codigo}
              </div>
              <div className="text-gray-800 mb-2">{subgroup.nome}</div>
              <div className="text-sm text-gray-600">Grupo: {subgroup.grupo}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsSubgroups;