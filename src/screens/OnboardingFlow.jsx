import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Plus, Trash2, Check, AlertCircle, Sparkles, Shield, Wallet, Layers, Delete, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import CategoryIcon from '../components/CategoryIcon';

const SPLASH_BASE_PATTERN = ['Spend', 'Save', 'Plan'];
const REEL_WORDS = [];
for (let i = 0; i < 40; i++) {
  REEL_WORDS.push(...SPLASH_BASE_PATTERN);
}
const SPLASH_SLOT_HEIGHT = 68;
const START_INDEX = 30;

function WebSplashRollingCarousel() {
  const [currIndex, setCurrIndex] = useState(START_INDEX);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrIndex((prev) => {
        const next = prev - 1;
        return next <= 6 ? START_INDEX + (next % 3) : next;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[204px] overflow-hidden w-full relative select-none -mx-2 px-2">
      <div
        className="w-full transition-transform duration-600 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{
          transform: `translateY(${-currIndex * SPLASH_SLOT_HEIGHT + SPLASH_SLOT_HEIGHT}px)`,
        }}
      >
        {REEL_WORDS.map((word, i) => {
          const isCenter = i === currIndex;
          const isAdjacent = i === currIndex - 1 || i === currIndex + 1;
          return (
            <div key={i} className="h-[68px] flex items-center">
              <div
                className="transition-all duration-600 ease-[cubic-bezier(0.25,0.1,0.25,1)] origin-left px-2 py-1"
                style={{
                  opacity: isCenter ? 1.0 : isAdjacent ? 0.35 : 0,
                  transform: isCenter ? 'scale(1.08)' : isAdjacent ? 'scale(0.9)' : 'scale(0.85)',
                }}
              >
                <span
                  className={`tracking-tight ${
                    isCenter
                      ? 'text-4xl sm:text-5xl font-extrabold text-[#000000]'
                      : 'text-3xl sm:text-4xl font-normal text-[#9E9E9E]'
                  }`}
                >
                  {word}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OnboardingFlow({ onFinish }) {
  const { currency, completeOnboarding } = useFinance();

  const [step, setStep] = useState(1);
  const [setupIncomeStr, setSetupIncomeStr] = useState('');

  // Step 2 State: Income Sources
  const [incomeSources, setIncomeSources] = useState([
    { id: '1', name: 'Primary Salary', amount: '0' },
  ]);

  const totalIncome = parseFloat(setupIncomeStr || '0') || 0;

  const handleSetupKeypadPress = (val) => {
    if (val === 'backspace') {
      setSetupIncomeStr((prev) => (prev && prev.length > 0 ? prev.slice(0, -1) : ''));
      return;
    }
    setSetupIncomeStr((prev) => {
      if (!prev || prev === '0') return val;
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
  const [isAddingSub, setIsAddingSub] = useState(false);

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

  // Handle adding subcategory in step 4 with budget cap enforcement
  const handleAddSubcategoryToSetup = () => {
    if (!newSubName.trim()) return;
    const activeCap = currentAllocations[activeSetupCategory] || 0;
    const currentSubs = subcategories[activeSetupCategory] || [];
    const currentSum = currentSubs.reduce((sum, s) => sum + (parseFloat(s.budget) || 0), 0);
    const remaining = Math.max(0, activeCap - currentSum);

    const entered = parseFloat(newSubBudget) || 0;
    const finalBudget = Math.min(entered, remaining);

    const newSub = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      budget: finalBudget,
      icon: 'ShoppingBag',
    };
    setSubcategories((prev) => ({
      ...prev,
      [activeSetupCategory]: [...prev[activeSetupCategory], newSub],
    }));
    setNewSubName('');
    setNewSubBudget('');
    setIsAddingSub(false);
  };

  const handleUpdateSubBudget = (catKey, subId, newBud) => {
    const activeCap = currentAllocations[catKey] || 0;
    const currentSubs = subcategories[catKey] || [];
    const otherSubsSum = currentSubs
      .filter((s) => s.id !== subId)
      .reduce((sum, s) => sum + (parseFloat(s.budget) || 0), 0);
    const maxAllowed = Math.max(0, activeCap - otherSubsSum);

    let finalBud = newBud;
    if (newBud !== '' && !isNaN(newBud)) {
      const num = parseFloat(newBud) || 0;
      if (num > maxAllowed) {
        finalBud = maxAllowed;
      }
    }

    setSubcategories((prev) => ({
      ...prev,
      [catKey]: prev[catKey].map((s) =>
        s.id === subId ? { ...s, budget: finalBud === '' ? '' : parseFloat(finalBud) || 0 } : s
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
            className="pt-16 px-8 flex flex-col items-start z-10 w-full"
          >
            <WebSplashRollingCarousel />
          </motion.div>

          {/* Soft Atmospheric Monochrome Gradient Rising from the Bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-[64%] pointer-events-none z-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(245,245,245,0.8) 20%, rgba(214,214,214,0.95) 45%, #737373 70%, #141414 100%)',
            }}
          />

          {/* Content Positioned Over the Lower Gradient Area (No badge) */}
          <div className="relative z-10 px-8 pb-8 pt-6 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.25, ease: 'easeOut' }}
              className="space-y-2.5"
            >
              {/* Large Short Headline */}
              <h1 className="text-3xl sm:text-4xl font-black text-[#FFFFFF] tracking-tight leading-tight">
                Your wealth,<br />in perfect balance.
              </h1>

              {/* Small Supporting Description */}
              <p className="text-xs sm:text-sm text-[#B3B3B3] leading-relaxed max-w-xs font-medium">
                Master your cash flow with 50/30/20 discipline,<br />track real-time outflows, and achieve clarity.
              </p>
            </motion.div>

            {/* Clean Single Primary CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
              className="pt-7"
            >
              {/* Primary: Get Started (Black background, White text) */}
              <button
                onClick={() => {
                  setSetupIncomeStr('');
                  setStep(2);
                }}
                className="w-full h-14 bg-[#000000] hover:bg-[#1C1C1C] border border-[#333333] text-[#FFFFFF] font-bold text-sm rounded-full flex items-center justify-center transition-all shadow-xl active:scale-[0.98]"
              >
                Get Started
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
              Monthly Net Income
            </h2>
          </div>

          {/* Large Hero Calculator Display with Caret */}
          <div className="flex items-center justify-center py-6">
            {setupIncomeStr && (
              <span className="text-5xl font-black text-[#FFFFFF] tracking-tight">
                {parseFloat(setupIncomeStr).toLocaleString('en-IN')}
              </span>
            )}
            <motion.div
              className="w-[3.5px] h-14 bg-white rounded-full ml-1"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
          </div>

          {/* 3-Column Filled Calculator Keypad (4 Rows) */}
          <div className="space-y-2.5 max-w-sm mx-auto w-full pb-2">
            <div className="grid grid-cols-3 gap-2.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleSetupKeypadPress(k)}
                  className="h-16 rounded-2xl bg-[#141414] hover:bg-[#1F1F1F] border border-[#222222] text-2xl font-bold text-[#FFFFFF] transition-all active:scale-95 flex items-center justify-center shadow-md"
                >
                  {k}
                </button>
              ))}

              {/* Row 4: Backspace (left to zero) | 0 (center) | Tick Mark (right to zero) */}
              <button
                onClick={() => handleSetupKeypadPress('backspace')}
                className="h-16 rounded-2xl bg-[#141414] hover:bg-[#1F1F1F] border border-[#222222] text-[#FFFFFF] transition-all active:scale-95 flex items-center justify-center shadow-md"
              >
                <Delete size={24} />
              </button>

              <button
                onClick={() => handleSetupKeypadPress('0')}
                className="h-16 rounded-2xl bg-[#141414] hover:bg-[#1F1F1F] border border-[#222222] text-2xl font-bold text-[#FFFFFF] transition-all active:scale-95 flex items-center justify-center shadow-md"
              >
                0
              </button>

              <button
                onClick={() => {
                  if (totalIncome > 0) {
                    setIncomeSources([{ id: '1', name: 'Primary Salary', amount: setupIncomeStr }]);
                    setStep(3);
                  }
                }}
                disabled={totalIncome <= 0}
                className={`h-16 rounded-2xl border transition-all active:scale-95 flex items-center justify-center shadow-lg ${
                  totalIncome > 0
                    ? 'bg-[#FFFFFF] text-[#0A0A0A] border-[#FFFFFF] cursor-pointer'
                    : 'bg-[#121212] text-[#444444] border-[#1E1E1E] cursor-not-allowed opacity-40'
                }`}
              >
                <Check size={26} strokeWidth={3} />
              </button>
            </div>
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
          <div className="space-y-4">
            {/* Header Title Only (No Subtext) */}
            <div>
              <h2 className="text-2xl font-black text-[#FFFFFF] tracking-tight">
                Where should your money go?
              </h2>
            </div>

            {/* Horizontal Segmented Ratio Visualizer Bar */}
            <div className="bg-[#141414] border border-[#222222] rounded-2xl p-3.5 space-y-2.5">
              <div className="h-3.5 rounded-full overflow-hidden flex bg-[#1E1E1E] gap-0.5">
                <div
                  style={{ width: `${percentAllocations.needs}%` }}
                  className="h-full bg-[#FFFFFF] transition-all"
                />
                <div
                  style={{ width: `${percentAllocations.wants}%` }}
                  className="h-full bg-[#8E8E93] transition-all"
                />
                <div
                  style={{ width: `${percentAllocations.savings}%` }}
                  className="h-full bg-[#48484A] transition-all"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#A0A0A0] px-1">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFFFFF]" />
                  <span>Needs {percentAllocations.needs}%</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8E8E93]" />
                  <span>Wants {percentAllocations.wants}%</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#48484A]" />
                  <span>Savings {percentAllocations.savings}%</span>
                </div>
              </div>
            </div>

            {/* Ratio Presets Below Top Bar */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { ratio: '50/30/20', n: 50, w: 30, s: 20 },
                { ratio: '60/20/20', n: 60, w: 20, s: 20 },
                { ratio: '70/20/10', n: 70, w: 20, s: 10 },
                { ratio: '40/30/30', n: 40, w: 30, s: 30 },
              ].map((r) => {
                const isMatch =
                  percentAllocations.needs === r.n &&
                  percentAllocations.wants === r.w &&
                  percentAllocations.savings === r.s;
                return (
                  <button
                    key={r.ratio}
                    onClick={() => setPercentAllocations({ needs: r.n, wants: r.w, savings: r.s })}
                    className={`py-2.5 px-1 rounded-xl text-center font-mono font-bold text-xs transition-all border ${
                      isMatch
                        ? 'bg-[#FFFFFF] text-[#090909] border-[#FFFFFF]'
                        : 'bg-[#141414] text-[#8A8A8A] border-[#222222] hover:bg-[#1A1A1A]'
                    }`}
                  >
                    {r.ratio}
                  </button>
                );
              })}
            </div>

            {/* Horizontal Range Slider Cards (No Subtext, No -5/+5 buttons) */}
            <div className="space-y-3">
              {/* Needs */}
              <div className="bg-[#141414] border border-[#242424] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF]" />
                    <span className="text-sm font-bold text-[#FFFFFF]">Needs</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs text-[#8A8A8A]">
                      {currency}{currentAllocations.needs.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm font-bold font-mono text-[#FFFFFF]">{percentAllocations.needs}%</span>
                  </div>
                </div>

                <div className="pt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={percentAllocations.needs}
                    onChange={(e) =>
                      setPercentAllocations((prev) => ({ ...prev, needs: Number(e.target.value) }))
                    }
                    className="w-full accent-white h-2 bg-[#222222] rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Wants */}
              <div className="bg-[#141414] border border-[#242424] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8E8E93]" />
                    <span className="text-sm font-bold text-[#FFFFFF]">Wants</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs text-[#8A8A8A]">
                      {currency}{currentAllocations.wants.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm font-bold font-mono text-[#FFFFFF]">{percentAllocations.wants}%</span>
                  </div>
                </div>

                <div className="pt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={percentAllocations.wants}
                    onChange={(e) =>
                      setPercentAllocations((prev) => ({ ...prev, wants: Number(e.target.value) }))
                    }
                    className="w-full accent-[#8E8E93] h-2 bg-[#222222] rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Savings */}
              <div className="bg-[#141414] border border-[#242424] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#48484A]" />
                    <span className="text-sm font-bold text-[#FFFFFF]">Savings</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs text-[#8A8A8A]">
                      {currency}{currentAllocations.savings.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm font-bold font-mono text-[#FFFFFF]">{percentAllocations.savings}%</span>
                  </div>
                </div>

                <div className="pt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={percentAllocations.savings}
                    onChange={(e) =>
                      setPercentAllocations((prev) => ({ ...prev, savings: Number(e.target.value) }))
                    }
                    className="w-full accent-[#636366] h-2 bg-[#222222] rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Single Centered CTA for Auto-Fix or Balance Status */}
            <div className="flex justify-center pt-2">
              {(() => {
                const totalPct = percentAllocations.needs + percentAllocations.wants + percentAllocations.savings;
                const isBalanced = totalPct === 100;

                const autoFixPercentages = (nVal, wVal, sVal) => {
                  const n = Math.max(0, Math.min(100, Math.round(Number(nVal) || 0)));
                  const w = Math.max(0, Math.min(100, Math.round(Number(wVal) || 0)));
                  if (n >= 100) return { needs: 80, wants: 10, savings: 10 };
                  if (n + w >= 100) {
                    const adjW = Math.max(5, 100 - n - 5);
                    const adjS = Math.max(0, 100 - n - adjW);
                    return { needs: n, wants: adjW, savings: adjS };
                  }
                  return { needs: n, wants: w, savings: 100 - n - w };
                };

                if (!isBalanced) {
                  return (
                    <button
                      onClick={() => {
                        const fixed = autoFixPercentages(percentAllocations.needs, percentAllocations.wants, percentAllocations.savings);
                        setPercentAllocations(fixed);
                      }}
                      className="px-7 py-3.5 bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] font-black text-xs sm:text-sm rounded-full flex items-center space-x-2 transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                      <Sparkles size={16} />
                      <span>
                        Auto Fix to 100% ({totalPct > 100 ? `+${totalPct - 100}% over` : `${100 - totalPct}% left`})
                      </span>
                    </button>
                  );
                }

                return (
                  <div className="flex items-center space-x-2 bg-[#141414] border border-[#242424] px-5 py-2.5 rounded-full font-bold text-xs text-[#FFFFFF]">
                    <Check size={16} strokeWidth={2.8} />
                    <span>100% Balanced ({currency}{totalAllocated.toLocaleString('en-IN')})</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Navigation Bar with Highlighted Continue CTA */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="w-14 h-14 bg-[#141414] border border-[#242424] rounded-full flex items-center justify-center text-[#FFFFFF] hover:bg-[#1C1C1C] transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={20} strokeWidth={2.4} />
            </button>

            {(() => {
              const totalPct = percentAllocations.needs + percentAllocations.wants + percentAllocations.savings;
              const isBalanced = totalPct === 100;

              const autoFixPercentages = (nVal, wVal, sVal) => {
                const n = Math.max(0, Math.min(100, Math.round(Number(nVal) || 0)));
                const w = Math.max(0, Math.min(100, Math.round(Number(wVal) || 0)));
                if (n >= 100) return { needs: 80, wants: 10, savings: 10 };
                if (n + w >= 100) {
                  const adjW = Math.max(5, 100 - n - 5);
                  const adjS = Math.max(0, 100 - n - adjW);
                  return { needs: n, wants: adjW, savings: adjS };
                }
                return { needs: n, wants: w, savings: 100 - n - w };
              };

              return (
                <button
                  onClick={() => {
                    let currentPct = percentAllocations;
                    if (!isBalanced) {
                      currentPct = autoFixPercentages(percentAllocations.needs, percentAllocations.wants, percentAllocations.savings);
                      setPercentAllocations(currentPct);
                    }

                    const nBud = Math.round((totalIncomeNum * currentPct.needs) / 100);
                    const wBud = Math.round((totalIncomeNum * currentPct.wants) / 100);
                    const sBud = Math.round((totalIncomeNum * currentPct.savings) / 100);

                    setSubcategories({
                      needs: [
                        { id: 'sub-rent', name: 'Rent', budget: Math.round(nBud * 0.4), icon: 'House' },
                        { id: 'sub-groceries', name: 'Groceries', budget: Math.round(nBud * 0.25), icon: 'ShoppingBasket' },
                        { id: 'sub-utilities', name: 'Utilities', budget: Math.round(nBud * 0.15), icon: 'Zap' },
                        { id: 'sub-transport', name: 'Transportation', budget: Math.round(nBud * 0.2), icon: 'Car' },
                      ],
                      wants: [
                        { id: 'sub-dining', name: 'Dining Out', budget: Math.round(wBud * 0.35), icon: 'UtensilsCrossed' },
                        { id: 'sub-shopping', name: 'Shopping', budget: Math.round(wBud * 0.3), icon: 'ShoppingBag' },
                        { id: 'sub-subscriptions', name: 'Subscriptions', budget: Math.round(wBud * 0.15), icon: 'Repeat' },
                        { id: 'sub-leisure', name: 'Leisure', budget: Math.round(wBud * 0.2), icon: 'Gamepad2' },
                      ],
                      savings: [
                        { id: 'sub-emergency', name: 'Emergency Fund', budget: Math.round(sBud * 0.4), icon: 'ShieldCheck' },
                        { id: 'sub-investments', name: 'Investments', budget: Math.round(sBud * 0.4), icon: 'TrendingUp' },
                        { id: 'sub-debt', name: 'Debt Repayment', budget: Math.round(sBud * 0.2), icon: 'ArrowDownRight' },
                      ],
                    });
                    setStep(4);
                  }}
                  className={`h-14 px-6 rounded-full flex items-center justify-center space-x-2 transition-all shadow-xl active:scale-95 cursor-pointer ${
                    isBalanced
                      ? 'bg-[#FFFFFF] text-[#090909] hover:bg-[#EAEAEA]'
                      : 'bg-[#202020] text-[#FFFFFF] border border-[#303030]'
                  }`}
                >
                  <span className="text-sm font-bold">Continue</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </button>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* STEP 4: SUBCATEGORIES SETUP & FINALIZATION */}
      {step === 4 && (() => {
        const activePillarCap = currentAllocations[activeSetupCategory] || 0;
        const currentSubsList = subcategories[activeSetupCategory] || [];
        const currentAllocatedTotal = currentSubsList.reduce((sum, s) => sum + (parseFloat(s.budget) || 0), 0);
        const pillarRemaining = activePillarCap - currentAllocatedTotal;
        const hasAnyPillarExceeded = ['needs', 'wants', 'savings'].some((cKey) => {
          const cap = currentAllocations[cKey] || 0;
          const total = (subcategories[cKey] || []).reduce((sum, s) => sum + (parseFloat(s.budget) || 0), 0);
          return total > cap;
        });

        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col justify-between py-4 space-y-6"
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-black text-[#FFFFFF] tracking-tight">
                  Customize Expense Categories
                </h2>
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
                    {cKey} ({currency}{Number(currentAllocations[cKey] || 0).toLocaleString('en-IN')})
                  </button>
                ))}
              </div>

              {/* Active Pillar Allocation Summary & Remaining Budget Card */}
              <div className="bg-[#141414] border border-[#242424] rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#8A8A8A] tracking-wider uppercase text-[10px]">
                    {activeSetupCategory} Allocated
                  </span>
                  <span
                    className={`font-bold ${
                      pillarRemaining === 0
                        ? 'text-[#FFFFFF]'
                        : pillarRemaining > 0
                        ? 'text-[#CCCCCC]'
                        : 'text-[#FF5C5C]'
                    }`}
                  >
                    {pillarRemaining === 0
                      ? '✓ 100% Allocated'
                      : pillarRemaining > 0
                      ? `${currency}${pillarRemaining.toLocaleString('en-IN')} available`
                      : `Exceeds by ${currency}${Math.abs(pillarRemaining).toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-[#222222] overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(0, (currentAllocatedTotal / (activePillarCap || 1)) * 100))}%`,
                    }}
                    className={`h-full transition-all ${
                      pillarRemaining < 0 ? 'bg-[#FF5C5C]' : 'bg-[#FFFFFF]'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8A8A8A] font-semibold">
                  <span>{currency}{currentAllocatedTotal.toLocaleString('en-IN')} allocated</span>
                  <span>Limit: {currency}{activePillarCap.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Subcategories Editor List */}
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto no-scrollbar pr-1">
                {currentSubsList.map((sub) => (
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

              {/* Centered Add Category CTA & Expandable Form */}
              {!isAddingSub ? (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => {
                      if (pillarRemaining <= 0) return;
                      setNewSubBudget(String(pillarRemaining));
                      setIsAddingSub(true);
                    }}
                    disabled={pillarRemaining <= 0}
                    className={`flex items-center space-x-2 px-6 py-2.5 border rounded-full text-xs font-bold transition-all ${
                      pillarRemaining > 0
                        ? 'bg-[#141414] hover:bg-[#1A1A1A] border-[#242424] text-[#FFFFFF] active:scale-95 shadow-md cursor-pointer'
                        : 'bg-[#121212] border-[#1C1C1C] text-[#555555] cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Plus size={15} strokeWidth={2.6} />
                    <span>{pillarRemaining <= 0 ? 'Pillar Budget Full' : 'Add'}</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#111111] border border-[#242424] rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FFFFFF]">
                      + Add Custom {activeSetupCategory === 'needs' ? 'Need' : activeSetupCategory === 'wants' ? 'Want' : 'Savings'} (Max {currency}{pillarRemaining.toLocaleString('en-IN')})
                    </span>
                    <button
                      onClick={() => {
                        setIsAddingSub(false);
                        setNewSubName('');
                        setNewSubBudget('');
                      }}
                      className="text-[#8A8A8A] hover:text-[#FFFFFF] transition-colors p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="text"
                      placeholder="Category name (e.g. Gym, Pet Care)"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      autoFocus
                      className="flex-1 bg-[#141414] border border-[#242424] rounded-xl px-3 py-2 text-sm text-[#FFFFFF] placeholder-[#666666] focus:outline-none"
                    />
                    <div className="flex items-center space-x-1.5 bg-[#0D0D0D] border border-[#242424] rounded-xl px-3 py-2">
                      <span className="text-xs font-mono font-bold text-[#8A8A8A]">{currency}</span>
                      <input
                        type="number"
                        placeholder={String(pillarRemaining)}
                        value={newSubBudget}
                        onChange={(e) => {
                          const num = parseFloat(e.target.value) || 0;
                          if (num > pillarRemaining) {
                            setNewSubBudget(String(pillarRemaining));
                          } else {
                            setNewSubBudget(e.target.value);
                          }
                        }}
                        className="w-20 bg-transparent text-sm text-[#FFFFFF] font-mono text-right focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleAddSubcategoryToSetup}
                      disabled={!newSubName.trim() || pillarRemaining <= 0}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        newSubName.trim() && pillarRemaining > 0
                          ? 'bg-[#FFFFFF] text-[#0A0A0A] hover:bg-[#EAEAEA] cursor-pointer'
                          : 'bg-[#222222] text-[#666666] cursor-not-allowed'
                      }`}
                    >
                      <Plus size={14} strokeWidth={3} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setStep(3)}
                className="w-14 h-14 bg-[#161616] border border-[#242424] rounded-2xl flex items-center justify-center text-[#FFFFFF] hover:bg-[#202020] transition-all active:scale-95"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                onClick={handleCompleteAll}
                disabled={hasAnyPillarExceeded}
                className={`flex-1 h-14 font-bold text-base rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl active:scale-95 ${
                  !hasAnyPillarExceeded
                    ? 'bg-[#FFFFFF] text-[#0A0A0A] hover:bg-[#EAEAEA] cursor-pointer'
                    : 'bg-[#181818] text-[#555555] border border-[#222222] cursor-not-allowed opacity-50'
                }`}
              >
                <span>Let's Go</span>
                <ArrowRight size={18} strokeWidth={2.8} />
              </button>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}
