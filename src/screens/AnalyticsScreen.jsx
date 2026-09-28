import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, ChevronRight, TrendingUp, Info } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import CategoryIcon from '../components/CategoryIcon';

export default function AnalyticsScreen({ onBack }) {
  const {
    formatCurrency,
    historicalMonthlyData,
    totalSpent,
    totalAllocated,
    totalBalance,
    needs,
    wants,
    savings,
    selectedMonth,
  } = useFinance();

  const [timeframe, setTimeframe] = useState('M');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(8);

  const activeMonthData = historicalMonthlyData[selectedMonthIndex] || historicalMonthlyData[historicalMonthlyData.length - 1];
  const maxChartValue = 50000;

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

          <span className="text-base font-bold text-[#FFFFFF]">Analytics</span>

          <div className="w-10" />
        </div>

        {/* Charcoal Summary Card */}
        <div className="bg-[#141414] border border-[#242424] rounded-3xl p-5 shadow-xl space-y-2">
          <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider block">
            Spending Overview · {selectedMonth}
          </span>
          <span className="text-3xl font-black text-[#FFFFFF] font-mono block">
            {formatCurrency(totalSpent)}
          </span>
          <span className="text-xs text-[#8A8A8A]">
            Out of {formatCurrency(totalAllocated)} monthly allocated budget
          </span>
        </div>

        {/* Segmented Pill Control (W | M | Y) */}
        <div className="flex justify-center pt-1">
          <div className="inline-flex bg-[#141414] border border-[#242424] p-1 rounded-full space-x-1">
            {['W', 'M', 'Y'].map((item) => {
              const isActive = timeframe === item;
              return (
                <button
                  key={item}
                  onClick={() => setTimeframe(item)}
                  className={`w-10 h-7 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FFFFFF] text-[#090909] shadow-sm'
                      : 'text-[#8A8A8A] hover:text-[#FFFFFF]'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating White Rounded Overlapping Content Sheet */}
      <div className="bg-[#FFFFFF] text-[#090909] rounded-t-[32px] px-6 pt-3 pb-32 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] space-y-6">
        <div className="w-9 h-1 rounded-full bg-[#D6D6D6] mx-auto mb-2" />

        <h2 className="text-base font-bold text-[#090909]">Spending Trends</h2>

        {/* Clean Monochrome Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-1.5 px-1 border-b border-[#F2F2F2] pb-3">
          {historicalMonthlyData.map((item, idx) => {
            const isSelected = selectedMonthIndex === idx;
            const currentSpentVal = item.current ? totalSpent : item.spent;
            const spentHeight = Math.min(100, Math.round((currentSpentVal / maxChartValue) * 100));

            return (
              <div
                key={item.month}
                onClick={() => setSelectedMonthIndex(idx)}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
              >
                <div className="relative w-full flex items-end justify-center h-full">
                  <div className="w-2 h-full bg-[#F2F2F2] rounded-full absolute" />
                  <div
                    className={`relative w-2 rounded-full transition-all duration-300 z-10 ${
                      isSelected ? 'bg-[#090909] w-2.5' : 'bg-[#8A8A8A] hover:bg-[#090909]'
                    }`}
                    style={{ height: `${spentHeight}%` }}
                  />
                </div>

                <span
                  className={`text-[9.5px] mt-2 font-mono transition-colors ${
                    isSelected ? 'font-bold text-[#090909]' : 'text-[#8A8A8A]'
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pillar Breakdown */}
        <div className="space-y-4 pt-1">
          <h3 className="text-xs font-bold text-[#090909] uppercase tracking-wider">Pillar Breakdown</h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#090909]">Needs</span>
                <span className="text-[#666666] font-mono">{formatCurrency(needs.spent)} ({needs.percentSpent}%)</span>
              </div>
              <div className="w-full h-2 bg-[#F2F2F2] rounded-full overflow-hidden">
                <div style={{ width: `${needs.percentSpent}%` }} className="h-full bg-[#090909] rounded-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#090909]">Wants</span>
                <span className="text-[#666666] font-mono">{formatCurrency(wants.spent)} ({wants.percentSpent}%)</span>
              </div>
              <div className="w-full h-2 bg-[#F2F2F2] rounded-full overflow-hidden">
                <div style={{ width: `${wants.percentSpent}%` }} className="h-full bg-[#666666] rounded-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#090909]">Savings</span>
                <span className="text-[#666666] font-mono">{formatCurrency(savings.spent)} ({savings.percentSpent}%)</span>
              </div>
              <div className="w-full h-2 bg-[#F2F2F2] rounded-full overflow-hidden">
                <div style={{ width: `${savings.percentSpent}%` }} className="h-full bg-[#8A8A8A] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
