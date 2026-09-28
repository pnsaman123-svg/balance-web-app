import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Download, Trash2, Check, Plus, Edit2, Sparkles, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import AdjustAllocationModal from '../components/AdjustAllocationModal';

export default function SettingsScreen({ onBack, onStartOnboarding }) {
  const {
    userName,
    currency,
    updateCurrency,
    resetToDefault,
    restartOnboarding,
    totalIncome,
    incomeSources,
    addIncomeSource,
    deleteIncomeSource,
    transactions,
    categories,
    formatCurrency,
    selectedMonth,
  } = useFinance();

  const [isResetConfirm, setIsResetConfirm] = useState(false);
  const [isAdjustAllocationOpen, setIsAdjustAllocationOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceAmount, setNewSourceAmount] = useState('');

  const currencies = [
    { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
    { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
    { code: 'EUR', symbol: '€', label: 'Euro (€)' },
    { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  ];

  const handleExportData = () => {
    const exportObj = {
      userName,
      currency,
      totalIncome,
      incomeSources,
      categories,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `balance-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAddSource = (e) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceAmount) return;
    addIncomeSource(newSourceName.trim(), newSourceAmount);
    setNewSourceName('');
    setNewSourceAmount('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090909] text-[#FFFFFF]">
      {/* Dark Upper Dashboard Section */}
      <div className="px-5 pt-3 pb-8 space-y-4 bg-[#090909]">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-[#FFFFFF] hover:bg-[#252525] transition-all"
          >
            <ArrowLeft size={18} />
          </button>

          <span className="text-base font-bold text-[#FFFFFF]">Settings & Setup</span>

          <div className="w-10" />
        </div>

        {/* Profile Card */}
        <div className="bg-[#141414] border border-[#242424] rounded-3xl p-5 shadow-xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-lg font-bold text-[#FFFFFF]">
            {userName ? userName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#FFFFFF]">{userName}</span>
            <span className="text-xs text-[#8A8A8A]">Balance Personal Money Manager · Monochrome</span>
          </div>
        </div>
      </div>

        {/* Configuration Charcoal Card */}
        <div className="bg-[#141414] border border-[#242424] rounded-3xl p-5 shadow-xl space-y-4">
          <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider block">
            Configuration
          </span>

          <div className="space-y-3">
            {/* Adjust 50/30/20 Allocation */}
            <button
              onClick={() => setIsAdjustAllocationOpen(true)}
              className="w-full flex items-center justify-between p-4 bg-[#1C1C1C] border border-[#282828] rounded-2xl text-left hover:border-[#383838] transition-all"
            >
              <div>
                <span className="text-xs font-bold text-[#FFFFFF] block">Adjust 50/30/20 Allocation %</span>
                <span className="text-[11px] text-[#8A8A8A]">
                  Needs {categories.find((c) => c.id === 'needs')?.targetPercent || 50}% · Wants {categories.find((c) => c.id === 'wants')?.targetPercent || 30}% · Savings {categories.find((c) => c.id === 'savings')?.targetPercent || 20}%
                </span>
              </div>
              <ChevronRight size={16} color="#8A8A8A" />
            </button>

            {/* Launch Setup Wizard */}
            <button
              onClick={() => {
                restartOnboarding();
                if (onStartOnboarding) onStartOnboarding();
              }}
              className="w-full flex items-center justify-between p-4 bg-[#1C1C1C] border border-[#282828] rounded-2xl text-left hover:border-[#383838] transition-all"
            >
              <div>
                <span className="text-xs font-bold text-[#FFFFFF] block">Launch First-Time Setup Wizard</span>
                <span className="text-[11px] text-[#8A8A8A]">Reconfigure monthly income and base categories</span>
              </div>
              <ChevronRight size={16} color="#8A8A8A" />
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 bg-[#1C1C1C] border border-[#282828] rounded-2xl text-left hover:border-[#383838] transition-all"
            >
              <div>
                <span className="text-xs font-bold text-[#FFFFFF] block">Export Full Ledger JSON</span>
                <span className="text-[11px] text-[#8A8A8A]">{transactions.length} total entries</span>
              </div>
              <Download size={16} color="#8A8A8A" />
            </button>

            {/* Currency Selection */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-[#FFFFFF] block">Currency</span>
              <div className="grid grid-cols-2 gap-2">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => updateCurrency(c.symbol)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold ${
                      currency === c.symbol
                        ? 'bg-[#FFFFFF] text-[#090909] border-[#FFFFFF]'
                        : 'bg-[#1C1C1C] text-[#FFFFFF] border-[#282828] hover:border-[#383838]'
                    }`}
                  >
                    <span>{c.label}</span>
                    {currency === c.symbol && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Template */}
            <div className="pt-1">
              {isResetConfirm ? (
                <div className="p-4 bg-[#1C1C1C] border border-[#282828] rounded-2xl space-y-3">
                  <span className="text-xs text-[#FFFFFF] font-bold block">Reset to initial reference template?</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        resetToDefault();
                        setIsResetConfirm(false);
                      }}
                      className="flex-1 py-2 bg-[#FFFFFF] text-[#090909] font-bold text-xs rounded-xl"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setIsResetConfirm(false)}
                      className="flex-1 py-2 bg-[#242424] text-[#FFFFFF] font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsResetConfirm(true)}
                  className="w-full flex items-center justify-between p-4 bg-[#1C1C1C] border border-[#282828] rounded-2xl text-left hover:border-[#383838] transition-all"
                >
                  <div>
                    <span className="text-xs font-bold text-[#FFFFFF] block">Reset to Reference Template Data</span>
                    <span className="text-[11px] text-[#8A8A8A]">Restore default template data</span>
                  </div>
                  <RefreshCw size={15} color="#8A8A8A" />
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Adjust Allocation Modal */}
      <AdjustAllocationModal
        isOpen={isAdjustAllocationOpen}
        onClose={() => setIsAdjustAllocationOpen(false)}
      />
    </div>
  );
}
