import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Delete,
  Check,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import CategoryIcon from '../components/CategoryIcon';

export default function AddExpenseScreen({ onClose }) {
  const { categories, addTransaction, currency, formatCurrency, calculations } = useFinance();

  const [selectedCategoryId, setSelectedCategoryId] = useState('needs');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('sub-groceries');
  const [amountStr, setAmountStr] = useState('2500');
  const [customTitle, setCustomTitle] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];
  const selectedSubcategory =
    selectedCategory?.subcategories.find((s) => s.id === selectedSubcategoryId) || selectedCategory?.subcategories[0];

  // Budget exceeded live warning calculation
  const enteredAmount = parseFloat(amountStr) || 0;
  const catStats = calculations?.categoryStats?.find((c) => c.id === selectedCategoryId);
  const subStats = catStats?.subcategories?.find((s) => s.id === (selectedSubcategory?.id || selectedSubcategoryId));
  const currentSubSpent = subStats?.spent || 0;
  const currentSubBudget = Number(selectedSubcategory?.budget) || 0;
  const willExceedBudget =
    selectedCategoryId !== 'savings' && currentSubBudget > 0 && currentSubSpent + enteredAmount > currentSubBudget;
  const projectedTotal = currentSubSpent + enteredAmount;
  const projectedOverAmount = projectedTotal - currentSubBudget;
  const projectedPercent = currentSubBudget > 0 ? Math.round((projectedTotal / currentSubBudget) * 100) : 0;

  const handleKeypadPress = (val) => {
    if (val === 'backspace') {
      setAmountStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }

    if (val === '.') {
      if (!amountStr.includes('.')) {
        setAmountStr((prev) => prev + '.');
      }
      return;
    }

    setAmountStr((prev) => {
      if (prev === '0') return val;
      if (prev.length >= 8) return prev;
      return prev + val;
    });
  };

  const handleSubmit = () => {
    const num = parseFloat(amountStr);
    if (!num || num <= 0) return;

    const title = customTitle.trim() || selectedSubcategory?.name || 'Expense';

    addTransaction({
      title,
      amount: num,
      type: 'expense',
      categoryId: selectedCategoryId,
      subcategoryId: selectedSubcategory?.id,
      subcategoryName: selectedSubcategory?.name,
      icon: selectedSubcategory?.icon || 'ShoppingBag',
    });

    setShowSuccess(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="flex flex-col min-h-screen bg-[#F4F4F6] text-[#090909] px-6 py-4 justify-between select-none relative"
    >
      {/* Success Notification Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#F4F4F6]/95 backdrop-blur-md flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-[#090909] flex items-center justify-center text-[#FFFFFF] shadow-2xl">
              <Check size={30} strokeWidth={3} />
            </div>
            <span className="text-base font-bold text-[#090909]">Expense Added</span>
            <span className="text-xs text-[#8A8A8A]">
              Deducted from {selectedCategory?.name} → {selectedSubcategory?.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between py-1">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#DFDFE6] hover:bg-[#D4D4DC] flex items-center justify-center text-[#090909] transition-all"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
          <span className="text-base font-bold text-[#090909]">Add Expense</span>
          <div className="w-10" />
        </div>

        {/* Large Amount Display */}
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <div className="flex items-center justify-center">
            <span className="text-3xl font-bold text-[#8A8A8A] mr-1">{currency}</span>
            <span className="text-5xl font-black text-[#090909] font-mono tracking-tight">
              {parseFloat(amountStr || '0').toLocaleString('en-IN')}
            </span>
          </div>

          {/* Real-time Exceeded Budget Warning Banner */}
          {willExceedBudget && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-[#090909] text-[#FFFFFF] border border-[#333333] px-3.5 py-2.5 rounded-2xl flex items-start space-x-2.5 shadow-lg max-w-sm"
            >
              <AlertTriangle size={16} className="text-[#FFFFFF] shrink-0 mt-0.5" />
              <div className="text-left">
                <div className="text-[11px] font-bold text-[#FFFFFF] tracking-wide">
                  Budget Exceeded Warning ({projectedPercent}%)
                </div>
                <div className="text-[10px] text-[#A0A0A0] leading-snug mt-0.5">
                  {selectedSubcategory?.name} limit is {currency}{currentSubBudget.toLocaleString('en-IN')}. This entry will exceed it by{' '}
                  <span className="text-[#FFFFFF] font-bold">+{currency}{projectedOverAmount.toLocaleString('en-IN')}</span> (Total: {currency}{projectedTotal.toLocaleString('en-IN')}).
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Category Segmented Control: Needs | Wants | Savings */}
        <div className="flex items-center bg-[#E8E8EE] border border-[#DCDBE2] p-1 rounded-full gap-1">
          {['needs', 'wants', 'savings'].map((catKey) => {
            const isSel = selectedCategoryId === catKey;
            const catObj = categories.find((c) => c.id === catKey);
            return (
              <button
                key={catKey}
                onClick={() => {
                  setSelectedCategoryId(catKey);
                  if (catObj?.subcategories?.length > 0) {
                    setSelectedSubcategoryId(catObj.subcategories[0].id);
                  }
                }}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-[#090909] text-[#FFFFFF] shadow-sm'
                    : 'text-[#666666] hover:text-[#090909]'
                }`}
              >
                {catKey === 'needs' ? 'Needs' : catKey === 'wants' ? 'Wants' : 'Savings'}
              </button>
            );
          })}
        </div>

        {/* Dynamic Subcategories Pills */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-bold text-[#8A8A8A] tracking-wider uppercase block">
            Select Subcategory
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            {selectedCategory?.subcategories?.map((sub) => {
              const isSel = selectedSubcategoryId === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategoryId(sub.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                    isSel
                      ? 'bg-[#090909] text-[#FFFFFF] border-[#090909]'
                      : 'bg-[#E8E8EE] text-[#090909] border-[#DCDBE2] hover:border-[#C8C7D0]'
                  }`}
                >
                  <CategoryIcon
                    iconName={sub.icon}
                    size={13}
                    variant={isSel ? 'dark' : 'light'}
                  />
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Description */}
        <input
          type="text"
          placeholder="Expense description (optional)"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="w-full bg-[#E8E8EE] border border-[#DCDBE2] rounded-2xl px-4 py-3 text-xs text-[#090909] placeholder-[#8A8A8A] focus:outline-none focus:border-[#090909]"
        />
      </div>

      {/* 3-Column Soft Keypad & Save Action */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((k) => (
            <button
              key={k}
              onClick={() => handleKeypadPress(k)}
              className="h-14 rounded-2xl bg-[#E8E8EE] hover:bg-[#DFDFE6] border border-[#DCDBE2] text-2xl font-bold text-[#090909] transition-all active:scale-95 flex items-center justify-center"
            >
              {k}
            </button>
          ))}
          <button
            onClick={() => handleKeypadPress('backspace')}
            className="h-14 rounded-2xl bg-[#E8E8EE] hover:bg-[#DFDFE6] border border-[#DCDBE2] text-[#090909] transition-all active:scale-95 flex items-center justify-center"
          >
            <Delete size={22} />
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full h-13 bg-[#090909] hover:bg-[#1C1C1C] text-[#FFFFFF] font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl active:scale-95"
        >
          <Check size={16} strokeWidth={3} />
          <span>Save Expense</span>
        </button>
      </div>
    </motion.div>
  );
}
