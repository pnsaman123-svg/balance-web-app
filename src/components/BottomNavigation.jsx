import React from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Home,
  Settings,
} from 'lucide-react';

export default function BottomNavigation({ currentTab, setTab }) {
  const tabs = [
    { id: 'budget', label: 'Budgets', icon: Wallet },
    { id: 'home', label: 'Home', icon: Home },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 px-4 pointer-events-auto flex justify-center">
      <div className="flex items-center justify-between bg-[#141417]/95 backdrop-blur-md border border-[#26262E] p-2 rounded-full shadow-2xl shadow-black/90 w-80 max-w-[92vw]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className="relative flex-1 h-13 rounded-full flex flex-col items-center justify-center cursor-pointer transition-colors duration-200"
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-[#FFFFFF] rounded-full shadow-md"
                />
              )}
              <span className={`relative z-10 transition-transform duration-200 ${isActive ? 'scale-105' : 'hover:scale-105'}`}>
                <Icon
                  size={23}
                  className={isActive ? 'text-[#090909]' : 'text-[#8A8A8A] hover:text-[#FFFFFF]'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
