import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import CategoryIcon from '../components/CategoryIcon';
import SubcategoryModal from '../components/SubcategoryModal';
import AdjustAllocationModal from '../components/AdjustAllocationModal';

export default function BudgetScreen({ onBack, onOpenAddExpense }) {
  const {
    selectedMonth,
    currency,
    formatCurrency,
    totalIncome,
    totalAllocated,
    totalSpent,
    totalBalance,
    categories,
    categoryStats,
    deleteSubcategory,
  } = useFinance();

  const [modalState, setModalState] = useState({
    isOpen: false,
    categoryId: '',
    categoryName: '',
    editingSubcategory: null,
  });

  const [expandedPillars, setExpandedPillars] = useState({
    needs: false,
    wants: false,
    savings: false,
  });

  const [isAdjustAllocationOpen, setIsAdjustAllocationOpen] = useState(false);

  const displayCategories = categoryStats || categories;

  // Compute days left in current month
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate());

  const effectiveBudget = totalAllocated > 0 ? totalAllocated : totalIncome;
  const overallSpentPercent = effectiveBudget > 0 ? Math.round((totalSpent / effectiveBudget) * 100) : 0;
  const clampedGaugePercent = Math.min(100, Math.max(0, overallSpentPercent));
  const isTotalOver = totalSpent > effectiveBudget;
  const totalOverAmount = isTotalOver ? totalSpent - effectiveBudget : 0;
  const totalRemaining = Math.max(0, effectiveBudget - totalSpent);

  // SVG semi-circular gauge calculations (R=95, center=(140, 130))
  const arcLength = 298.45;
  const strokeOffset = arcLength * (1 - clampedGaugePercent / 100);
  const angleRad = Math.PI * (1 - clampedGaugePercent / 100);
  const pipX = 140 + 95 * Math.cos(angleRad);
  const pipY = 130 - 95 * Math.sin(angleRad);

  const togglePillar = (catId) => {
    setExpandedPillars((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const getPillarColors = (catId) => {
    switch (catId) {
      case 'needs':
        return { bg: 'bg-[#2B1D22]', text: 'text-[#FFA3B8]' };
      case 'wants':
        return { bg: 'bg-[#241E34]', text: 'text-[#C4B5FD]' };
      case 'savings':
        return { bg: 'bg-[#182B22]', text: 'text-[#86EFAC]' };
      default:
        return { bg: 'bg-[#242424]', text: 'text-[#FFFFFF]' };
    }
  };

  const getSubcategoryColors = (iconName) => {
    switch (iconName) {
      case 'House':
      case 'Activity':
        return { bg: 'bg-[#2B1D22]', text: 'text-[#FFA3B8]' };
      case 'ShoppingBasket':
      case 'UtensilsCrossed':
        return { bg: 'bg-[#2E2218]', text: 'text-[#FDBA74]' };
      case 'Zap':
        return { bg: 'bg-[#2A2616]', text: 'text-[#FDE047]' };
      case 'Car':
      case 'Repeat':
        return { bg: 'bg-[#1C2432]', text: 'text-[#93C5FD]' };
      case 'ShoppingBag':
      case 'Gamepad2':
        return { bg: 'bg-[#261C32]', text: 'text-[#E9D5FF]' };
      case 'ShieldCheck':
      case 'TrendingUp':
      case 'ArrowDownRight':
        return { bg: 'bg-[#182B22]', text: 'text-[#86EFAC]' };
      default:
        return { bg: 'bg-[#242424]', text: 'text-[#FFFFFF]' };
    }
  };

  const handleOpenAdd = (categoryId, categoryName) => {
    setModalState({
      isOpen: true,
      categoryId,
      categoryName,
      editingSubcategory: null,
    });
  };

  const handleOpenEdit = (categoryId, categoryName, sub) => {
    setModalState({
      isOpen: true,
      categoryId,
      categoryName,
      editingSubcategory: sub,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090909] text-[#FFFFFF] pb-28">
      {/* Top Header Row: Budgets + new button */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h1 className="text-3xl font-extrabold text-[#FFFFFF] tracking-tight">Budgets</h1>
        <button
          onClick={onOpenAddExpense}
          className="flex items-center space-x-1.5 bg-[#1C1C1C] hover:bg-[#282828] border border-[#2E2E2E] px-4 py-1.5 rounded-full text-xs font-bold text-[#FFFFFF] transition-all active:scale-95 shadow-md"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>new</span>
        </button>
      </div>

      {/* Speedometer Arc Gauge Section */}
      <div className="flex flex-col items-center py-3 px-4">
        <span className="text-[11px] font-bold text-[#7E7E7E] tracking-widest uppercase">
          OVERALL SPENT: {overallSpentPercent}%
        </span>

        <div className="relative flex items-center justify-center h-[145px] w-[280px] mt-1">
          <svg width="280" height="145" viewBox="0 0 280 145" className="overflow-visible">
            {/* Background Track */}
            <path
              d="M 45,130 A 95,95 0 0,1 235,130"
              stroke="#252525"
              strokeWidth="22"
              strokeLinecap="round"
              fill="none"
            />
            {/* Active White Fill */}
            <path
              d="M 45,130 A 95,95 0 0,1 235,130"
              stroke="#FFFFFF"
              strokeWidth="22"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={arcLength}
              strokeDashoffset={strokeOffset}
              className="transition-all duration-700 ease-out"
            />
            {/* Pip Dot */}
            {clampedGaugePercent > 3 && clampedGaugePercent < 97 && (
              <circle
                cx={pipX}
                cy={pipY}
                r="5"
                fill="#090909"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
            )}
          </svg>

          {/* Center Metric Overlay inside Arch */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
            <span className="text-3xl font-black text-[#FFFFFF] tracking-tight">
              {isTotalOver ? `+${formatCurrency(totalOverAmount)}` : formatCurrency(totalRemaining)}
            </span>
            <span className={`text-xs font-medium mt-0.5 ${isTotalOver ? 'text-[#FF7070]' : 'text-[#8A8A8A]'}`}>
              {isTotalOver ? 'over this month' : 'left this month'}
            </span>
          </div>
        </div>

        {/* Gauge Bottom Labels (Spent on Left, Total Budget on Right) */}
        <div className="flex justify-between w-[220px] -mt-1 text-xs font-semibold text-[#666666]">
          <span>{formatCurrency(totalSpent)}</span>
          <span>{formatCurrency(effectiveBudget)}</span>
        </div>
      </div>

      {/* Category Pillars (Needs, Wants, Savings) List */}
      <div className="px-4 space-y-3 mt-3">
        {displayCategories.map((cat) => {
          const isExpanded = !!expandedPillars[cat.id];
          const pillarColors = getPillarColors(cat.id);
          const isOver = cat.isCatOverBudget;
          const remaining = cat.remaining || 0;
          const overAmount = cat.catOverAmount || 0;

          return (
            <motion.div
              key={cat.id}
              layout
              className={`rounded-3xl border bg-[#121212] p-4 transition-all shadow-lg ${
                isOver ? 'border-[#3D2020] bg-[#141010]' : 'border-[#1F1F1F]'
              }`}
            >
              {/* Clickable Pillar Header Card */}
              <div
                onClick={() => togglePillar(cat.id)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Soft Tinted Icon Box */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${pillarColors.bg}`}
                  >
                    <CategoryIcon
                      iconName={cat.id === 'needs' ? 'House' : cat.id === 'wants' ? 'ShoppingBag' : 'ShieldCheck'}
                      size={20}
                      variant="dark"
                    />
                  </div>

                  {/* Title & Subtitle */}
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-[#FFFFFF]">{cat.name}</h2>
                    <p className="text-xs text-[#888888] mt-0.5">
                      {daysLeft}d left • {cat.percentSpent || 0}% spent
                    </p>
                  </div>
                </div>

                {/* Right Amount & Status */}
                <div className="flex flex-col items-end pl-3 shrink-0">
                  <span
                    className={`text-lg font-extrabold font-mono ${
                      isOver ? 'text-[#FF7070]' : 'text-[#FFFFFF]'
                    }`}
                  >
                    {isOver ? `+${formatCurrency(overAmount)}` : formatCurrency(remaining)}
                  </span>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className={`text-[11px] font-medium ${isOver ? 'text-[#FF7070]' : 'text-[#777777]'}`}>
                      {isOver ? 'over this month' : 'under this month'}
                    </span>
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-[#8A8A8A]" />
                    ) : (
                      <ChevronRight size={14} className="text-[#8A8A8A]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Subcategories Accordion */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden mt-3 pt-3 border-t border-[#1F1F1F] space-y-2.5"
                  >
                    {cat.subcategories.map((sub) => {
                      const isSubOver = sub.isOverBudget;
                      const subColors = getSubcategoryColors(sub.icon);
                      const subRemaining = sub.remaining || 0;
                      const subOverAmount = sub.overAmount || 0;

                      return (
                        <div
                          key={sub.id}
                          className={`rounded-2xl border bg-[#181818] p-3 transition-all space-y-2 ${
                            isSubOver ? 'border-[#3E2020] bg-[#1A1212]' : 'border-[#262626]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${subColors.bg}`}
                              >
                                <CategoryIcon iconName={sub.icon} size={17} variant="dark" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-bold text-[#FFFFFF] truncate">{sub.name}</h3>
                                <p className="text-[11px] text-[#888888] mt-0.5">
                                  {daysLeft}d left • {sub.actualPercentSpent || sub.percentSpent || 0}% spent
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end pl-3 shrink-0">
                              <span
                                className={`text-base font-extrabold font-mono ${
                                  isSubOver ? 'text-[#FF7070]' : 'text-[#FFFFFF]'
                                }`}
                              >
                                {isSubOver ? `+${formatCurrency(subOverAmount)}` : formatCurrency(subRemaining)}
                              </span>
                              <span
                                className={`text-[10.5px] font-medium ${
                                  isSubOver ? 'text-[#FF7070]' : 'text-[#777777]'
                                }`}
                              >
                                {isSubOver ? 'over this month' : 'under this month'}
                              </span>
                            </div>
                          </div>

                          {/* Subcategory Action Row */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#222222]">
                            <button
                              onClick={() => handleOpenEdit(cat.id, cat.name, sub)}
                              className="flex items-center space-x-1.5 text-xs text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors"
                            >
                              <Edit2 size={12} />
                              <span>Edit Limit ({formatCurrency(sub.budget)})</span>
                            </button>

                            <button
                              onClick={() => deleteSubcategory(cat.id, sub.id)}
                              className="p-1 text-[#777777] hover:text-[#FF6B6B] transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Bottom Actions for Pillar */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#1F1F1F]">
                      <button
                        onClick={() => handleOpenAdd(cat.id, cat.name)}
                        className="flex items-center space-x-1.5 bg-[#1E1E1E] hover:bg-[#282828] text-[#FFFFFF] border border-[#2E2E2E] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        <Plus size={13} strokeWidth={2.5} />
                        <span>Add Subcategory</span>
                      </button>

                      <button
                        onClick={() => setIsAdjustAllocationOpen(true)}
                        className="flex items-center space-x-1.5 bg-[#1E1E1E] hover:bg-[#282828] text-[#D6D6D6] border border-[#2E2E2E] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      >
                        <SlidersHorizontal size={12} className="text-[#A0A0A0]" />
                        <span>Adjust % ({cat.targetPercent || 0}%)</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Subcategory Add/Edit Modal */}
      <SubcategoryModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        categoryId={modalState.categoryId}
        categoryName={modalState.categoryName}
        editingSubcategory={modalState.editingSubcategory}
      />

      {/* Adjust Allocation Modal */}
      <AdjustAllocationModal
        isOpen={isAdjustAllocationOpen}
        onClose={() => setIsAdjustAllocationOpen(false)}
      />
    </div>
  );
}
