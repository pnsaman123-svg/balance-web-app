import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import PhoneHeader from './components/PhoneHeader';
import BottomNavigation from './components/BottomNavigation';
import HomeScreen from './screens/HomeScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import BudgetScreen from './screens/BudgetScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import SettingsScreen from './screens/SettingsScreen';
import OnboardingFlow from './screens/OnboardingFlow';
import AddIncomeModal from './components/AddIncomeModal';
import CategoryDetailView from './components/CategoryDetailView';
import SubcategoryDetailView from './components/SubcategoryDetailView';
import EditTransactionModal from './components/EditTransactionModal';
import CinematicDemoPlayer from './components/CinematicDemoPlayer';
import {
  Smartphone,
  Monitor,
  Columns,
  LayoutDashboard,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Layers,
  Sparkles,
  Play
} from 'lucide-react';

function AppContent() {
  const {
    userName,
    selectedMonth,
    currency,
    formatCurrency,
    totalIncome,
    totalAllocated,
    totalSpent,
    totalBalance,
    needs,
    wants,
    savings,
    transactions,
    isOnboarded,
  } = useFinance();

  // Navigation State
  const [currentTab, setCurrentTab] = useState('home');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [prefilledExpenseAmount, setPrefilledExpenseAmount] = useState('');
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  
  // Drilldown states
  const [selectedDetailCatId, setSelectedDetailCatId] = useState(null);
  const [selectedSubDetail, setSelectedSubDetail] = useState(null); // { catId, subId }
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Cinematic Demo State & Camera Transform
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [cameraTransform, setCameraTransform] = useState({ zoom: 1.0, rotateX: 0, rotateY: 0 });

  // View Mode: 'mobile' | 'desktop' | 'trio'
  const [viewMode, setViewMode] = useState('mobile');

  const handleNavigateTab = (tabId) => {
    setIsAddExpenseOpen(false);
    setPrefilledExpenseAmount('');
    setSelectedDetailCatId(null);
    setSelectedSubDetail(null);
    setCurrentTab(tabId);
  };

  const handleDemoAction = (stepObj) => {
    setCurrentTab(stepObj.tab);
    setIsAddExpenseOpen(stepObj.isExpense);
    setSelectedDetailCatId(null);
    setSelectedSubDetail(null);
    setCameraTransform({
      zoom: stepObj.zoom || 1.0,
      rotateX: stepObj.rotateX || 0,
      rotateY: stepObj.rotateY || 0,
    });
  };

  const renderActiveScreen = () => {
    // If user is not onboarded, show full first-time setup flow
    if (!isOnboarded) {
      return <OnboardingFlow onFinish={() => handleNavigateTab('home')} />;
    }

    if (selectedSubDetail) {
      return (
        <SubcategoryDetailView
          categoryId={selectedSubDetail.catId}
          subcategoryId={selectedSubDetail.subId}
          onClose={() => setSelectedSubDetail(null)}
          onOpenAddExpense={(amt) => {
            setPrefilledExpenseAmount(amt || '');
            setIsAddExpenseOpen(true);
          }}
          onEditTransaction={(tx) => setEditingTransaction(tx)}
        />
      );
    }

    if (selectedDetailCatId) {
      return (
        <CategoryDetailView
          categoryId={selectedDetailCatId}
          onClose={() => setSelectedDetailCatId(null)}
          onOpenAddExpense={(amt) => {
            setPrefilledExpenseAmount(amt || '');
            setIsAddExpenseOpen(true);
          }}
        />
      );
    }

    if (isAddExpenseOpen) {
      return (
        <AddExpenseScreen
          initialAmount={prefilledExpenseAmount}
          onClose={() => {
            setIsAddExpenseOpen(false);
            setPrefilledExpenseAmount('');
          }}
          onNavigateTab={handleNavigateTab}
        />
      );
    }

    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            onOpenAddExpense={(amt) => {
              setPrefilledExpenseAmount(amt || '');
              setIsAddExpenseOpen(true);
            }}
            onOpenAddIncome={() => setIsAddIncomeOpen(true)}
            onNavigateTab={handleNavigateTab}
            onSelectCategoryDetail={(catId) => setSelectedDetailCatId(catId)}
          />
        );
      case 'transactions':
        return (
          <TransactionsScreen
            onBack={() => setCurrentTab('home')}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onEditTransaction={(tx) => setEditingTransaction(tx)}
          />
        );
      case 'budget':
        return (
          <BudgetScreen
            onBack={() => setCurrentTab('home')}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          />
        );
      case 'analytics':
        return (
          <AnalyticsScreen onBack={() => setCurrentTab('home')} />
        );
      case 'settings':
        return (
          <SettingsScreen
            onBack={() => setCurrentTab('home')}
            onStartOnboarding={() => {}}
          />
        );
      default:
        return (
          <HomeScreen
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenAddIncome={() => setIsAddIncomeOpen(true)}
            onNavigateTab={handleNavigateTab}
            onSelectCategoryDetail={(catId) => setSelectedDetailCatId(catId)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#FFFFFF] flex flex-col items-center justify-start antialiased selection:bg-[#FFFFFF] selection:text-[#000000] overflow-x-hidden font-sans">
      {/* Top Floating Control Bar */}
      <header className="w-full max-w-7xl px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-[#0A0A0A] text-[#FFFFFF] flex items-center justify-center font-black text-sm shadow-md">
            B
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-[#0A0A0A] block">
              Balance
            </span>
            <span className="text-[10px] text-[#666666] uppercase font-mono font-semibold tracking-wider">
              Needs · Wants · Savings
            </span>
          </div>
        </div>

        {/* View mode & Cinematic Demo trigger */}
        <div className="flex items-center space-x-2">
          {/* Cinematic Demo Button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsDemoOpen(true)}
            className="flex items-center space-x-1.5 bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#FFFFFF] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg active:scale-95"
          >
            <Play size={12} fill="#FFFFFF" />
            <span>Play Demo</span>
          </motion.button>

          {/* View mode segment buttons */}
          <div className="flex items-center space-x-1 bg-[#E2E2E2] p-1 rounded-full shadow-inner">
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'mobile'
                  ? 'bg-[#0A0A0A] text-[#FFFFFF] shadow-sm'
                  : 'text-[#666666] hover:text-[#0A0A0A]'
              }`}
            >
              <Smartphone size={13} />
              <span className="hidden sm:inline">Phone</span>
            </button>

            <button
              onClick={() => setViewMode('trio')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'trio'
                  ? 'bg-[#0A0A0A] text-[#FFFFFF] shadow-sm'
                  : 'text-[#666666] hover:text-[#0A0A0A]'
              }`}
            >
              <Columns size={13} />
              <span className="hidden sm:inline">3-Screen</span>
            </button>

            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'desktop'
                  ? 'bg-[#0A0A0A] text-[#FFFFFF] shadow-sm'
                  : 'text-[#666666] hover:text-[#0A0A0A]'
              }`}
            >
              <Monitor size={13} />
              <span className="hidden sm:inline">Desktop</span>
            </button>
          </div>
        </div>
      </header>

      {/* VIEW MODE 1: SINGLE MOBILE PHONE FRAME */}
      {viewMode === 'mobile' && (
        <main className="flex-1 w-full flex items-center justify-center p-0 sm:p-6 md:p-8 perspective-1000">
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 15 }}
            animate={{
              scale: cameraTransform.zoom,
              opacity: 1,
              y: 0,
              rotateX: cameraTransform.rotateX,
              rotateY: cameraTransform.rotateY,
            }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 18,
              mass: 0.8,
            }}
            className="relative w-full sm:max-w-[395px] h-[100dvh] sm:h-[835px] bg-[#0A0A0A] rounded-none sm:rounded-[50px] p-0 sm:p-2.5 shadow-none sm:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35),0_0_0_8px_#1E1E1E,0_0_0_10px_#111111] border-0 sm:border-[4px] border-[#2A2A2A] flex flex-col overflow-hidden transform-gpu"
          >
            {/* Phone Screen Container */}
            <div className="relative w-full h-full bg-[#0A0A0A] rounded-none sm:rounded-[42px] flex flex-col overflow-hidden">
              {/* Phone Header (Hidden during onboarding for clean setup) */}
              {isOnboarded && (
                <PhoneHeader
                  onProfileClick={() => setCurrentTab('settings')}
                  onNotificationClick={() => setCurrentTab('transactions')}
                />
              )}

              {/* Scrollable Screen Content with Smooth Page Routing */}
              <div className="flex-1 overflow-y-auto no-scrollbar relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={
                      !isOnboarded
                        ? 'onboarding'
                        : selectedSubDetail
                        ? `sub-${selectedSubDetail.subId}`
                        : selectedDetailCatId
                        ? 'detail'
                        : isAddExpenseOpen
                        ? 'expense'
                        : currentTab
                    }
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="min-h-full"
                  >
                    {renderActiveScreen()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Floating Bottom Navigation */}
              {isOnboarded && !isAddExpenseOpen && !selectedDetailCatId && !selectedSubDetail && (
                <BottomNavigation
                  currentTab={currentTab}
                  setTab={handleNavigateTab}
                  onQuickAddClick={() => setIsAddExpenseOpen(true)}
                />
              )}
            </div>
          </motion.div>
        </main>
      )}

      {/* VIEW MODE 2: 3-SCREEN REFERENCE SHOWCASE */}
      {viewMode === 'trio' && (
        <main className="flex-1 w-full max-w-7xl p-4 sm:p-8 flex flex-col items-center">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-[#0A0A0A] tracking-tight">
              3-Screen Monochrome Architecture
            </h2>
            <p className="text-xs text-[#666666] mt-1">
              Inspired directly by the reference composition: Dashboard · Numeric Keypad · Spending Analytics
            </p>
          </div>

          <div className="w-full flex flex-row items-center justify-center gap-6 overflow-x-auto pb-6">
            {/* Phone 1 */}
            <div className="w-[360px] h-[760px] bg-[#0A0A0A] rounded-[44px] p-2 shadow-2xl border-[3px] border-[#242424] flex flex-col shrink-0 overflow-hidden">
              <PhoneHeader isInsidePhone={true} onProfileClick={() => {}} onNotificationClick={() => {}} />
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <HomeScreen
                  onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                  onOpenAddIncome={() => setIsAddIncomeOpen(true)}
                  onNavigateTab={handleNavigateTab}
                />
              </div>
              <BottomNavigation currentTab="home" setTab={handleNavigateTab} onQuickAddClick={() => {}} />
            </div>

            {/* Phone 2 */}
            <div className="w-[360px] h-[760px] bg-[#0A0A0A] rounded-[44px] p-2 shadow-2xl border-[3px] border-[#242424] flex flex-col shrink-0 overflow-hidden">
              <div className="w-full pt-2 px-6 flex justify-between items-center text-xs text-[#8A8A8A]">
                <span>16:40</span>
                <div className="w-20 h-4 bg-black rounded-full border border-[#222]"></div>
                <span>100%</span>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <AddExpenseScreen onClose={() => {}} onNavigateTab={handleNavigateTab} />
              </div>
            </div>

            {/* Phone 3 */}
            <div className="w-[360px] h-[760px] bg-[#0A0A0A] rounded-[44px] p-2 shadow-2xl border-[3px] border-[#242424] flex flex-col shrink-0 overflow-hidden">
              <div className="w-full pt-2 px-6 flex justify-between items-center text-xs text-[#8A8A8A]">
                <span>16:40</span>
                <div className="w-20 h-4 bg-black rounded-full border border-[#222]"></div>
                <span>100%</span>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <AnalyticsScreen onBack={() => {}} />
              </div>
              <BottomNavigation currentTab="analytics" setTab={handleNavigateTab} onQuickAddClick={() => {}} />
            </div>
          </div>
        </main>
      )}

      {/* VIEW MODE 3: EXPANDED DESKTOP DASHBOARD MODE */}
      {viewMode === 'desktop' && (
        <main className="flex-1 w-full max-w-7xl px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3 bg-[#0A0A0A] border border-[#222222] rounded-3xl p-6 h-fit space-y-6 shadow-xl">
            <div className="space-y-1">
              <span className="text-xs text-[#8A8A8A] block">Welcome back</span>
              <h2 className="text-lg font-bold text-[#FFFFFF]">{userName}</h2>
              <span className="text-[10px] text-[#666666] font-mono block">{selectedMonth}</span>
            </div>

            <nav className="space-y-1.5">
              {[
                { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'transactions', label: 'Transactions', icon: Receipt },
                { id: 'budget', label: 'Budget Planner', icon: Wallet },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id && !isAddExpenseOpen;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigateTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#FFFFFF] text-[#0A0A0A] shadow-md'
                        : 'text-[#8A8A8A] hover:bg-[#1A1A1A] hover:text-[#FFFFFF]'
                    }`}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#222222] space-y-2">
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="w-full py-3 bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#0A0A0A] font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95"
              >
                <Plus size={15} strokeWidth={3} />
                <span>+ Add Expense</span>
              </button>

              <button
                onClick={() => setIsAddIncomeOpen(true)}
                className="w-full py-3 bg-[#1C1C1C] hover:bg-[#292929] border border-[#292929] text-[#FFFFFF] font-semibold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all"
              >
                <ArrowUpRight size={15} />
                <span>Record Income</span>
              </button>
            </div>
          </aside>

          {/* Central Main Content Area */}
          <section className="lg:col-span-6 bg-[#0A0A0A] border border-[#1F1F1F] rounded-3xl p-6 overflow-y-auto max-h-[850px] no-scrollbar shadow-2xl">
            {renderActiveScreen()}
          </section>

          {/* Right Summary Panel */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-[#0A0A0A] border border-[#222222] rounded-3xl p-5 space-y-3 shadow-xl">
              <span className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider">
                Financial Summary
              </span>
              <div>
                <span className="text-xs text-[#666666] block">Net Available</span>
                <span className="text-2xl font-black text-[#FFFFFF] font-mono">
                  {formatCurrency(totalBalance)}
                </span>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between text-[#8A8A8A]">
                  <span>Total Income</span>
                  <span className="text-[#FFFFFF] font-mono">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex justify-between text-[#8A8A8A]">
                  <span>Total Spent</span>
                  <span className="text-[#FFFFFF] font-mono">{formatCurrency(totalSpent)}</span>
                </div>
                <div className="flex justify-between text-[#8A8A8A]">
                  <span>Allocated</span>
                  <span className="text-[#FFFFFF] font-mono">{formatCurrency(totalAllocated)}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-[#222222] rounded-3xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
                50 / 30 / 20 Rule Status
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#FFFFFF] font-medium">Needs (50%)</span>
                    <span className="font-mono text-[#D6D6D6]">{formatCurrency(needs.spent)} / {formatCurrency(needs.budget)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFFFFF]" style={{ width: `${needs.percentSpent}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#FFFFFF] font-medium">Wants (30%)</span>
                    <span className="font-mono text-[#D6D6D6]">{formatCurrency(wants.spent)} / {formatCurrency(wants.budget)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                    <div className="h-full bg-[#8A8A8A]" style={{ width: `${wants.percentSpent}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#FFFFFF] font-medium">Savings (20%)</span>
                    <span className="font-mono text-[#D6D6D6]">{formatCurrency(savings.spent)} / {formatCurrency(savings.budget)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                    <div className="h-full bg-[#444444]" style={{ width: `${savings.percentSpent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </main>
      )}

      {/* Cinematic Demo Guided Player */}
      <CinematicDemoPlayer
        isOpen={isDemoOpen}
        onClose={() => {
          setIsDemoOpen(false);
          setCameraTransform({ zoom: 1.0, rotateX: 0, rotateY: 0 });
        }}
        onRunAction={handleDemoAction}
      />

      {/* Add Income Global Modal */}
      <AddIncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
