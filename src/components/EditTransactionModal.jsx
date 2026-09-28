import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import CategoryIcon from './CategoryIcon';

export default function EditTransactionModal({ isOpen, onClose, transaction }) {
  const { categories, updateTransaction, deleteTransaction, currency, formatCurrency } = useFinance();

  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('needs');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title || '');
      setAmountStr(String(transaction.amount || 0));
      setCategoryId(transaction.categoryId || 'needs');
      setSubcategoryId(transaction.subcategoryId || '');
      setDate(transaction.date || 'Today');
      setNotes(transaction.notes || '');
      setIsConfirmingDelete(false);
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

  const selectedCategory = categories.find((c) => c.id === categoryId) || categories[0];
  const selectedSubcategory =
    selectedCategory?.subcategories.find((s) => s.id === subcategoryId) || selectedCategory?.subcategories[0];

  const handleSave = (e) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return;

    updateTransaction(transaction.id, {
      title: title.trim() || selectedSubcategory?.name || 'Expense',
      amount,
      categoryId,
      subcategoryId: selectedSubcategory?.id,
      subcategoryName: selectedSubcategory?.name,
      icon: selectedSubcategory?.icon || 'ShoppingBag',
      date,
      notes: notes.trim(),
    });

    onClose();
  };

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#000000]/80 backdrop-blur-sm animate-in fade-in">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30 }}
        className="w-full max-w-md bg-[#111111] border border-[#242424] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 text-[#FFFFFF]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider">
              Manage Entry
            </span>
            <h2 className="text-lg font-bold text-[#FFFFFF]">Edit Transaction</h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-[#8A8A8A] hover:text-[#FFFFFF]"
          >
            <X size={16} />
          </button>
        </div>

        {isConfirmingDelete ? (
          /* Delete Confirmation Dialog */
          <div className="p-5 bg-[#1F1212] border border-[#3D2020] rounded-2xl space-y-4 text-center">
            <AlertTriangle size={28} className="mx-auto text-[#FFFFFF]" />
            <div>
              <span className="text-sm font-bold text-[#FFFFFF] block">Delete this transaction?</span>
              <p className="text-xs text-[#A0A0A0] mt-1">
                This will remove the entry and automatically restore {formatCurrency(transaction.amount)} to your budget.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 py-3 bg-[#1C1C1C] hover:bg-[#282828] text-[#FFFFFF] text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#0A0A0A] text-xs font-bold rounded-xl"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSave} className="space-y-4">
            {/* Description / Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8A8A8A]">Description</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Groceries"
                className="w-full bg-[#161616] border border-[#242424] rounded-2xl px-4 py-3 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#8A8A8A]"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8A8A8A]">Amount</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-mono font-bold text-[#8A8A8A]">{currency}</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full bg-[#161616] border border-[#242424] rounded-2xl pl-10 pr-4 py-3 text-sm font-mono font-bold text-[#FFFFFF] focus:outline-none focus:border-[#8A8A8A]"
                />
              </div>
            </div>

            {/* Main Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8A8A8A]">Main Category</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => {
                      setCategoryId(c.id);
                      if (c.subcategories.length > 0) setSubcategoryId(c.subcategories[0].id);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      categoryId === c.id
                        ? 'bg-[#FFFFFF] text-[#0A0A0A] shadow-md'
                        : 'bg-[#161616] text-[#8A8A8A] border border-[#242424]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Subcategories Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8A8A8A]">Subcategory</label>
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                {selectedCategory?.subcategories.map((sub) => (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() => setSubcategoryId(sub.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center space-x-1.5 ${
                      subcategoryId === sub.id
                        ? 'bg-[#292929] text-[#FFFFFF] border border-[#666666]'
                        : 'bg-[#141414] text-[#8A8A8A] border border-[#202020]'
                    }`}
                  >
                    <CategoryIcon iconName={sub.icon} size={11} variant={subcategoryId === sub.id ? 'light' : 'dark'} />
                    <span>{sub.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8A8A8A]">Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add receipt details or notes"
                className="w-full bg-[#161616] border border-[#242424] rounded-2xl px-4 py-2.5 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#8A8A8A]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="w-12 h-12 rounded-2xl bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-[#8A8A8A] hover:text-[#FFFFFF]"
                title="Delete Entry"
              >
                <Trash2 size={16} />
              </button>

              <button
                type="submit"
                className="flex-1 h-12 bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#0A0A0A] font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95"
              >
                <Check size={16} strokeWidth={2.5} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
