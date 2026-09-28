import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Plus, Trash2, Check, AlertCircle, Sparkles, Shield, Wallet, Layers, Delete } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import CategoryIcon from '../components/CategoryIcon';

export default function OnboardingFlow({ onFinish }) {
  const { currency, completeOnboarding } = useFinance();

  const [step, setStep] = useState(1);
  const [setupIncomeStr, setSetupIncomeStr] = useState('50000');

  // Step 2 State: Income Sources
  const [incomeSources, setIncomeSources] = useState([
    { id: '1', name: 'Primary Salary', amount: '50000' },
  ]);

  const totalIncome = parseFloat(setupIncomeStr || '0') || 0;

  const handleSetupKeypadPress = (val) => {
    if (val === 'backspace') {
      setSetupIncomeStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (val === '.') {
      if (!setupIncomeStr.includes('.')) {
        setSetupIncomeStr((prev) => prev + '.');
      }
      return;
    }
    setSetupIncomeStr((prev) => {
      if (prev === '0') return val;
      if (prev.length >= 8) return prev;
      return prev + val;
    });
  };

  // Step 3 State: Allocation Mode ('amount' | 'percent')
  const [allocationMode, setAllocationMode] = useState('percent');
  const [percentAllocations, setPercentAllocations] = useState({
    needs: 50,
    wants: 30,
    savings: 20,
  });
  const [amountAllocations, setAmountAllocations] = useState({
    needs: '',
    wants: '',
    savings: '',
  });

  // Calculate actual amounts
  const currentAllocations = {
    needs: allocationMode === 'percent' ? Math.round((totalIncome * percentAllocations.needs) / 100) : parseFloat(amountAllocations.needs) || 0,
    wants: allocationMode === 'percent' ? Math.round((totalIncome * percentAllocations.wants) / 100) : parseFloat(amountAllocations.wants) || 0,
    savings: allocationMode === 'percent' ? Math.round((totalIncome * percentAllocations.savings) / 100) : parseFloat(amountAllocations.savings) || 0,
  };

  const totalAllocated = currentAllocations.needs + currentAllocations.wants + currentAllocations.savings;
  const isOverAllocated = totalAllocated > totalIncome;
  const overAmount = totalAllocated - totalIncome;
  const unallocatedAmount = Math.max(0, totalIncome - totalAllocated);

  // Step 4 State: Subcategories Setup
  const [subcategories, setSubcategories] = useState({
    needs: [
      { id: 'sub-rent', name: 'Rent', budget: 10000, icon: 'House' },
      { id: 'sub-groceries', name: 'Groceries', budget: 6000, icon: 'ShoppingBasket' },
      { id: 'sub-utilities', name: 'Utilities', budget: 3000, icon: 'Zap' },
      { id: 'sub-transport', name: 'Transportation', budget: 4000, icon: 'Car' },
    ],
    wants: [
      { id: 'sub-dining', name: 'Dining Out', budget: 5000, icon: 'UtensilsCrossed' },
      { id: 'sub-shopping', name: 'Shopping', budget: 4000, icon: 'ShoppingBag' },
      { id: 'sub-subscriptions', name: 'Subscriptions', budget: 2000, icon: 'Repeat' },
      { id: 'sub-leisure', name: 'Leisure', budget: 4000, icon: 'Gamepad2' },
    ],
    savings: [
      { id: 'sub-emergency', name: 'Emergency Fund', budget: 4000, icon: 'ShieldCheck' },
      { id: 'sub-investments', name: 'Investments', budget: 4000, icon: 'TrendingUp' },
      { id: 'sub-debt', name: 'Debt Repayment', budget: 2000, icon: 'ArrowDownRight' },
    ],
  });

  const [activeSetupCategory, setActiveSetupCategory] = useState('needs');
  const [newSubName, setNewSubName] = useState('');
  const [newSubBudget, setNewSubBudget] = useState('');

  // Handle Income updates
  const handleAddSource = () => {
    setIncomeSources((prev) => [
      ...prev,
      { id: String(Date.now()), name: 'Additional Source', amount: '5000' },
    ]);
  };

  const handleUpdateSource = (id, key, value) => {
    setIncomeSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  };

  const handleDeleteSource = (id) => {
    if (incomeSources.length > 1) {
      setIncomeSources((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Handle adding subcategory in step 4
  const handleAddSubcategoryToSetup = () => {
    if (!newSubName.trim() || !newSubBudget) return;
    const b = parseFloat(newSubBudget) || 0;
    const newSub = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      budget: b,
      icon: 'ShoppingBag',
    };
    setSubcategories((prev) => ({
      ...prev,
      [activeSetupCategory]: [...prev[activeSetupCategory], newSub],
    }));
    setNewSubName('');
    setNewSubBudget('');
  };

  const handleUpdateSubBudget = (catKey, subId, newBud) => {
    setSubcategories((prev) => ({
      ...prev,
      [catKey]: prev[catKey].map((s) =>
        s.id === subId ? { ...s, budget: parseFloat(newBud) || 0 } : s
      ),
    }));
  };

  const handleUpdateSubName = (catKey, subId, newName) => {
    setSubcategories((prev) => ({
      ...prev,
      [catKey]: prev[catKey].map((s) =>
        s.id === subId ? { ...s, name: newName } : s
      ),
    }));
  };

  const handleDeleteSubcategoryFromSetup = (catKey, subId) => {
    setSubcategories((prev) => ({
      ...prev,
      [catKey]: prev[catKey].filter((s) => s.id !== subId),
    }));
  };

  const handleCompleteAll = () => {
    const formattedSources = incomeSources.map((s) => ({
      id: s.id,
      name: s.name.trim() || 'Income',
      amount: parseFloat(s.amount) || 0,
    }));

    completeOnboarding({
      incomeSources: formattedSources,
      allocations: currentAllocations,
      subcategories,
    });

    if (onFinish) onFinish();
  };

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0A] text-[#FFFFFF] px-6 py-6 select-none justify-between">
      {/* Top Stepper Indicator */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-[#FFFFFF] text-[#0A0A0A] flex items-center justify-center font-black text-xs">
            B
          </div>
          <span className="text-xs font-bold tracking-wider text-[#FFFFFF] uppercase">
            Balance Setup
          </span>
        </div>

        {step > 1 && (
          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-[#FFFFFF]' : i < step ? 'w-2 bg-[#8A8A8A]' : 'w-2 bg-[#222222]'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* STEP 1: REFERENCE MINIMAL ATMOSPHERIC SPLASH SCREEN */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative flex-1 flex flex-col justify-between -mx-6 -my-6 bg-[#FFFFFF] overflow-hidden min-h-[620px]"
        >
          {/* Upper / Middle Stacked Minimal Typography with Generous Whitespace */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="pt-16 px-8 flex flex-col items-start z-10"
          >
            <span className="text-3xl sm:text-4xl font-normal text-[#9E9E9E] tracking-tight leading-tight">
              Plan
            </span>
            <span className="text-5xl sm:text-6xl font-black text-[#000000] tracking-wider leading-none my-1.5 font-sans">
              SPEND
            </span>
            <span className="text-3xl sm:text-4xl font-normal text-[#9E9E9E] tracking-tight leading-tight">
              Save
            </span>
          </motion.div>

          {/* Soft Atmospheric Monochrome Gradient Rising from the Bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-[64%] pointer-events-none z-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(245,245,245,0.8) 20%, rgba(214,214,214,0.95) 45%, #737373 70%, #141414 100%)',
            }}
          />

          {/* Content Positioned Over the Lower Gradient Area */}
          <div className="relative z-10 px-8 pb-8 pt-6 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.25, ease: 'easeOut' }}
              className="space-y-3"
            >
              {/* Small Monochrome Icon Badge */}
              <div className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-[#FFFFFF] shadow-md backdrop-blur-md">
                <Sparkles size={16} strokeWidth={2.4} />
              </div>

              {/* Large Short Headline */}
              <h1 className="text-3xl sm:text-4xl font-black text-[#FFFFFF] tracking-tight leading-tight">
                Your money,<br />in balance.
              </h1>

              {/* Small Supporting Description */}
              <p className="text-xs sm:text-sm text-[#B3B3B3] leading-relaxed max-w-xs font-medium">
                Plan your income, track your spending, and know exactly where your money goes.
              </p>
            </motion.div>

            {/* Two Large Rounded CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
              className="space-y-2.5 pt-7"
            >
              {/* Primary: Get Started (Black background, White text) */}
              <button
                onClick={() => setStep(2)}
                className="w-full h-14 bg-[#000000] hover:bg-[#1C1C1C] border border-[#333333] text-[#FFFFFF] font-bold text-sm rounded-full flex items-center justify-center transition-all shadow-xl active:scale-[0.98]"
              >
                Get Started
              </button>

              {/* Secondary: I already have an account (Very light grey background, Black text) */}
              <button
                onClick={handleCompleteAll}
                className="w-full h-14 bg-[#F0F0F0] hover:bg-[#E5E5E5] text-[#090909] font-bold text-sm rounded-full flex items-center justify-center transition-all active:scale-[0.98]"
              >
                I already have an account
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* STEP 2: CALCULATOR MONTHLY INCOME */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col justify-between py-2 select-none"
        >
          {/* Top Title Only */}
          <div className="pt-2">
            <h2 className="text-2xl font-black text-[#FFFFFF] tracking-tight">
              What is your monthly income?
            </h2>
          </div>

          {/* Large Hero Calculator Display */}
          <div className="flex items-center justify-center py-6">
            <span className="text-3xl font-bold text-[#8A8A8A] mr-2">{currency}</span>
            <span className="text-5xl font-black text-[#FFFFFF] font-mono tracking-tight">
              {parseFloat(setupIncomeStr || '0').toLocaleString('en-IN')}
            </span>
          </div>

          {/* 3-Column Filled Calculator Keypad */}
          <div className="space-y-2.5 max-w-sm mx-auto w-full pb-2">
            <div className="grid grid-cols-3 gap-2.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleSetupKeypadPress(k)}
                  className="h-15 rounded-2xl bg-[#141414] hover:bg-[#1F1F1F] border border-[#222222] text-2xl font-bold text-[#FFFFFF] transition-all active:scale-95 flex items-center justify-center shadow-md"
                >
                  {k}
                </button>
              ))}
              <button
                onClick={() => handleSetupKeypadPress('backspace')}
                className="h-15 rounded-2xl bg-[#141414] hover:bg-[#1F1F1F] border border-[#222222] text-[#FFFFFF] transition-all active:scale-95 flex items-center justify-center shadow-md"
              >
                <Delete size={22} />
              </button>
            </div>

            {/* Bottom Keypad Action: Full-width Next Key */}
            <button
              onClick={() => {
                setIncomeSources([{ id: '1', name: 'Primary Salary', amount: setupIncomeStr }]);
                setStep(3);
              }}
              disabled={totalIncome <= 0}
              className="w-full h-14 bg-[#FFFFFF] disabled:bg-[#333333] text-[#0A0A0A] font-bold text-base rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl active:scale-95 mt-2"
            >
              <span>Next</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: INCOME ALLOCATION */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col justify-between py-4 space-y-6"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#A0A0A0] uppercase tracking-widest">
                  Step 2 of 3
                </span>
                <h2 className="text-2xl font-black text-[#FFFFFF] tracking-tight mt-1">
                  Where should your money go?
                </h2>
                <p className="text-sm text-[#8A8A8A] mt-1.5">
                  Allocate across the 3 pillars.
                </p>
              </div>

              {/* Amount / Percentage Switcher */}
              <div className="flex items-center bg-[#161616] border border-[#242424] p-1.5 rounded-full text-xs">
                <button
                  onClick={() => setAllocationMode('percent')}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                    allocationMode === 'percent' ? 'bg-[#FFFFFF] text-[#0A0A0A]' : 'text-[#8A8A8A]'
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => setAllocationMode('amount')}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                    allocationMode === 'amount' ? 'bg-[#FFFFFF] text-[#0A0A0A]' : 'text-[#8A8A8A]'
                  }`}
                >
                  {currency}
                </button>
              </div>
            </div>

            {/* Income Allocation Cards (Needs 50%, Wants 30%, Savings 20%) */}
            <div className="space-y-3.5">
              {/* Needs Allocation */}
              <div className="bg-[#141414] border border-[#242424] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#FFFFFF]"></span>
                    <span className="text-sm font-bold text-[#FFFFFF]">Needs (Essentials)</span>
                  </div>
                  <span className="text-base font-bold font-mono text-[#FFFFFF]">
                    {currency}{currentAllocations.needs.toLocaleString('en-IN')}
                  </span>
                </div>

                {allocationMode === 'percent' ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={percentAllocations.needs}
                      onChange={(e) =>
                        setPercentAllocations((prev) => ({ ...prev, needs: Number(e.target.value) }))
                      }
                      className="flex-1 accent-white"
                    />
                    <span className="text-sm font-mono font-bold w-12 text-right">{percentAllocations.needs}%</span>
                  </div>
                ) : (
                  <input
                    type="number"
                    value={amountAllocations.needs}
                    onChange={(e) => setAmountAllocations((prev) => ({ ...prev, needs: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#FFFFFF]"
                  />
                )}
              </div>

              {/* Wants Allocation */}
              <div className="bg-[#141414] border border-[#242424] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#8A8A8A]"></span>
                    <span className="text-sm font-bold text-[#FFFFFF]">Wants (Lifestyle)</span>
                  </div>
                  <span className="text-base font-bold font-mono text-[#FFFFFF]">
                    {currency}{currentAllocations.wants.toLocaleString('en-IN')}
                  </span>
                </div>

                {allocationMode === 'percent' ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={percentAllocations.wants}
                      onChange={(e) =>
                        setPercentAllocations((prev) => ({ ...prev, wants: Number(e.target.value) }))
                      }
                      className="flex-1 accent-white"
                    />
                    <span className="text-sm font-mono font-bold w-12 text-right">{percentAllocations.wants}%</span>
                  </div>
                ) : (
                  <input
                    type="number"
                    value={amountAllocations.wants}
                    onChange={(e) => setAmountAllocations((prev) => ({ ...prev, wants: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#FFFFFF]"
                  />
                )}
              </div>

              {/* Savings Allocation */}
              <div className="bg-[#141414] border border-[#242424] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#444444]"></span>
                    <span className="text-sm font-bold text-[#FFFFFF]">Savings & Investments</span>
                  </div>
                  <span className="text-base font-bold font-mono text-[#FFFFFF]">
                    {currency}{currentAllocations.savings.toLocaleString('en-IN')}
                  </span>
                </div>

                {allocationMode === 'percent' ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={percentAllocations.savings}
                      onChange={(e) =>
                        setPercentAllocations((prev) => ({ ...prev, savings: Number(e.target.value) }))
                      }
                      className="flex-1 accent-white"
                    />
                    <span className="text-sm font-mono font-bold w-12 text-right">{percentAllocations.savings}%</span>
                  </div>
                ) : (
                  <input
                    type="number"
                    value={amountAllocations.savings}
                    onChange={(e) => setAmountAllocations((prev) => ({ ...prev, savings: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#FFFFFF]"
                  />
                )}
              </div>
            </div>

            {/* Over-allocation or Balanced Status Banner */}
            {isOverAllocated ? (
              <div className="bg-[#1F1414] border border-[#442222] rounded-2xl p-4 flex items-center space-x-3 text-xs">
                <AlertCircle size={20} className="text-[#FFFFFF] shrink-0" />
                <div>
                  <span className="font-bold text-[#FFFFFF] block text-sm">Over allocated by {currency}{overAmount.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-[#A0A0A0]">Allocated ({currency}{totalAllocated.toLocaleString('en-IN')}) exceeds total monthly income.</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#141414] border border-[#242424] rounded-2xl p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#8A8A8A] block font-bold text-xs uppercase">Total Allocated</span>
                  <span className="text-lg font-bold font-mono text-[#FFFFFF]">
                    {currency}{totalAllocated.toLocaleString('en-IN')} of {currency}{totalIncome.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#8A8A8A] block font-bold text-xs uppercase">Unallocated</span>
                  <span className="text-sm font-bold font-mono text-[#D6D6D6]">
                    {currency}{unallocatedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => setStep(2)}
              className="w-14 h-14 bg-[#161616] border border-[#242424] rounded-2xl flex items-center justify-center text-[#FFFFFF]"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              onClick={() => setStep(4)}
              disabled={isOverAllocated}
              className="flex-1 h-14 bg-[#FFFFFF] disabled:bg-[#2E2E2E] text-[#0A0A0A] font-bold text-base rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl active:scale-95"
            >
              <span>Continue to Categories</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: SUBCATEGORIES SETUP & FINALIZATION */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col justify-between py-4 space-y-6"
        >
          <div className="space-y-5">
            <div>
              <span className="text-xs font-extrabold text-[#A0A0A0] uppercase tracking-widest">
                Step 3 of 3
              </span>
              <h2 className="text-2xl font-black text-[#FFFFFF] tracking-tight mt-1">
                Customize Expense Categories
              </h2>
              <p className="text-sm text-[#8A8A8A] mt-1.5">
                Add, remove, or customize categories for each pillar.
              </p>
            </div>

            {/* Category Tab Selector */}
            <div className="flex items-center space-x-2 bg-[#141414] border border-[#242424] p-1.5 rounded-2xl">
              {['needs', 'wants', 'savings'].map((cKey) => (
                <button
                  key={cKey}
                  onClick={() => setActiveSetupCategory(cKey)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                    activeSetupCategory === cKey ? 'bg-[#FFFFFF] text-[#0A0A0A]' : 'text-[#8A8A8A]'
                  }`}
                >
                  {cKey}
                </button>
              ))}
            </div>

            {/* Subcategories Editor List */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
              {subcategories[activeSetupCategory].map((sub) => (
                <div
                  key={sub.id}
                  className="bg-[#141414] border border-[#242424] rounded-2xl p-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 flex-1 pr-2">
                    <CategoryIcon iconName={sub.icon} size={16} variant="dark" />
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => handleUpdateSubName(activeSetupCategory, sub.id, e.target.value)}
                      className="bg-transparent text-sm font-semibold text-[#FFFFFF] focus:outline-none flex-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5 bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-1.5">
                      <span className="text-xs font-mono font-bold text-[#8A8A8A]">{currency}</span>
                      <input
                        type="number"
                        value={sub.budget}
                        onChange={(e) => handleUpdateSubBudget(activeSetupCategory, sub.id, e.target.value)}
                        className="w-20 bg-transparent text-sm font-mono font-bold text-[#FFFFFF] focus:outline-none text-right"
                      />
                    </div>

                    <button
                      onClick={() => handleDeleteSubcategoryFromSetup(activeSetupCategory, sub.id)}
                      className="p-2 text-[#666666] hover:text-[#FFFFFF] transition-colors"
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Subcategory inline form */}
            <div className="bg-[#111111] border border-[#242424] rounded-2xl p-3.5 flex items-center space-x-2.5">
              <input
                type="text"
                placeholder="New subcategory (e.g. Medical)"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[#FFFFFF] placeholder-[#666666] focus:outline-none"
              />
              <input
                type="number"
                placeholder="Budget"
                value={newSubBudget}
                onChange={(e) => setNewSubBudget(e.target.value)}
                className="w-24 bg-[#0D0D0D] border border-[#242424] rounded-xl px-3 py-1.5 text-sm text-[#FFFFFF] font-mono text-right"
              />
              <button
                onClick={handleAddSubcategoryToSetup}
                className="p-2 rounded-xl bg-[#FFFFFF] text-[#0A0A0A]"
              >
                <Plus size={16} strokeWidth={2.8} />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => setStep(3)}
              className="w-14 h-14 bg-[#161616] border border-[#242424] rounded-2xl flex items-center justify-center text-[#FFFFFF]"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              onClick={handleCompleteAll}
              className="flex-1 h-14 bg-[#FFFFFF] text-[#0A0A0A] font-bold text-base rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl active:scale-95"
            >
              <Check size={18} strokeWidth={3} />
              <span>Launch Home Dashboard</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
