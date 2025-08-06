import React from 'react';
import { Hospital } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-blue-600 text-white p-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-3">
        <Hospital size={40} className="text-white" />
        <h1 className="text-4xl font-bold drop-shadow-lg">SIGTAP WebApp</h1>
      </div>
      <p className="text-lg opacity-90">
        Sistema de Consulta de Procedimentos, Medicamentos e OPM do SUS
      </p>
    </div>
  );
};

export default Header;