import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, SlidersHorizontal, Trash2, Plus, Calendar, Edit2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import CategoryIcon from '../components/CategoryIcon';
import AnimatedNumber from '../components/AnimatedNumber';

export default function TransactionsScreen({ onBack, onOpenAddExpense, onEditTransaction }) {
  const { transactions, currency, formatCurrency, deleteTransaction, selectedMonth } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all') {
        if (filterType === 'income' && t.type !== 'income') return false;
        if (filterType !== 'income' && t.categoryId !== filterType) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = t.title?.toLowerCase().includes(query);
        const matchSub = t.subcategoryName?.toLowerCase().includes(query);
        const matchNotes = t.notes?.toLowerCase().includes(query);
        if (!matchTitle && !matchSub && !matchNotes) return false;
      }

      return true;
    });
  }, [transactions, filterType, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-[#090909] text-[#FFFFFF]">
      {/* Dark Upper Dashboard Section */}
      <div className="px-5 pt-3 pb-8 space-y-4 bg-[#090909]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-[#FFFFFF] hover:bg-[#252525] transition-all"
          >
            <ArrowLeft size={18} />
          </button>

          <span className="text-base font-bold text-[#FFFFFF]">Transactions</span>

          <button
            onClick={onOpenAddExpense}
            className="w-10 h-10 rounded-full bg-[#FFFFFF] text-[#090909] flex items-center justify-center font-bold shadow-md"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Charcoal Search Bar */}
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-4 text-[#8A8A8A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries or notes..."
            className="w-full bg-[#141414] border border-[#242424] rounded-2xl pl-11 pr-4 py-3 text-xs text-[#FFFFFF] placeholder-[#8A8A8A] focus:outline-none focus:border-[#FFFFFF] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-xs text-[#8A8A8A] hover:text-[#FFFFFF]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'needs', label: 'Needs' },
            { id: 'wants', label: 'Wants' },
            { id: 'savings', label: 'Savings' },
          ].map((tab) => {
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#FFFFFF] text-[#090909] shadow-md font-bold'
                    : 'bg-[#141414] text-[#8A8A8A] border border-[#242424] hover:text-[#FFFFFF]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating White Rounded Overlapping Content Sheet */}
      <div className="bg-[#FFFFFF] text-[#090909] rounded-t-[32px] px-6 pt-3 pb-32 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] space-y-4">
        <div className="w-9 h-1 rounded-full bg-[#D6D6D6] mx-auto mb-2" />

        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#090909]">
            Ledger Entries ({filteredTransactions.length})
          </h2>
          <span className="text-xs text-[#8A8A8A]">{selectedMonth}</span>
        </div>

        <div className="divide-y divide-[#F2F2F2]">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8A8A8A]">
              No transactions match your search.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => onEditTransaction && onEditTransaction(tx)}
                className="flex items-center justify-between py-3.5 hover:bg-[#F8F8F8] px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#F2F2F2] flex items-center justify-center shrink-0">
                    <CategoryIcon iconName={tx.icon} size={14} variant="light" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#090909] truncate">{tx.title}</span>
                    <span className="text-[10.5px] text-[#8A8A8A] truncate mt-0.5">
                      {tx.categoryId === 'needs' ? 'Needs' : tx.categoryId === 'wants' ? 'Wants' : 'Savings'} → {tx.subcategoryName || 'General'} · {tx.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 pl-3">
                  <span className="text-sm font-bold font-mono text-[#090909]">
                    − {formatCurrency(tx.amount)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTransaction(tx.id);
                    }}
                    className="p-1.5 text-[#8A8A8A] hover:text-[#090909] transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
