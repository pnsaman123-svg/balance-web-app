import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import CategoryIcon from '../components/CategoryIcon';

export default function AddExpenseScreen({ onClose, initialAmount }) {
  const { categories, addTransaction, currency, calculations } = useFinance();

  const [selectedCategoryId, setSelectedCategoryId] = useState('needs');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('sub-groceries');
  const [amountStr] = useState(initialAmount && initialAmount !== '0' ? String(initialAmount) : '0');
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
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Dark Dim Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Slide-in Card (Black / Grey near to black) */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative z-10 w-full max-w-md bg-[#141414] border border-[#242424] rounded-t-3xl sm:rounded-3xl p-6 text-[#FFFFFF] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Top Drag Handle */}
        <div className="w-10 h-1 bg-[#333333] rounded-full mx-auto" />

        {/* Success Notification Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-[#141414]/95 backdrop-blur-md flex flex-col items-center justify-center space-y-3 rounded-t-3xl sm:rounded-3xl"
            >
              <div className="w-16 h-16 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#090909] shadow-2xl">
                <Check size={30} strokeWidth={3} />
              </div>
              <span className="text-base font-bold text-[#FFFFFF]">Expense Saved</span>
              <span className="text-xs text-[#8A8A8A]">
                Added to {selectedCategory?.name} → {selectedSubcategory?.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#FFFFFF]">Categorize Expense</h2>
            <p className="text-xs text-[#8A8A8A]">Select pillar & subcategory</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#2A2A2A] flex items-center justify-center text-[#8A8A8A] hover:text-[#FFFFFF] transition-all cursor-pointer"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Amount Display */}
        <div className="flex items-baseline justify-center py-2 text-center">
          <span className="text-2xl font-bold text-[#8A8A8A] mr-1.5">{currency}</span>
          <span className="text-5xl font-black text-[#FFFFFF] font-mono tracking-tight">
            {parseFloat(amountStr || '0').toLocaleString('en-IN')}
          </span>
        </div>

        {/* Real-time Exceeded Budget Warning Banner if any */}
        {willExceedBudget && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#201212] border border-[#441A1A] p-3 rounded-2xl flex items-start space-x-2.5 shadow-lg"
          >
            <AlertTriangle size={16} className="text-[#FF6B6B] shrink-0 mt-0.5" />
            <div className="text-left text-xs">
              <div className="font-bold text-[#FF7575]">
                Budget Exceeded Warning ({projectedPercent}%)
              </div>
              <div className="text-[#D0A0A0] text-[11px] leading-snug mt-0.5">
                {selectedSubcategory?.name} limit is {currency}{currentSubBudget.toLocaleString('en-IN')}. This entry will exceed it by{' '}
                <strong className="text-[#FFFFFF]">+{currency}{projectedOverAmount.toLocaleString('en-IN')}</strong> (Total: {currency}{projectedTotal.toLocaleString('en-IN')}).
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Segmented Control: Needs | Wants | Savings */}
        <div className="flex items-center bg-[#1C1C1C] border border-[#262626] p-1 rounded-2xl gap-1">
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
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#FFFFFF] text-[#090909] shadow-sm'
                    : 'text-[#8A8A8A] hover:text-[#FFFFFF]'
                }`}
              >
                {catKey === 'needs' ? 'Needs' : catKey === 'wants' ? 'Wants' : 'Savings'}
              </button>
            );
          })}
        </div>

        {/* Dynamic Subcategories Pills */}
        <div className="space-y-2">
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
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
                    isSel
                      ? 'bg-[#FFFFFF] text-[#090909] border-[#FFFFFF]'
                      : 'bg-[#1C1C1C] text-[#FFFFFF] border-[#282828] hover:border-[#383838]'
                  }`}
                >
                  <CategoryIcon
                    iconName={sub.icon}
                    size={13}
                    variant={isSel ? 'light' : 'dark'}
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
          className="w-full bg-[#1C1C1C] border border-[#282828] rounded-2xl px-4 py-3 text-xs text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#444444]"
        />

        {/* Save Action Button */}
        <button
          onClick={handleSubmit}
          className="w-full h-13 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl active:scale-95 cursor-pointer mt-2"
        >
          <Check size={18} strokeWidth={3} />
          <span>Save Expense</span>
        </button>
      </motion.div>
    </div>
  );
}
