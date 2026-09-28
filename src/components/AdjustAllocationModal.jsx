import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, SlidersHorizontal, Minus, Plus } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export default function AdjustAllocationModal({ isOpen, onClose }) {
  const {
    totalIncome,
    categories,
    formatCurrency,
    selectedMonth,
    updateCategoryPercentages,
  } = useFinance();

  const [percentages, setPercentages] = useState({
    needs: 50,
    wants: 30,
    savings: 20,
  });

  useEffect(() => {
    if (isOpen && categories) {
      const needsCat = categories.find((c) => c.id === 'needs');
      const wantsCat = categories.find((c) => c.id === 'wants');
      const savingsCat = categories.find((c) => c.id === 'savings');

      const totalInc = totalIncome || 50000;
      const nPct = needsCat?.targetPercent ?? Math.round(((needsCat?.budget || 0) / totalInc) * 100);
      const wPct = wantsCat?.targetPercent ?? Math.round(((wantsCat?.budget || 0) / totalInc) * 100);
      const sPct = savingsCat?.targetPercent ?? Math.max(0, 100 - (nPct || 50) - (wPct || 30));

      setPercentages({
        needs: nPct || 50,
        wants: wPct || 30,
        savings: sPct || 20,
      });
    }
  }, [isOpen, categories, totalIncome]);

  if (!isOpen) return null;

  const totalAllocatedPct = percentages.needs + percentages.wants + percentages.savings;
  const isBalanced = totalAllocatedPct === 100;

  const needsAmount = Math.round((totalIncome * percentages.needs) / 100);
  const wantsAmount = Math.round((totalIncome * percentages.wants) / 100);
  const savingsAmount = Math.round((totalIncome * percentages.savings) / 100);

  const presets = [
    { label: '50/30/20 (Balanced)', n: 50, w: 30, s: 20 },
    { label: '60/20/20 (Essentials)', n: 60, w: 20, s: 20 },
    { label: '70/20/10 (Frugal)', n: 70, w: 20, s: 10 },
    { label: '40/30/30 (Saver)', n: 40, w: 30, s: 30 },
  ];

  const handleStep = (catKey, delta) => {
    setPercentages((prev) => {
      const newVal = Math.max(0, Math.min(100, prev[catKey] + delta));
      return { ...prev, [catKey]: newVal };
    });
  };

  const handleApply = () => {
    if (!isBalanced) return;
    updateCategoryPercentages(percentages);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="w-full max-w-lg bg-[#141414] border border-[#242424] rounded-t-3xl sm:rounded-3xl p-6 text-[#FFFFFF] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#222222] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#FFFFFF] flex items-center gap-2">
                <SlidersHorizontal size={16} />
                <span>Adjust Target Allocation Ratio</span>
              </h2>
              <p className="text-xs text-[#8A8A8A] mt-0.5">
                Income: {formatCurrency(totalIncome)} · {selectedMonth}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1F1F1F] hover:bg-[#2A2A2A] flex items-center justify-center text-[#8A8A8A] hover:text-[#FFFFFF] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#666666] tracking-wider uppercase">
              Quick Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => {
                const isActive =
                  percentages.needs === preset.n &&
                  percentages.wants === preset.w &&
                  percentages.savings === preset.s;
                return (
                  <button
                    key={preset.label}
                    onClick={() =>
                      setPercentages({
                        needs: preset.n,
                        wants: preset.w,
                        savings: preset.s,
                      })
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                      isActive
                        ? 'bg-[#FFFFFF] text-[#0A0A0A] border-[#FFFFFF]'
                        : 'bg-[#1A1A1A] text-[#8A8A8A] border-[#262626] hover:text-[#FFFFFF] hover:border-[#333333]'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {isActive && <Check size={13} strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Cards */}
          <div className="space-y-3">
            {/* Needs */}
            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF]" />
                  <div>
                    <span className="text-xs font-bold text-[#FFFFFF] block">NEEDS (Essentials)</span>
                    <span className="text-[10px] text-[#666666]">Rent, Groceries, Utilities, Transport</span>
                  </div>
                </div>
                <span className="text-sm font-bold font-mono text-[#FFFFFF]">
                  {formatCurrency(needsAmount)}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleStep('needs', -5)}
                  className="w-9 h-9 rounded-xl bg-[#222222] hover:bg-[#2D2D2D] flex items-center justify-center text-[#FFFFFF] transition-all"
                >
                  <Minus size={14} />
                </button>
                <div className="flex-1 bg-[#0D0D0D] border border-[#222222] rounded-xl py-1.5 text-center">
                  <span className="text-base font-bold font-mono text-[#FFFFFF]">
                    {percentages.needs}%
                  </span>
                </div>
                <button
                  onClick={() => handleStep('needs', 5)}
                  className="w-9 h-9 rounded-xl bg-[#222222] hover:bg-[#2D2D2D] flex items-center justify-center text-[#FFFFFF] transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Wants */}
            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8A8A8A]" />
                  <div>
                    <span className="text-xs font-bold text-[#FFFFFF] block">WANTS (Lifestyle)</span>
                    <span className="text-[10px] text-[#666666]">Dining Out, Shopping, Leisure</span>
                  </div>
                </div>
                <span className="text-sm font-bold font-mono text-[#FFFFFF]">
                  {formatCurrency(wantsAmount)}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleStep('wants', -5)}
                  className="w-9 h-9 rounded-xl bg-[#222222] hover:bg-[#2D2D2D] flex items-center justify-center text-[#FFFFFF] transition-all"
                >
                  <Minus size={14} />
                </button>
                <div className="flex-1 bg-[#0D0D0D] border border-[#222222] rounded-xl py-1.5 text-center">
                  <span className="text-base font-bold font-mono text-[#FFFFFF]">
                    {percentages.wants}%
                  </span>
                </div>
                <button
                  onClick={() => handleStep('wants', 5)}
                  className="w-9 h-9 rounded-xl bg-[#222222] hover:bg-[#2D2D2D] flex items-center justify-center text-[#FFFFFF] transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Savings */}
            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D6D6D6]" />
                  <div>
                    <span className="text-xs font-bold text-[#FFFFFF] block">SAVINGS & DEBT</span>
                    <span className="text-[10px] text-[#666666]">Emergency Fund, Investments</span>
                  </div>
                </div>
                <span className="text-sm font-bold font-mono text-[#FFFFFF]">
                  {formatCurrency(savingsAmount)}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleStep('savings', -5)}
                  className="w-9 h-9 rounded-xl bg-[#222222] hover:bg-[#2D2D2D] flex items-center justify-center text-[#FFFFFF] transition-all"
                >
                  <Minus size={14} />
                </button>
                <div className="flex-1 bg-[#0D0D0D] border border-[#222222] rounded-xl py-1.5 text-center">
                  <span className="text-base font-bold font-mono text-[#FFFFFF]">
                    {percentages.savings}%
                  </span>
                </div>
                <button
                  onClick={() => handleStep('savings', 5)}
                  className="w-9 h-9 rounded-xl bg-[#222222] hover:bg-[#2D2D2D] flex items-center justify-center text-[#FFFFFF] transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Live Validation Bar */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
              isBalanced
                ? 'bg-[#1C1C1C] border-[#333333] text-[#FFFFFF]'
                : 'bg-[#181818] border-[#2B2B2B] text-[#8A8A8A]'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isBalanced ? (
                <Check size={14} className="text-[#FFFFFF]" strokeWidth={3} />
              ) : (
                <AlertCircle size={14} className="text-[#8A8A8A]" />
              )}
              <span className="font-semibold">
                {isBalanced
                  ? '100% Total · Fully Allocated'
                  : totalAllocatedPct < 100
                  ? `Total is ${totalAllocatedPct}% (${100 - totalAllocatedPct}% unallocated)`
                  : `Total is ${totalAllocatedPct}% (${totalAllocatedPct - 100}% over allocated)`}
              </span>
            </div>
            <span className="font-mono font-bold text-[#FFFFFF]">
              {formatCurrency(needsAmount + wantsAmount + savingsAmount)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-[#1C1C1C] hover:bg-[#242424] text-[#8A8A8A] hover:text-[#FFFFFF] rounded-2xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!isBalanced}
              className="flex-1 py-3.5 bg-[#FFFFFF] hover:bg-[#E5E5E5] disabled:bg-[#2E2E2E] disabled:text-[#666666] text-[#0A0A0A] rounded-2xl text-xs font-bold transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <Check size={14} strokeWidth={3} />
              <span>Apply New Allocations</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
