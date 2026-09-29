import React from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Home,
  Settings,
} from 'lucide-react';

export default function BottomNavigation({ currentTab, setTab }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-auto flex justify-center">
      <div className="relative w-full max-w-[420px] h-[86px]">
        {/* SVG Curve Background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-2xl"
          viewBox="0 0 400 86"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* Main Curved Body */}
          <path
            d="M 0,26 L 152,26 C 176,26 178,2 200,2 C 222,2 224,26 248,26 L 400,26 L 400,86 L 0,86 Z"
            fill="#121214"
          />
          {/* Top Border */}
          <path
            d="M 0,26 L 152,26 C 176,26 178,2 200,2 C 222,2 224,26 248,26 L 400,26"
            stroke="#26262E"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>

        {/* Tab Items Row */}
        <div className="relative z-10 w-full h-full flex items-end justify-between px-8 pb-3">
          {/* Left: Budgets */}
          <button
            onClick={() => setTab('budget')}
            className="flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors duration-200"
            aria-label="Budgets"
          >
            <Wallet
              size={22}
              className={`transition-colors duration-200 ${
                currentTab === 'budget' ? 'text-white stroke-[2.5]' : 'text-[#8A8A8A] hover:text-white stroke-[1.8]'
              }`}
            />
            <span
              className={`text-[11px] font-sans tracking-wide transition-colors duration-200 ${
                currentTab === 'budget' ? 'text-white font-semibold' : 'text-[#8A8A8A]'
              }`}
            >
              Budgets
            </span>
          </button>

          {/* Center: Raised Home Button */}
          <button
            onClick={() => setTab('home')}
            className="flex flex-col items-center justify-center cursor-pointer -mt-7 z-20 group"
            aria-label="Home"
          >
            <motion.div
              whileTap={{ scale: 0.92 }}
              className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-200 shadow-xl ${
                currentTab === 'home'
                  ? 'bg-white text-[#090909] shadow-white/10'
                  : 'bg-[#1E1E24] text-white border border-[#2F2F38] group-hover:border-white/40'
              }`}
            >
              <Home size={24} className="stroke-[2.4]" />
            </motion.div>
            <span
              className={`text-[11px] font-sans tracking-wide mt-1 transition-colors duration-200 ${
                currentTab === 'home' ? 'text-white font-semibold' : 'text-[#8A8A8A]'
              }`}
            >
              Home
            </span>
          </button>

          {/* Right: Settings */}
          <button
            onClick={() => setTab('settings')}
            className="flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors duration-200"
            aria-label="Settings"
          >
            <Settings
              size={22}
              className={`transition-colors duration-200 ${
                currentTab === 'settings' ? 'text-white stroke-[2.5]' : 'text-[#8A8A8A] hover:text-white stroke-[1.8]'
              }`}
            />
            <span
              className={`text-[11px] font-sans tracking-wide transition-colors duration-200 ${
                currentTab === 'settings' ? 'text-white font-semibold' : 'text-[#8A8A8A]'
              }`}
            >
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
