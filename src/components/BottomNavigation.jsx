import React from 'react';
import {
  Home,
  Wallet,
  Settings,
} from 'lucide-react';

export default function BottomNavigation({ currentTab, setTab }) {
  const tabs = [
    { id: 'home', icon: Home },
    { id: 'budget', icon: Wallet },
    { id: 'settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 px-4 pointer-events-auto flex justify-center">
      <div className="flex items-center bg-[#121212] border border-[#262626] p-2 rounded-full shadow-2xl shadow-black/90 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? 'bg-[#FFFFFF] text-[#090909] shadow-lg scale-105'
                  : 'bg-[#1C1C1C] text-[#8A8A8A] hover:text-[#FFFFFF] hover:bg-[#252525]'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.6 : 2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
