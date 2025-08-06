import React from 'react';
import { Search, FileText, BarChart3 } from 'lucide-react';
import { TabType } from '../types/sigtap';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'search' as TabType, label: 'Pesquisar Procedimentos', icon: Search },
    { id: 'details' as TabType, label: 'Detalhar Procedimento', icon: FileText },
    { id: 'groups' as TabType, label: 'Grupos e Subgrupos', icon: BarChart3 }
  ];

  return (
    <div className="flex bg-gray-100 rounded-xl mb-8 overflow-hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white transform -translate-y-1 shadow-lg'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={20} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;