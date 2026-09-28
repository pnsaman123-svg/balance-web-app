import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import CategoryIcon from '../components/CategoryIcon';

const AVAILABLE_ICONS = [
  'House', 'ShoppingBasket', 'Zap', 'Car', 'Activity',
  'UtensilsCrossed', 'ShoppingBag', 'Repeat', 'Gamepad2',
  'ShieldCheck', 'TrendingUp', 'ArrowDownRight', 'Wallet',
  'Coffee', 'Sparkles', 'Heart', 'Plane', 'Smartphone', 'Gift'
];

export default function SubcategoryModal({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  editingSubcategory = null,
}) {
  const { addSubcategory, updateSubcategory, deleteSubcategory, currency } = useFinance();

  const [name, setName] = useState('');
  const [budgetStr, setBudgetStr] = useState('');
  const [icon, setIcon] = useState('ShoppingBag');

  useEffect(() => {
    if (editingSubcategory) {
      setName(editingSubcategory.name || '');
      setBudgetStr(editingSubcategory.budget ? String(editingSubcategory.budget) : '');
      setIcon(editingSubcategory.icon || 'ShoppingBag');
    } else {
      setName('');
      setBudgetStr('');
      setIcon('ShoppingBag');
    }
  }, [editingSubcategory, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim() || !budgetStr) return;

    const budget = parseFloat(budgetStr) || 0;

    if (editingSubcategory) {
      updateSubcategory(categoryId, editingSubcategory.id, name.trim(), budget);
    } else {
      addSubcategory(categoryId, name.trim(), budget, icon);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingSubcategory && categoryId) {
      deleteSubcategory(categoryId, editingSubcategory.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#000000]/80 backdrop-blur-sm transition-all animate-in fade-in">
      <div className="w-full max-w-md bg-[#111111] border border-[#242424] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 text-[#FFFFFF]">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">
              {categoryName}
            </span>
            <h2 className="text-lg font-bold text-[#FFFFFF]">
              {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-[#8A8A8A] hover:text-[#FFFFFF] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8A8A8A] tracking-wide">
              Subcategory Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Medical, Pet Care, Books..."
              className="w-full bg-[#161616] border border-[#242424] rounded-2xl px-4 py-3 text-sm text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#8A8A8A] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8A8A8A] tracking-wide">
              Monthly Budget Limit
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-sm font-mono font-bold text-[#8A8A8A]">
                {currency}
              </span>
              <input
                type="number"
                required
                min="0"
                step="100"
                value={budgetStr}
                onChange={(e) => setBudgetStr(e.target.value)}
                placeholder="2,000"
                className="w-full bg-[#161616] border border-[#242424] rounded-2xl pl-10 pr-4 py-3 text-sm font-mono font-bold text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#8A8A8A] transition-all"
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#8A8A8A] tracking-wide">
              Choose Icon
            </label>
            <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-xl transition-all ${
                    icon === ic
                      ? 'bg-[#FFFFFF] text-[#0A0A0A] shadow-md scale-105'
                      : 'bg-[#161616] text-[#8A8A8A] hover:bg-[#1C1C1C] hover:text-[#FFFFFF]'
                  }`}
                >
                  <CategoryIcon iconName={ic} size={16} variant={icon === ic ? 'white' : 'dark'} />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-2">
            {editingSubcategory && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-12 h-12 rounded-2xl bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-[#8A8A8A] hover:text-[#FFFFFF] hover:bg-[#292929] transition-all"
                title="Delete Subcategory"
              >
                <Trash2 size={18} />
              </button>
            )}

            <button
              type="submit"
              className="flex-1 h-12 bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#0A0A0A] font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95"
            >
              <Check size={17} strokeWidth={2.5} />
              <span>{editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
