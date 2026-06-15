import React from 'react';

type Tab = 'products' | 'project' | 'updates';

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const TabNavigation: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'project', label: 'Project', icon: '📋' },
    { id: 'updates', label: 'Updates', icon: '📰' },
  ];

  return (
    <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 px-4 text-center font-semibold transition ${
            activeTab === tab.id
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
