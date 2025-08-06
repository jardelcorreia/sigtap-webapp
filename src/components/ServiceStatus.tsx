import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { checkServiceStatus } from '../services/sigtapService';

interface ServiceStatusProps {
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ isOnline, setIsOnline }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckStatus = async () => {
    setLoading(true);
    const status = await checkServiceStatus();
    setIsOnline(status);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
      <div className={`flex items-center gap-2 font-semibold ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
        {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
        <span>{isOnline ? 'Serviço Online' : 'Serviço Offline'}</span>
      </div>
      <button
        onClick={handleCheckStatus}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
        Verificar Status
      </button>
    </div>
  );
};

export default ServiceStatus;
