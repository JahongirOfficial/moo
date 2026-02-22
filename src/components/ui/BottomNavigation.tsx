import React from 'react';

interface BottomNavigationProps {
  activeTab?: 'home' | 'courses' | 'search' | 'profile' | 'categories';
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab = 'home' }) => {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Asosiy' },
    { id: 'courses', icon: 'school', label: 'Kurslar' },
    { id: 'search', icon: 'search', label: 'Qidiruv' },
    { id: 'profile', icon: 'person', label: 'Profil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-800 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.slice(0, 2).map((tab) => (
          <button
            key={tab.id}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full ${
              activeTab === tab.id ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
            } transition-colors`}
          >
            <span className="material-symbols-outlined text-2xl">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
        
        {/* Center Add Button */}
        <div className="relative -top-5">
          <button className="flex items-center justify-center size-12 rounded-full bg-primary text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>
        </div>

        {tabs.slice(2).map((tab) => (
          <button
            key={tab.id}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full ${
              activeTab === tab.id ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
            } transition-colors`}
          >
            <span className="material-symbols-outlined text-2xl">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="h-5 bg-white dark:bg-slate-800 w-full" />
    </div>
  );
};

export default BottomNavigation;




