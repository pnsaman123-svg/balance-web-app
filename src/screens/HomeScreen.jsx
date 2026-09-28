import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowUpRight, ArrowDownLeft, ChevronRight, ChevronDown, Layers, TrendingUp, ArrowRightLeft, Sparkles, SlidersHorizontal, Wallet, AlertTriangle } from 'lucide-react';
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

  // Expanded state for unfolding category cards in-place
  const [expandedCatId, setExpandedCatId] = useState('needs');
  const [isAdjustAllocationOpen, setIsAdjustAllocationOpen] = useState(false);

  const recentTransactions = transactions.slice(0, 5);
  const budgetSpentPercent = totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#090909] text-[#FFFFFF]">
      {/* ---------------------------------------------------- */}
      {/* DARK UPPER DASHBOARD SECTION */}
      {/* ---------------------------------------------------- */}
      <div className="px-5 pt-3 pb-8 space-y-5 bg-[#090909]">
        {/* Top Header Row: Good morning + Month */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8A8A8A] font-medium block">Good morning</span>
            <span className="text-sm font-bold text-[#FFFFFF] mt-0.5 block">{selectedMonth}</span>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-xs font-bold text-[#FFFFFF]">
            {userName ? userName.charAt(0).toUpperCase() : 'S'}
          </div>
        </div>

        {/* Large Prominent Hero Balance */}
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <h1 className="text-5xl font-black text-[#FFFFFF] tracking-tight font-sans">
            <AnimatedNumber value={totalBalance} currency={currency} duration={900} />
          </h1>
          <span className="text-xs font-medium text-[#8A8A8A] mt-1.5">
            Remaining balance
          </span>
        </div>

        {/* Quick Action Pills: + Expense | Budget | Income */}
        <div className="flex items-center justify-center space-x-2.5 py-1">
          <button
            onClick={onOpenAddExpense}
            className="flex items-center space-x-1.5 bg-[#FFFFFF] text-[#090909] hover:bg-[#E5E5E5] px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-md active:scale-95"
          >
            <Plus size={14} strokeWidth={3} />
            <span>+ Expense</span>
          </button>

          <button
            onClick={() => onNavigateTab('budget')}
            className="flex items-center space-x-1.5 bg-[#1C1C1C] text-[#FFFFFF] hover:bg-[#282828] border border-[#292929] px-4 py-2.5 rounded-full font-semibold text-xs transition-all active:scale-95"
          >
            <Wallet size={13} strokeWidth={2} />
            <span>Budget</span>
          </button>

          <button
            onClick={onOpenAddIncome}
            className="flex items-center space-x-1.5 bg-[#1C1C1C] text-[#FFFFFF] hover:bg-[#282828] border border-[#292929] px-4 py-2.5 rounded-full font-semibold text-xs transition-all active:scale-95"
          >
            <ArrowDownLeft size={13} strokeWidth={2} />
            <span>Income</span>
          </button>
        </div>

        {/* Over Budget Alert Card (if any subcategory is exceeded) */}
        {calculations?.overBudgetSubcategories?.length > 0 && (
          <div className="bg-[#141414] border border-[#3A2222] rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={15} className="text-[#FF5C5C]" />
                <span className="text-[11px] font-bold text-[#FF5C5C] tracking-wide uppercase">
                  Budget Exceeded Warning
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3A1414] text-[#FF9999]">
                {calculations.overBudgetSubcategories.length} Over Limit
              </span>
            </div>

            <div className="space-y-2">
              {calculations.overBudgetSubcategories.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => onNavigateTab('budget')}
                  className="flex items-center justify-between p-2.5 bg-[#1C1C1C] border border-[#2D2020] rounded-2xl cursor-pointer hover:border-[#4A3030] transition-all"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-[#281818] flex items-center justify-center shrink-0">
                      <CategoryIcon iconName={sub.icon} size={13} variant="dark" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#FFFFFF] truncate">
                        {sub.name} <span className="text-[10px] text-[#A0A0A0]">({sub.parentCategoryName || 'Budget'})</span>
                      </div>
                      <div className="text-[10px] text-[#888888]">
                        Limit: {currency}{Number(sub.budget).toLocaleString('en-IN')} · Spent: {currency}{Number(sub.spent).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-black font-mono text-[#FF7575] shrink-0 pl-2">
                    +{currency}{Number(sub.overAmount).toLocaleString('en-IN')} Over
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floating Charcoal Monthly Budget Card */}
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
        {/* Recent Transactions Charcoal Card */}
        <div className="bg-[#141414] border border-[#242424] rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8A8A8A] tracking-wider uppercase">
              Recent Transactions
            </span>
            <button
              onClick={() => onNavigateTab('budget')}
              className="text-xs font-semibold text-[#8A8A8A] hover:text-[#FFFFFF] transition-colors"
            >
              View all ({transactions.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8A8A8A] bg-[#1C1C1C] rounded-2xl border border-[#282828]">
                No transactions recorded for this month.
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => onNavigateTab('budget')}
                  className="flex items-center justify-between p-3.5 bg-[#1C1C1C] border border-[#282828] rounded-2xl hover:border-[#383838] transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#242424] flex items-center justify-center shrink-0">
                      <CategoryIcon iconName={tx.icon} size={15} variant="dark" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-[#FFFFFF] truncate">{tx.title}</span>
                      <span className="text-[10.5px] text-[#8A8A8A] truncate mt-0.5">
                        {tx.categoryId === 'needs' ? 'Needs' : tx.categoryId === 'wants' ? 'Wants' : 'Savings'} → {tx.subcategoryName || 'General'} · {tx.date}
                      </span>
                    </div>
                  </div>

                  <span className="text-sm font-bold font-mono text-[#FFFFFF] shrink-0 pl-3">
                    − {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
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
