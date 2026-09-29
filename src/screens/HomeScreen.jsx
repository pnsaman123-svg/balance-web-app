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

  return (
    <div className="flex flex-col min-h-screen bg-[#090909] text-[#FFFFFF]">
      {/* ---------------------------------------------------- */}
      {/* DARK UPPER DASHBOARD SECTION */}
      {/* ---------------------------------------------------- */}
      <div className="px-5 pt-3 pb-8 space-y-4 bg-[#090909] flex-1 flex flex-col">
        {/* Top Header Row: Month Selector | Avatar (Clean Minimal Header) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 bg-[#141414] border border-[#242424] px-3 py-1.5 rounded-full text-xs font-bold text-[#FFFFFF]">
            <span>{selectedMonth}</span>
            <ChevronDown size={13} className="text-[#8A8A8A]" />
          </div>

          <div className="w-9 h-9 rounded-full bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-xs font-bold text-[#FFFFFF]">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>

        {homeSlide === 0 ? (
          /* SLIDE 1: CENTERED REMAINING BALANCE PILL + BOTTOM KEYPAD + CAROUSEL DOTS ABOVE NUMPAD */
          <motion.div
            key="keypad-slide"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col pt-1 pb-16 min-h-[520px]"
          >
            {/* Top Display Section (flex-1 centered) */}
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-4">
              {/* Centered Remaining Balance Pill */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center space-x-2 bg-[#141414] border border-[#242424] px-4 py-2 rounded-full shadow-md">
                  <span className="w-2 h-2 rounded-full bg-[#FFFFFF]" />
                  <span className="text-xs font-bold text-[#FFFFFF]">
                    {formatCurrency(totalBalance)} Remaining
                  </span>
                </div>
              </div>

              {/* Big Amount Display (Increased Font Size) */}
              <div className="flex items-baseline justify-center py-2 space-x-2 text-center">
                <span className="text-3xl font-bold text-[#8A8A8A]">{currency}</span>
                <span className="text-6xl md:text-7xl font-black text-[#FFFFFF] tracking-tight font-sans">
                  {parseFloat(homeAmountStr || '0').toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Carousel Dots Indicator Just Above Num Pad (Exact Same Vertical Coordinate) */}
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

            {/* Bottom Section: Fixed Height 325 Keypad */}
            <div className="h-[325px] flex flex-col justify-center max-w-sm mx-auto w-full space-y-2.5">
              <div className="grid grid-cols-3 gap-2.5">
                {['1', '2', '3'].map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKeypadPress(k)}
                    className="h-16 rounded-2xl bg-[#141414] border border-[#242424] text-2xl font-bold text-[#FFFFFF] hover:bg-[#202020] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
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
                    className="h-16 rounded-2xl bg-[#141414] border border-[#242424] text-2xl font-bold text-[#FFFFFF] hover:bg-[#202020] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
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
                    className="h-16 rounded-2xl bg-[#141414] border border-[#242424] text-2xl font-bold text-[#FFFFFF] hover:bg-[#202020] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleKeypadPress('backspace')}
                  className="h-16 rounded-2xl bg-[#141414] border border-[#242424] text-[#FFFFFF] hover:bg-[#202020] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                >
                  <Delete size={22} strokeWidth={2.4} />
                </button>

                <button
                  onClick={() => handleKeypadPress('0')}
                  className="h-16 rounded-2xl bg-[#141414] border border-[#242424] text-2xl font-bold text-[#FFFFFF] hover:bg-[#202020] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                >
                  0
                </button>

                <button
                  onClick={handleQuickAddExpense}
                  disabled={parseFloat(homeAmountStr || '0') <= 0}
                  className={`h-16 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    parseFloat(homeAmountStr || '0') > 0
                      ? 'bg-[#FFFFFF] text-[#090909] hover:bg-[#E5E5E5] active:scale-95'
                      : 'bg-[#161616] border border-[#222222] text-[#444444] cursor-not-allowed opacity-50'
                  }`}
                >
                  <Check size={26} strokeWidth={3} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* SLIDE 2: MONTHLY BUDGET & RECENT TRANSACTIONS BELOW CAROUSEL DOTS */
          <motion.div
            key="overview-slide"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col pt-1 pb-16 min-h-[520px]"
          >
            {/* Top Section: Monthly Budget Card (flex-1 centered) */}
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <div className="bg-[#141414] border border-[#242424] rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8A8A8A] tracking-wider uppercase">
                    Monthly Budget
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1F1F1F] text-[#D6D6D6]">
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

                <div className="w-full h-1.5 bg-[#242424] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(5, budgetSpentPercent))}%` }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-[#FFFFFF] rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Carousel Dots Indicator Just Above Transactions (Exact Same Vertical Coordinate) */}
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

            {/* Bottom Section: Fixed Height 325 Recent Transactions Card */}
            <div className="h-[325px] flex flex-col max-w-sm mx-auto w-full">
              <div className="bg-[#141414] border border-[#242424] rounded-3xl p-4 shadow-xl space-y-3 h-full flex flex-col">
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
                    <div className="p-2.5 bg-[#1C1C1C] border border-[#3A2222] rounded-2xl mb-2">
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
                    <div className="py-6 text-center text-xs text-[#8A8A8A] bg-[#1C1C1C] rounded-2xl border border-[#282828]">
                      No transactions recorded for this month.
                    </div>
                  ) : (
                    recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => onNavigateTab('budget')}
                        className="flex items-center justify-between p-2.5 bg-[#1C1C1C] border border-[#282828] rounded-2xl hover:border-[#383838] transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#242424] flex items-center justify-center shrink-0">
                            <CategoryIcon iconName={tx.icon} size={14} variant="dark" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-[#FFFFFF] truncate">{tx.title}</span>
                            <span className="text-[10px] text-[#8A8A8A] truncate mt-0.5">
                              {tx.categoryId === 'needs' ? 'Needs' : tx.categoryId === 'wants' ? 'Wants' : 'Savings'} → {tx.subcategoryName || 'General'}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold font-mono text-[#FFFFFF] shrink-0 pl-2">
                          − {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Adjust Allocation Modal */}
      <AdjustAllocationModal
        isOpen={isAdjustAllocationOpen}
        onClose={() => setIsAdjustAllocationOpen(false)}
      />
    </div>
  );
}

