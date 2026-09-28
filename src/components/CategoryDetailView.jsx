import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, MoreHorizontal, ChevronRight, TrendingDown, Layers } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import CategoryIcon from './CategoryIcon';
import AnimatedNumber from './AnimatedNumber';

export default function CategoryDetailView({ categoryId, onClose, onOpenAddExpense }) {
  const { categories, currency, formatCurrency } = useFinance();
  const category = categories.find((c) => c.id === categoryId) || categories[0];

  const totalSpent = category.subcategories.reduce((sum, s) => sum + (s.spent || 0), 0);
  const remaining = Math.max(0, category.budget - totalSpent);
  const percentSpent = category.budget > 0 ? Math.min(100, Math.round((totalSpent / category.budget) * 100)) : 0;
  const percentRemaining = Math.max(0, 100 - percentSpent);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col min-h-full bg-[#0A0A0A] text-[#FFFFFF] px-5 py-3 select-none"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between py-2 mb-2">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#181818] border border-[#242424] flex items-center justify-center text-[#FFFFFF]"
        >
          <ArrowLeft size={18} />
        </motion.button>

        <span className="text-xs font-bold tracking-wider text-[#8A8A8A] uppercase">
          {category.name} Details
        </span>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onOpenAddExpense}
          className="w-10 h-10 rounded-full bg-[#FFFFFF] text-[#0A0A0A] flex items-center justify-center font-bold"
        >
          <Plus size={18} strokeWidth={2.8} />
        </motion.button>
      </div>

      {/* Hero Category Card with Shared Element Aesthetic */}
      <motion.div
        layoutId={`category-card-${category.id}`}
        className="bg-[#141414] border border-[#262626] rounded-3xl p-6 shadow-2xl space-y-4 my-2"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-black tracking-wider text-[#8A8A8A] uppercase">
              {category.name} Budget
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <h2 className="text-3xl font-extrabold text-[#FFFFFF] font-mono">
                <AnimatedNumber value={remaining} currency={currency} />
              </h2>
              <span className="text-xs font-medium text-[#666666]">remaining</span>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-[#1F1F1F] border border-[#292929] text-xs font-mono font-semibold text-[#D6D6D6]">
            {percentRemaining}% left
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-2.5 bg-[#222222] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(4, percentSpent))}%` }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-[#FFFFFF] rounded-full"
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#666666] font-mono">
            <span>Spent: {formatCurrency(totalSpent)}</span>
            <span>Allocated: {formatCurrency(category.budget)}</span>
          </div>
        </div>
      </motion.div>

      {/* Subcategories Breakdown with Staggered Cascading Animation */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
            Subcategory Allocations
          </span>
          <span className="text-xs font-mono text-[#666666]">
            {category.subcategories.length} items
          </span>
        </div>

        <div className="space-y-2.5">
          {category.subcategories.map((sub, index) => {
            const subSpent = sub.spent || 0;
            const subRemaining = Math.max(0, sub.budget - subSpent);
            const subPercent = sub.budget > 0 ? Math.min(100, Math.round((subSpent / sub.budget) * 100)) : 0;

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#121212] border border-[#202020] rounded-2xl p-4 space-y-2.5 hover:border-[#333333] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CategoryIcon iconName={sub.icon} size={15} variant="light" />
                    <div>
                      <span className="text-xs font-bold text-[#FFFFFF] block">{sub.name}</span>
                      <span className="text-[11px] font-mono text-[#666666]">
                        Limit: {formatCurrency(sub.budget)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-[#FFFFFF] block">
                      <AnimatedNumber value={subSpent} currency={currency} />
                    </span>
                    <span className="text-[10px] text-[#8A8A8A] font-mono">
                      {formatCurrency(subRemaining)} left
                    </span>
                  </div>
                </div>

                {/* Micro progress bar */}
                <div className="w-full h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(3, subPercent)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.08 + 0.1 }}
                    className="h-full bg-[#8A8A8A] rounded-full"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
