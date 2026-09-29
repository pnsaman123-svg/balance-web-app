import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  TrendingUp,
  ArrowRightLeft,
  Sparkles,
  SlidersHorizontal,
  Wallet,
  AlertTriangle,
  Delete,
  Check,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import CategoryIcon from '../components/CategoryIcon';
import AnimatedNumber from '../components/AnimatedNumber';
import AdjustAllocationModal from '../components/AdjustAllocationModal';

export default function HomeScreen({ onOpenAddExpense, onOpenAddIncome, onNavigateTab, onSelectCategoryDetail }) {
  const {
    selectedMonth,
    currency,
    formatCurrency,
    totalIncome,
    totalAllocated,
    totalSpent,
    totalBalance,
    needs,
    wants,
    savings,
    transactions,
    userName,
    calculations,
  } = useFinance();

  // Slide state: 0 = Keypad, 1 = Overview
  const [homeSlide, setHomeSlide] = useState(0);
  const [homeAmountStr, setHomeAmountStr] = useState('0');
  const [isAdjustAllocationOpen, setIsAdjustAllocationOpen] = useState(false);

  const handleKeypadPress = (val) => {
    if (val === 'backspace') {
      if (homeAmountStr.length <= 1) {
        setHomeAmountStr('0');
      } else {
        setHomeAmountStr(homeAmountStr.slice(0, -1));
      }
    } else {
      if (homeAmountStr === '0') {
        setHomeAmountStr(val);
      } else if (homeAmountStr.length < 9) {
        setHomeAmountStr(homeAmountStr + val);
      }
    }
  };

  const handleQuickAddExpense = () => {
    const amt = parseFloat(homeAmountStr);
    if (!amt || amt <= 0) return;
    onOpenAddExpense(homeAmountStr);
    setHomeAmountStr('0');
  };

  const recentTransactions = transactions.slice(0, 5);
  const budgetSpentPercent = totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0;

  const currencyIsoCode =
    currency === '₹' ? 'INR' : currency === '$' ? 'USD' : currency === '€' ? 'EUR' : currency === '£' ? 'GBP' : 'USD';

  const getAmountSplit = (rawStr, currencySym) => {
    const s = rawStr || '0';
    if (s.includes('.')) {
      const [intPart, decPart] = s.split('.');
      const intNum = parseFloat(intPart || '0');
      return {
        intStr: `${currencySym}${intNum.toLocaleString('en-IN')}`,
        decStr: decPart !== undefined ? `.${decPart}` : '.00',
      };
    } else {
      const intNum = parseFloat(s || '0');
      return {
        intStr: `${currencySym}${intNum.toLocaleString('en-IN')}`,
        decStr: '.00',
      };
    }
  };

  const splitAmount = getAmountSplit(homeAmountStr, currency);

  return (
    <div className="flex flex-col min-h-screen bg-[#090909] text-[#FFFFFF]">
      {/* ---------------------------------------------------- */}
      {/* DARK UPPER DASHBOARD SECTION */}
      {/* ---------------------------------------------------- */}
      <div className="px-4 pt-3 pb-8 space-y-3 bg-[#090909] flex-1 flex flex-col">
        {/* Top Header Row: Month Selector | Avatar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 bg-[#141414] border border-[#242424] px-3 py-1.5 rounded-full text-xs font-bold text-[#FFFFFF]">
            <span>{selectedMonth}</span>
            <ChevronDown size={13} className="text-[#8A8A8A]" />
          </div>

          <div className="w-9 h-9 rounded-full bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-xs font-bold text-[#FFFFFF]">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>

        {/* Home Content Container with Swipe Support */}
        <div
          className="flex-1 flex flex-col pt-1 pb-16 min-h-[520px]"
          onTouchStart={(e) => {
            window._touchStartX = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (window._touchStartX !== undefined) {
              const diff = window._touchStartX - e.changedTouches[0].clientX;
              if (diff > 45) setHomeSlide(1);
              if (diff < -45) setHomeSlide(0);
            }
          }}
        >
          {/* Main Transitioning Section */}
          <div className="flex-1 flex flex-col justify-between max-w-sm mx-auto w-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              {homeSlide === 0 ? (
                <motion.div
                  key="keypad-slide"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col justify-end space-y-4 w-full"
                >
                  {/* Top Hero Amount Row directly right above the numpad */}
                  <div className="flex items-end justify-between px-1">
                    <span className="text-4xl font-extrabold text-[#71717A] tracking-wide">
                      {currencyIsoCode}
                    </span>

                    <div className="flex items-end space-x-2">
                      <div className="flex items-baseline">
                        <span className="text-5xl md:text-6xl font-black text-[#FFFFFF] tracking-tight font-sans">
                          {splitAmount.intStr}
                        </span>
                        <span className="text-2xl font-bold text-[#8E8E93] ml-0.5">
                          {splitAmount.decStr}
                        </span>
                      </div>

                      {homeAmountStr !== '0' && (
                        <button
                          onClick={() => handleKeypadPress('backspace')}
                          className="p-2 mb-1 bg-[#1C1C20] rounded-xl text-[#71717A] hover:text-[#FFFFFF] cursor-pointer transition-colors"
                        >
                          <Delete size={20} strokeWidth={2.2} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Keypad Container Card with Overlapping Total Balance Pill */}
                  <div className="bg-[#151518] border border-[#222228] rounded-[32px] px-3.5 pt-7 pb-4 relative mt-2">
                    {/* Total Balance Pill Overlapping Top Edge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFFFFF] border-2 border-[#000000] px-5 py-1.5 rounded-full shadow-lg flex items-center space-x-1 whitespace-nowrap z-10">
                      <span className="text-xs font-medium text-[#000000]">Total Balance:</span>
                      <strong className="text-xs font-extrabold text-[#000000]">
                        {formatCurrency(totalBalance)}
                      </strong>
                    </div>

                    {/* 4x3 Grid of Key Tiles */}
                    <div className="space-y-2.5 mt-1">
                      <div className="grid grid-cols-3 gap-2.5">
                        {['1', '2', '3'].map((k) => (
                          <button
                            key={k}
                            onClick={() => handleKeypadPress(k)}
                            className="h-16 rounded-2xl bg-[#222227] border border-[#2A2A30] text-2xl font-semibold text-[#FFFFFF] hover:bg-[#2A2A32] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                          >
                            {k}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        {['4', '5', '6'].map((k) => (
                          <button
                            key={k}
                            onClick={() => handleKeypadPress(k)}
                            className="h-16 rounded-2xl bg-[#222227] border border-[#2A2A30] text-2xl font-semibold text-[#FFFFFF] hover:bg-[#2A2A32] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                          >
                            {k}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        {['7', '8', '9'].map((k) => (
                          <button
                            key={k}
                            onClick={() => handleKeypadPress(k)}
                            className="h-16 rounded-2xl bg-[#222227] border border-[#2A2A30] text-2xl font-semibold text-[#FFFFFF] hover:bg-[#2A2A32] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                          >
                            {k}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        <button
                          onClick={() => {
                            if (!homeAmountStr.includes('.')) {
                              setHomeAmountStr(homeAmountStr === '0' ? '0.' : homeAmountStr + '.');
                            }
                          }}
                          className="h-16 rounded-2xl bg-[#222227] border border-[#2A2A30] text-2xl font-semibold text-[#FFFFFF] hover:bg-[#2A2A32] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                        >
                          .
                        </button>

                        <button
                          onClick={() => handleKeypadPress('0')}
                          className="h-16 rounded-2xl bg-[#222227] border border-[#2A2A30] text-2xl font-semibold text-[#FFFFFF] hover:bg-[#2A2A32] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                        >
                          0
                        </button>

                        <button
                          onClick={() => {
                            if (parseFloat(homeAmountStr || '0') > 0) {
                              handleQuickAddExpense();
                            } else {
                              handleKeypadPress('backspace');
                            }
                          }}
                          className={`h-16 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                            parseFloat(homeAmountStr || '0') > 0
                              ? 'bg-[#FFFFFF] text-[#000000] hover:bg-[#E5E5E5] active:scale-95'
                              : 'bg-[#222227] border border-[#2A2A30] text-[#71717A] hover:bg-[#2A2A32]'
                          }`}
                        >
                          {parseFloat(homeAmountStr || '0') > 0 ? (
                            <Check size={28} strokeWidth={3} />
                          ) : (
                            <Delete size={24} strokeWidth={2.2} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="overview-slide"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col justify-between space-y-3 w-full"
                >
                  {/* Monthly Budget Card */}
                  <div className="bg-[#1A1A1E] border border-[#28282E] rounded-3xl p-5 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#8A8A8A] tracking-wider uppercase">
                        Monthly Budget
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#28282E] text-[#D6D6D6]">
                        {budgetSpentPercent}% used
                      </span>
                    </div>

                    <span className="text-2xl font-black text-[#FFFFFF] font-sans block">
                      <AnimatedNumber value={totalIncome} currency={currency} />
                    </span>

                    <div className="flex items-center justify-between text-xs text-[#8A8A8A] pt-1">
                      <span>
                        Spent <strong className="text-[#FFFFFF]">{formatCurrency(totalSpent)}</strong>
                      </span>
                      <span>
                        Remaining <strong className="text-[#FFFFFF]">{formatCurrency(totalBalance)}</strong>
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#28282E] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(5, budgetSpentPercent))}%` }}
                        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full bg-[#FFFFFF] rounded-full"
                      />
                    </div>
                  </div>

                  {/* Recent Transactions Card */}
                  <div className="bg-[#151518] border border-[#222228] rounded-3xl p-4 shadow-xl space-y-3 flex-1 flex flex-col min-h-[300px]">
                    <div className="flex items-center justify-between shrink-0">
                      <span className="text-[10px] font-bold text-[#8A8A8A] tracking-wider uppercase">
                        Recent Transactions
                      </span>
                      <button
                        onClick={() => onNavigateTab('budget')}
                        className="text-xs font-semibold text-[#8A8A8A] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                      >
                        View all ({transactions.length})
                      </button>
                    </div>

                    <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                      {/* Over Budget Alert Card if any */}
                      {calculations?.overBudgetSubcategories?.length > 0 && (
                        <div className="p-2.5 bg-[#1E1E24] border border-[#3A2222] rounded-2xl mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1.5">
                              <AlertTriangle size={13} className="text-[#FF5C5C]" />
                              <span className="text-[10px] font-bold text-[#FF5C5C] uppercase">Budget Exceeded</span>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#3A1414] text-[#FF9999]">
                              {calculations.overBudgetSubcategories.length} Over
                            </span>
                          </div>
                          {calculations.overBudgetSubcategories.map((sub) => (
                            <div key={sub.id} className="flex justify-between items-center text-xs py-0.5">
                              <span className="text-[#FFFFFF] truncate text-[11px]">{sub.name}</span>
                              <span className="text-[#FF7575] font-mono text-[11px] font-bold">+{currency}{sub.overAmount}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {recentTransactions.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#8A8A8A] bg-[#1E1E24] rounded-2xl border border-[#282828]">
                          No transactions recorded for this month
                        </div>
                      ) : (
                        recentTransactions.map((tx) => (
                          <div
                            key={tx.id}
                            onClick={() => onSelectCategoryDetail && onSelectCategoryDetail(tx.categoryId, tx.subcategoryId)}
                            className="flex items-center justify-between p-2.5 rounded-2xl bg-[#1E1E24] border border-[#2A2A32] hover:border-[#383842] transition-colors cursor-pointer"
                          >
                            <div className="flex items-center space-x-3">
                              <CategoryIcon icon={tx.icon} color="#FFFFFF" bgColor="#282830" size={16} />
                              <div>
                                <span className="text-xs font-bold text-[#FFFFFF] block">{tx.title}</span>
                                <span className="text-[10px] text-[#8A8A8A]">
                                  {tx.categoryId === 'needs' ? 'Needs' : tx.categoryId === 'wants' ? 'Wants' : 'Savings'} → {tx.subcategoryName || 'General'}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#FFFFFF]">
                              − {formatCurrency(tx.amount)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 100% FIXED STATIC CAROUSEL DOTS */}
          <div className="flex items-center justify-center space-x-2 py-2 shrink-0">
            <button
              onClick={() => setHomeSlide(0)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                homeSlide === 0 ? 'w-6 bg-[#FFFFFF]' : 'w-1.5 bg-[#333333] hover:bg-[#555555]'
              }`}
              aria-label="Keypad Slide"
            />
            <button
              onClick={() => setHomeSlide(1)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                homeSlide === 1 ? 'w-6 bg-[#FFFFFF]' : 'w-1.5 bg-[#333333] hover:bg-[#555555]'
              }`}
              aria-label="Overview Slide"
            />
          </div>
        </div>
      </div>

      {/* Adjust Allocation Modal */}
      <AdjustAllocationModal
        isOpen={isAdjustAllocationOpen}
        onClose={() => setIsAdjustAllocationOpen(false)}
      />
    </div>
  );
}

