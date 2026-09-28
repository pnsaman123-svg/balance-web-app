import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Sparkles, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export default function CinematicDemoPlayer({ isOpen, onClose, onRunAction }) {
  const { addTransaction, resetToDefault } = useFinance();

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const DEMO_STEPS = [
    {
      step: 0,
      title: 'Scene 1 — Overview & Income',
      desc: 'Dynamic entrance of the Balance dashboard showing ₹50,000 income and allocated 50/30/20 financial pillars.',
      tab: 'home',
      isExpense: false,
      zoom: 1.0,
      rotateX: 0,
      rotateY: 0,
    },
    {
      step: 1,
      title: 'Scene 2 — Unfolding Needs Budget',
      desc: 'Interactive unfolding of the Needs card revealing Rent, Groceries, Utilities, and Transportation.',
      tab: 'home',
      isExpense: false,
      zoom: 1.04,
      rotateX: 2,
      rotateY: -1,
    },
    {
      step: 2,
      title: 'Scene 3 — Rapid Expense Entry',
      desc: 'Seamless slide-up of the numeric keypad with ₹2,500 entered under Needs → Groceries.',
      tab: 'home',
      isExpense: true,
      zoom: 1.06,
      rotateX: 0,
      rotateY: 0,
    },
    {
      step: 3,
      title: 'Scene 4 — Transaction Processed',
      desc: 'Tactile press feedback with instant confirmation and subtle success notification.',
      tab: 'home',
      isExpense: false,
      zoom: 1.02,
      rotateX: -1,
      rotateY: 1,
      action: () => {
        addTransaction({
          title: 'Groceries (Demo)',
          amount: 2500,
          type: 'expense',
          categoryId: 'needs',
          subcategoryId: 'sub-groceries',
          subcategoryName: 'Groceries',
          icon: 'ShoppingBasket',
        });
      },
    },
    {
      step: 4,
      title: 'Scene 5 — Cascading Kinetic Counters',
      desc: 'Watch the balance cascade update: Groceries ₹3,500 · Needs ₹22,500 · Overall Balance ₹47,500.',
      tab: 'home',
      isExpense: false,
      zoom: 1.04,
      rotateX: 0,
      rotateY: 0,
    },
    {
      step: 5,
      title: 'Scene 6 — Spending Analytics & Charts',
      desc: 'Smooth transition to the Analytics view with interactive monochrome bar charts and breakdown.',
      tab: 'analytics',
      isExpense: false,
      zoom: 1.03,
      rotateX: 1,
      rotateY: -2,
    },
    {
      step: 6,
      title: 'Scene 7 — Final Hero Stance',
      desc: 'Balance — "Know where your money goes." Full monochrome financial clarity.',
      tab: 'home',
      isExpense: false,
      zoom: 1.0,
      rotateX: 0,
      rotateY: 0,
    },
  ];

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < DEMO_STEPS.length - 1) {
        const next = currentStep + 1;
        setCurrentStep(next);
        const stepObj = DEMO_STEPS[next];
        if (stepObj.action) stepObj.action();
        if (onRunAction) onRunAction(stepObj);
      } else {
        setIsPlaying(false);
      }
    }, 4200);

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, currentStep]);

  if (!isOpen) return null;

  const currentInfo = DEMO_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      const stepObj = DEMO_STEPS[next];
      if (stepObj.action) stepObj.action();
      if (onRunAction) onRunAction(stepObj);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      const stepObj = DEMO_STEPS[prev];
      if (onRunAction) onRunAction(stepObj);
    }
  };

  const handleRestart = () => {
    resetToDefault();
    setCurrentStep(0);
    setIsPlaying(true);
    if (onRunAction) onRunAction(DEMO_STEPS[0]);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="bg-[#111111]/95 backdrop-blur-2xl border border-[#292929] rounded-3xl p-4 shadow-2xl space-y-3 text-[#FFFFFF]"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#FFFFFF] animate-pulse"></span>
            <span className="text-xs font-bold tracking-wider uppercase text-[#FFFFFF]">
              Cinematic Product Demo
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 rounded-full bg-[#1C1C1C] hover:bg-[#282828] border border-[#292929] text-[11px] font-semibold flex items-center space-x-1.5 transition-all"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={handleRestart}
              className="p-1.5 rounded-full bg-[#1C1C1C] hover:bg-[#282828] text-[#8A8A8A] hover:text-[#FFFFFF] transition-all"
              title="Restart Demo"
            >
              <RotateCcw size={14} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#1C1C1C] hover:bg-[#282828] text-[#8A8A8A] hover:text-[#FFFFFF] transition-all"
              title="Exit Demo"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scene Info */}
        <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#FFFFFF]">
              {currentInfo.title}
            </span>
            <span className="text-[10px] font-mono text-[#666666]">
              {currentStep + 1} / {DEMO_STEPS.length}
            </span>
          </div>
          <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
            {currentInfo.desc}
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="flex items-center space-x-1 pt-1">
          {DEMO_STEPS.map((s, idx) => (
            <div
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                if (DEMO_STEPS[idx].action) DEMO_STEPS[idx].action();
                if (onRunAction) onRunAction(DEMO_STEPS[idx]);
              }}
              className="flex-1 h-1.5 bg-[#222222] rounded-full overflow-hidden cursor-pointer"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx <= currentStep ? 'bg-[#FFFFFF]' : 'bg-transparent'
                }`}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
