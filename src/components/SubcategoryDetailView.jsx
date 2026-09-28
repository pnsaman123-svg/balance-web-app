import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Edit2, ChevronRight, Calendar } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import CategoryIcon from './CategoryIcon';
import AnimatedNumber from './AnimatedNumber';

export default function SubcategoryDetailView({ categoryId, subcategoryId, onClose, onOpenAddExpense, onEditTransaction }) {
  const { categories, transactions, currency, formatCurrency, deleteTransaction } = useFinance();

  const category = categories.find((c) => c.id === categoryId) || categories[0];
  const subcategory = category.subcategories.find((s) => s.id === subcategoryId) || category.subcategories[0];

  const subTransactions = transactions.filter((t) => t.subcategoryId === subcategoryId);
  const totalSpent = subTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const remaining = Math.max(0, subcategory.budget - totalSpent);
  const percentSpent = subcategory.budget > 0 ? Math.min(100, Math.round((totalSpent / subcategory.budget) * 100)) : 0;
  const percentRemaining = Math.max(0, 100 - percentSpent);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col min-h-full bg-[#0A0A0A] text-[#FFFFFF] px-5 py-3 select-none"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between py-2 mb-2">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#181818] border border-[#242424] flex items-center justify-center text-[#FFFFFF]"
        >
          <ArrowLeft size={18} />
        </button>

        <span className="text-xs font-bold tracking-wider text-[#8A8A8A] uppercase">
          {category.name} → {subcategory.name}
        </span>

        <button
          onClick={onOpenAddExpense}
          className="w-10 h-10 rounded-full bg-[#FFFFFF] text-[#0A0A0A] flex items-center justify-center font-bold"
        >
          <Plus size={18} strokeWidth={2.8} />
        </button>
      </div>

      {/* Subcategory Hero Stats Card */}
      <div className="bg-[#141414] border border-[#242424] rounded-3xl p-6 space-y-4 my-2 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <CategoryIcon iconName={subcategory.icon} size={20} variant="light" />
            <div>
              <h2 className="text-lg font-black text-[#FFFFFF]">{subcategory.name}</h2>
              <span className="text-xs text-[#8A8A8A] font-mono">
                {category.name} Pillar · Limit {formatCurrency(subcategory.budget)}
              </span>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-[#1C1C1C] border border-[#292929] text-xs font-mono font-semibold text-[#D6D6D6]">
            {percentSpent}% used
          </div>
        </div>

        {/* 3 Metric Pillars: Budget | Spent | Remaining */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-3">
            <span className="text-[10px] font-medium text-[#666666] block">Budget</span>
            <span className="text-sm font-bold text-[#D6D6D6] font-mono mt-0.5 block">
              <AnimatedNumber value={subcategory.budget} currency={currency} />
            </span>
          </div>

          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-3">
            <span className="text-[10px] font-medium text-[#666666] block">Spent</span>
            <span className="text-sm font-bold text-[#8A8A8A] font-mono mt-0.5 block">
              <AnimatedNumber value={totalSpent} currency={currency} />
            </span>
          </div>

          <div className="bg-[#1C1C1C] border border-[#292929] rounded-2xl p-3">
            <span className="text-[10px] font-medium text-[#D6D6D6] block">Remaining</span>
            <span className="text-sm font-bold text-[#FFFFFF] font-mono mt-0.5 block">
              <AnimatedNumber value={remaining} currency={currency} />
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="w-full h-2 bg-[#222222] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(4, percentSpent))}%` }}
              transition={{ duration: 0.65 }}
              className="h-full bg-[#FFFFFF] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Associated Transactions Feed */}
      <div className="mt-4 space-y-3 pb-8">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
            Transactions History
          </span>
          <span className="text-xs font-mono text-[#666666]">
            {subTransactions.length} recorded
          </span>
        </div>

        {subTransactions.length === 0 ? (
          <div className="py-12 text-center bg-[#111111] border border-[#1E1E1E] rounded-3xl p-6 space-y-2">
            <span className="text-xs font-bold text-[#D6D6D6] block">No spending activity yet</span>
            <p className="text-[11px] text-[#666666]">
              Tap the + button to add your first expense to {subcategory.name}.
            </p>
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#222222] rounded-3xl p-4 divide-y divide-[#1F1F1F]">
            {subTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 group">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#FFFFFF] truncate">{tx.title}</span>
                    <span className="text-[10px] text-[#666666] font-mono mt-0.5">{tx.date}</span>
                    {tx.notes && <span className="text-[10px] text-[#8A8A8A] italic truncate">{tx.notes}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 pl-2">
                  <span className="text-xs font-bold font-mono text-[#E0E0E0]">
                    − {formatCurrency(tx.amount)}
                  </span>

                  <button
                    onClick={() => {
                      if (onEditTransaction) onEditTransaction(tx);
                    }}
                    className="p-1 text-[#666666] hover:text-[#FFFFFF] transition-colors"
                    title="Edit transaction"
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1 text-[#666666] hover:text-[#FFFFFF] transition-colors"
                    title="Delete transaction"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
