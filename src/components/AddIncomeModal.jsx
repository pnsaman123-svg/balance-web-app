import React, { useState } from 'react';
import { X, Check, ArrowDownLeft } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export default function AddIncomeModal({ isOpen, onClose }) {
  const { addTransaction, currency, formatCurrency } = useFinance();

  const [title, setTitle] = useState('Monthly Salary');
  const [amountStr, setAmountStr] = useState('50000');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return;

    addTransaction({
      title: title.trim() || 'Income',
      amount,
      type: 'income',
      categoryId: 'income',
      subcategoryId: 'sub-income',
      subcategoryName: 'Income',
      icon: 'TrendingUp',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#000000]/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#111111] border border-[#242424] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 text-[#FFFFFF]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-[#FFFFFF]">
              <ArrowDownLeft size={16} />
            </div>
            <h2 className="text-base font-bold text-[#FFFFFF]">Add Income</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-[#8A8A8A] hover:text-[#FFFFFF]"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8A8A8A]">Source / Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Salary, Freelance, Dividend"
              className="w-full bg-[#161616] border border-[#242424] rounded-2xl px-4 py-3 text-sm text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#8A8A8A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8A8A8A]">Amount</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-sm font-mono font-bold text-[#8A8A8A]">
                {currency}
              </span>
              <input
                type="number"
                required
                min="1"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="50,000"
                className="w-full bg-[#161616] border border-[#242424] rounded-2xl pl-10 pr-4 py-3 text-sm font-mono font-bold text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#8A8A8A]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#0A0A0A] font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95 mt-2"
          >
            <Check size={17} strokeWidth={2.5} />
            <span>Record Income · {formatCurrency(parseFloat(amountStr || '0'))}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
