import React, { useState } from 'react';
import { DownloadCloud, Loader2 } from 'lucide-react';
import { listGroups, listSubgroups, getProcedureDetails } from '../services/sigtapService';
import { addGroups, addSubgroups, addProcedures } from '../services/dbService';
import { Group, Subgroup, ProcedureDetails } from '../types/sigtap';

const SyncData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setLoading(true);
    setMessage('Iniciando sincronização...');
    setProgress(0);

    try {
      // 1. Fetch and store groups
      setMessage('Baixando grupos...');
      const groups = await listGroups('producao');
      await addGroups(groups);
      setProgress(20);

      // 2. Fetch and store subgroups
      setMessage('Baixando subgrupos...');
      let allSubgroups: Subgroup[] = [];
      for (const group of groups) {
        const subgroups = await listSubgroups(group.codigo, 'producao');
        allSubgroups = [...allSubgroups, ...subgroups];
      }
      await addSubgroups(allSubgroups);
      setProgress(40);

      // 3. Fetch and store procedures (this is a simplification, as we can't get all procedures at once)
      // In a real application, we would need a more robust way to get all procedures.
      // For this example, we will fetch details for a few procedures to demonstrate the functionality.
      setMessage('Baixando detalhes de procedimentos (demonstração)...');
      const procedureCodes = ['0101010010', '0101010028', '0203010027'];
      let allProcedures: ProcedureDetails[] = [];
      for (const code of procedureCodes) {
        const details = await getProcedureDetails({ codigoProcedimento: code, categoriaDetalhes: 'DESCRICAO' }, 'producao');
        if (details) {
          allProcedures.push(details);
        }
      }
      await addProcedures(allProcedures);
      setProgress(100);
      setMessage('Sincronização concluída com sucesso!');
    } catch (error) {
      setMessage(`Erro na sincronização: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Sincronização de Dados Offline</h3>
      <p className="text-sm text-gray-600 mb-4">
        Baixe os dados do SIGTAP para usar a aplicação offline.
      </p>
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
        {loading ? 'Sincronizando...' : 'Sincronizar Dados'}
      </button>
      {loading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{message}</p>
        </div>
      )}
      {!loading && message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
    </div>
  );
};

export default SyncData;
