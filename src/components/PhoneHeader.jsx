import React, { useState, useEffect } from 'react';
import { Bell, Wifi, Battery, Signal, User, ChevronDown, Check, Calendar } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const AVAILABLE_MONTHS = [
  { id: '2026-08', label: 'August 2026' },
  { id: '2026-09', label: 'September 2026' },
  { id: '2026-10', label: 'October 2026' },
  { id: '2026-11', label: 'November 2026' },
];

export default function PhoneHeader({ onProfileClick, onNotificationClick, isInsidePhone = true }) {
  const { userName, selectedMonthId, selectedMonth, switchMonth } = useFinance();
  const [time, setTime] = useState('11:08');
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="w-full flex flex-col z-30">
      {/* Top Mobile Status Bar */}
      {isInsidePhone && (
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold text-[#8A8A8A]">
          <span>{time}</span>
          
          {/* Dynamic Island Capsule */}
          <div className="w-24 h-5 bg-[#000000] rounded-full flex items-center justify-center border border-[#1C1C1C]">
            <div className="w-2 h-2 rounded-full bg-[#1C1C1C] mr-2"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#111111]"></div>
          </div>

          <div className="flex items-center space-x-1.5 text-[#8A8A8A]">
            <Signal size={12} strokeWidth={2.5} />
            <Wifi size={12} strokeWidth={2.5} />
            <Battery size={13} strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* Main App Navigation Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 relative">
        <div className="flex items-center space-x-3">
          {/* User Avatar */}
          <div 
            onClick={onProfileClick}
            className="w-9 h-9 rounded-full bg-[#1C1C1C] border border-[#292929] flex items-center justify-center cursor-pointer hover:border-[#666666] transition-all"
          >
            <span className="text-xs font-bold text-[#FFFFFF]">
              {userName ? userName.charAt(0).toUpperCase() : 'S'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-[#8A8A8A] tracking-tight">
              {getGreeting()}, {userName}
            </span>
            
            {/* Interactive Month Switcher Dropdown Trigger */}
            <button
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
              className="flex items-center space-x-1 text-xs font-bold text-[#FFFFFF] hover:text-[#D6D6D6] transition-colors"
            >
              <span>{selectedMonth}</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${isMonthPickerOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Circular Notification Bell */}
        <button 
          onClick={onNotificationClick}
          className="relative w-9 h-9 rounded-full bg-[#161616] border border-[#242424] flex items-center justify-center hover:bg-[#1C1C1C] transition-all"
        >
          <Bell size={16} className="text-[#D6D6D6]" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#FFFFFF]"></span>
        </button>

        {/* Month Selector Dropdown Menu */}
        {isMonthPickerOpen && (
          <div className="absolute top-14 left-14 z-40 bg-[#161616] border border-[#292929] rounded-2xl p-2 shadow-2xl space-y-1 min-w-[170px] animate-in fade-in">
            <div className="px-3 py-1 text-[10px] font-bold text-[#666666] uppercase tracking-wider">
              Select Budget Month
            </div>
            {AVAILABLE_MONTHS.map((m) => {
              const isSelected = selectedMonthId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    switchMonth(m.id, m.label);
                    setIsMonthPickerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[#242424] text-[#FFFFFF] font-bold'
                      : 'text-[#8A8A8A] hover:bg-[#1C1C1C] hover:text-[#FFFFFF]'
                  }`}
                >
                  <span>{m.label}</span>
                  {isSelected && <Check size={13} className="text-[#FFFFFF]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
