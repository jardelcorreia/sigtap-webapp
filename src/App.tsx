import React, { useState } from 'react';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import SearchProcedures from './components/SearchProcedures';
import ProcedureDetails from './components/ProcedureDetails';
import GroupsSubgroups from './components/GroupsSubgroups';
import { TabType, Environment } from './types/sigtap';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [selectedProcedureCode, setSelectedProcedureCode] = useState<string>('');

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleShowProcedureDetails = (code: string) => {
    setSelectedProcedureCode(code);
    setActiveTab('details');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <SearchProcedures
            onShowProcedureDetails={handleShowProcedureDetails}
          />
        );
      case 'details':
        return (
          <ProcedureDetails
            initialCode={selectedProcedureCode}
          />
        );
      case 'groups':
        return <GroupsSubgroups />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
