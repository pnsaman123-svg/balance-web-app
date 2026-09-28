import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const FinanceContext = createContext();

const STORAGE_KEY = 'BALANCE_MONEY_MANAGER_V4_ZERO';

const DEFAULT_CATEGORIES_TEMPLATE = [
  {
    id: 'needs',
    name: 'Needs',
    targetPercent: 50,
    budget: 0,
    subcategories: [
      { id: 'sub-rent', name: 'Rent', budget: 0, icon: 'House' },
      { id: 'sub-groceries', name: 'Groceries', budget: 0, icon: 'ShoppingBasket' },
      { id: 'sub-utilities', name: 'Utilities', budget: 0, icon: 'Zap' },
      { id: 'sub-transport', name: 'Transportation', budget: 0, icon: 'Car' },
      { id: 'sub-medical', name: 'Medical', budget: 0, icon: 'Activity' },
    ],
  },
  {
    id: 'wants',
    name: 'Wants',
    targetPercent: 30,
    budget: 0,
    subcategories: [
      { id: 'sub-dining', name: 'Dining Out', budget: 0, icon: 'UtensilsCrossed' },
      { id: 'sub-shopping', name: 'Shopping', budget: 0, icon: 'ShoppingBag' },
      { id: 'sub-subscriptions', name: 'Subscriptions', budget: 0, icon: 'Repeat' },
      { id: 'sub-leisure', name: 'Leisure', budget: 0, icon: 'Gamepad2' },
    ],
  },
  {
    id: 'savings',
    name: 'Savings',
    targetPercent: 20,
    budget: 0,
    subcategories: [
      { id: 'sub-emergency', name: 'Emergency Fund', budget: 0, icon: 'ShieldCheck' },
      { id: 'sub-investments', name: 'Investments', budget: 0, icon: 'TrendingUp' },
      { id: 'sub-debt', name: 'Debt Repayment', budget: 0, icon: 'ArrowDownRight' },
    ],
  },
];

const INITIAL_MONTH_DATA = {
  isOnboarded: false,
  userName: 'User',
  currency: '₹',
  selectedMonthId: '2026-09',
  months: {
    '2026-09': {
      monthId: '2026-09',
      monthName: 'September 2026',
      incomeSources: [],
      categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES_TEMPLATE)),
      transactions: [],
    },
  },
};

export function FinanceProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load persisted data:', e);
    }
    return INITIAL_MONTH_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist data:', e);
    }
  }, [state]);

  // Current selected month object
  const currentMonth = useMemo(() => {
    const mId = state.selectedMonthId || '2026-09';
    if (!state.months[mId]) {
      // Create month if not exists
      const newMonth = {
        monthId: mId,
        monthName: mId,
        incomeSources: [{ id: 'inc-1', name: 'Salary', amount: 50000 }],
        categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES_TEMPLATE)),
        transactions: [],
      };
      return newMonth;
    }
    return state.months[mId];
  }, [state.selectedMonthId, state.months]);

  // Centralized Financial Calculations
  const calculations = useMemo(() => {
    const incomeSources = currentMonth.incomeSources || [];
    const totalIncome = incomeSources.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    const categories = currentMonth.categories || DEFAULT_CATEGORIES_TEMPLATE;
    const transactions = currentMonth.transactions || [];

    // Compute spent by subcategory
    const subcategorySpent = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        subcategorySpent[tx.subcategoryId] = (subcategorySpent[tx.subcategoryId] || 0) + (Number(tx.amount) || 0);
      }
    });

    const categoryStats = categories.map((cat) => {
      const isSavings = cat.id === 'savings';
      
      const subcategoriesWithSpent = cat.subcategories.map((sub) => {
        const spent = subcategorySpent[sub.id] || 0;
        const budget = Number(sub.budget) || 0;
        const remaining = Math.max(0, budget - spent);
        const percentSpent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
        const actualPercentSpent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
        const isTargetReached = isSavings && spent >= budget;
        const isOverBudget = !isSavings && budget > 0 && spent > budget;
        const overAmount = isOverBudget ? spent - budget : 0;

        return {
          ...sub,
          spent,
          remaining,
          percentSpent,
          actualPercentSpent,
          isTargetReached,
          isOverBudget,
          overAmount,
          parentCategoryId: cat.id,
          parentCategoryName: cat.name,
        };
      });

      const totalCatSpent = subcategoriesWithSpent.reduce((sum, s) => sum + s.spent, 0);
      const catBudget = Number(cat.budget) || 0;
      const subcategoriesAllocated = subcategoriesWithSpent.reduce((sum, s) => sum + (Number(s.budget) || 0), 0);
      const catUnallocated = Math.max(0, catBudget - subcategoriesAllocated);
      const catRemaining = Math.max(0, catBudget - totalCatSpent);
      const percentSpent = catBudget > 0 ? Math.min(100, Math.round((totalCatSpent / catBudget) * 100)) : 0;
      const actualCatPercentSpent = catBudget > 0 ? Math.round((totalCatSpent / catBudget) * 100) : 0;
      const percentRemaining = Math.max(0, 100 - percentSpent);
      const isCatOverBudget = !isSavings && catBudget > 0 && totalCatSpent > catBudget;
      const catOverAmount = isCatOverBudget ? totalCatSpent - catBudget : 0;

      return {
        ...cat,
        spent: totalCatSpent,
        remaining: catRemaining,
        subcategoriesAllocated,
        unallocated: catUnallocated,
        percentSpent,
        actualPercentSpent: actualCatPercentSpent,
        percentRemaining,
        isCatOverBudget,
        catOverAmount,
        subcategories: subcategoriesWithSpent,
      };
    });

    const totalAllocated = categoryStats.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
    const totalSpent = categoryStats.reduce((sum, c) => sum + c.spent, 0);
    const totalBalance = totalIncome - totalSpent;
    const totalRemainingBudget = Math.max(0, totalAllocated - totalSpent);
    const unallocatedIncome = Math.max(0, totalIncome - totalAllocated);
    const overAllocatedAmount = Math.max(0, totalAllocated - totalIncome);
    const isOverAllocated = totalAllocated > totalIncome;

    const overallPercentSpent = totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0;
    const overallPercentRemaining = Math.max(0, 100 - overallPercentSpent);

    // Collect all subcategories that exceeded their budget
    const overBudgetSubcategories = [];
    categoryStats.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        if (sub.isOverBudget) {
          overBudgetSubcategories.push(sub);
        }
      });
    });

    const needs = categoryStats.find((c) => c.id === 'needs') || { budget: 25000, spent: 0, remaining: 25000, subcategories: [] };
    const wants = categoryStats.find((c) => c.id === 'wants') || { budget: 15000, spent: 0, remaining: 15000, subcategories: [] };
    const savings = categoryStats.find((c) => c.id === 'savings') || { budget: 10000, spent: 0, remaining: 10000, subcategories: [] };

    return {
      totalIncome,
      totalAllocated,
      totalSpent,
      totalBalance,
      totalRemainingBudget,
      unallocatedIncome,
      overAllocatedAmount,
      isOverAllocated,
      overallPercentSpent,
      overallPercentRemaining,
      categoryStats,
      needs,
      wants,
      savings,
      overBudgetSubcategories,
    };
  }, [currentMonth]);

  // Format currency in Indian locale (e.g. ₹50,000, ₹1,25,000)
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `${state.currency}${num.toLocaleString('en-IN')}`;
  };

  // Month Switcher Action
  const switchMonth = (monthId, monthName) => {
    setState((prev) => {
      const existing = prev.months[monthId];
      if (!existing) {
        return {
          ...prev,
          selectedMonthId: monthId,
          months: {
            ...prev.months,
            [monthId]: {
              monthId,
              monthName: monthName || monthId,
              incomeSources: [{ id: `inc-${Date.now()}`, name: 'Salary', amount: 50000 }],
              categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES_TEMPLATE)),
              transactions: [],
            },
          },
        };
      }
      return {
        ...prev,
        selectedMonthId: monthId,
      };
    });
  };

  // Transaction CRUD Actions
  const addTransaction = (txData) => {
    const mId = state.selectedMonthId;
    const newTx = {
      id: `tx-${Date.now()}`,
      monthId: mId,
      timestamp: Date.now(),
      date: txData.date || 'Today · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...txData,
      amount: Number(txData.amount) || 0,
    };

    setState((prev) => {
      const monthObj = prev.months[mId] || { transactions: [] };
      return {
        ...prev,
        months: {
          ...prev.months,
          [mId]: {
            ...monthObj,
            transactions: [newTx, ...(monthObj.transactions || [])],
          },
        },
      };
    });
  };

  const updateTransaction = (txId, updatedFields) => {
    const mId = state.selectedMonthId;
    setState((prev) => {
      const monthObj = prev.months[mId];
      if (!monthObj) return prev;

      return {
        ...prev,
        months: {
          ...prev.months,
          [mId]: {
            ...monthObj,
            transactions: monthObj.transactions.map((tx) =>
              tx.id === txId ? { ...tx, ...updatedFields, amount: Number(updatedFields.amount) || tx.amount } : tx
            ),
          },
        },
      };
    });
  };

  const deleteTransaction = (txId) => {
    const mId = state.selectedMonthId;
    setState((prev) => {
      const monthObj = prev.months[mId];
      if (!monthObj) return prev;

      return {
        ...prev,
        months: {
          ...prev.months,
          [mId]: {
            ...monthObj,
            transactions: monthObj.transactions.filter((tx) => tx.id !== txId),
          },
        },
      };
    });
  };

  // Income Sources Actions
  const addIncomeSource = (name, amount) => {
    const mId = state.selectedMonthId;
    const newSource = {
      id: `inc-${Date.now()}`,
      name: name.trim() || 'Other Income',
      amount: Number(amount) || 0,
    };

    setState((prev) => {
      const monthObj = prev.months[mId];
      return {
        ...prev,
        months: {
          ...prev.months,
          [mId]: {
            ...monthObj,
            incomeSources: [...(monthObj.incomeSources || []), newSource],
          },
        },
      };
    });
  };

  const updateIncomeSource = (sourceId, name, amount) => {
    const mId = state.selectedMonthId;
    setState((prev) => {
      const monthObj = prev.months[mId];
      return {
        ...prev,
        months: {
          ...prev.months,
          [mId]: {
            ...monthObj,
            incomeSources: monthObj.incomeSources.map((s) =>
              s.id === sourceId ? { ...s, name: name.trim(), amount: Number(amount) || 0 } : s
            ),
          },
        },
      };
    });
  };

  const deleteIncomeSource = (sourceId) => {
    const mId = state.selectedMonthId;
    setState((prev) => {
      const monthObj = prev.months[mId];
      return {
        ...prev,
        months: {
          ...prev.months,
          [mId]: {
            ...monthObj,
            incomeSources: monthObj.incomeSources.filter((s) => s.id !== sourceId),
          },
        },
      };
    });
  };

  // Allocation & Category Budget Actions
  const updateCategoryAllocations = (allocations) => {
    const mId = state.selectedMonthId;
    setState((prev) => {
      const monthObj = prev.months[mId];
      const updatedCategories = monthObj.categories.map((cat) => {
        if (allocations[cat.id] !== undefined) {
          return {
            ...cat,
            budget: Number(allocations[cat.id]) || 0,
          };
        }
        return cat;
      });

      return {
        ...prev,
        months: {
          ...prev.months,
          [mId]: {
            ...monthObj,
            categories: updatedCategories,
          },
        },
      };
    });
  };

  const updateCategoryPercentages = (percentages) => {
    const mId = state.selectedMonthId;
    setState((prev) => {
      const monthObj = prev.months[mId];
      if (!monthObj) return prev;

      const totalIncome = (monthObj.incomeSources || []).reduce(
        (sum, s) => sum + (Number(s.amount) || 0),
        0
      );

      const newNeedsBudget = Math.round((totalIncome * (percentages.needs || 50)) / 100);
      const newWantsBudget = Math.round((totalIncome * (percentages.wants || 30)) / 100);
      const newSavingsBudget = Math.round((totalIncome * (percentages.savings || 20)) / 100);

      const updatedCategories = monthObj.categories.map((cat) => {
        if (cat.id === 'needs') {
          const oldBudget = cat.budget || 1;
          const ratio = newNeedsBudget / oldBudget;
          return {
            ...cat,
            targetPercent: percentages.needs,
            budget: newNeedsBudget,
            subcategories: cat.subcategories.map((s) => ({
              ...s,
              budget: Math.round(s.budget * ratio),
            })),
          };
        }
        if (cat.id === 'wants') {
          const oldBudget = cat.budget || 1;
          const ratio = newWantsBudget / oldBudget;
          return {
            ...cat,
            targetPercent: percentages.wants,
            budget: newWantsBudget,
            subcategories: cat.subcategories.map((s) => ({
              ...s,
              budget: Math.round(s.budget * ratio),
            })),
          };
        }
        if (cat.id === 'savings') {
          const oldBudget = cat.budget || 1;
          const ratio = newSavingsBudget / oldBudget;
          return {
            ...cat,
            targetPercent: percentages.savings,
            budget: newSavingsBudget,
            subcategories: cat.subcategories.map((s) => ({
              ...s,
              budget: Math.round(s.budget * ratio),
            })),
          };
        }
        return cat;
      });

      return {
        ...prev,
        months: {
          ...prev.months,
          [mId]: {
            ...monthObj,
            categories: updatedCategories,
          },
        },
      };
    });
  };

  const addSubcategory = (categoryId, name, budget, icon = 'ShoppingBag') => {
    const mId = state.selectedMonthId;
    const newSub = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      budget: Number(budget) || 0,
      icon,
    };

    setState((prev) => {
      const monthObj = prev.months[mId];
      const updatedCategories = monthObj.categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            subcategories: [...cat.subcategories, newSub],
          };
        }
        return cat;
      });

      return {
        ...prev,
        months: {
          ...prev.months,
          [mId]: {
            ...monthObj,
            categories: updatedCategories,
          },
        },
      };
    });
  };

  const updateSubcategory = (categoryId, subcategoryId, newName, newBudget, newIcon) => {
    const mId = state.selectedMonthId;
    setState((prev) => {
      const monthObj = prev.months[mId];
      const updatedCategories = monthObj.categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            subcategories: cat.subcategories.map((sub) =>
              sub.id === subcategoryId
                ? {
                    ...sub,
                    name: newName.trim() || sub.name,
                    budget: Number(newBudget) || 0,
                    icon: newIcon || sub.icon,
                  }
                : sub
            ),
          };
        }
        return cat;
      });

      return {
        ...prev,
        months: {
          ...prev.months,
          [mId]: {
            ...monthObj,
            categories: updatedCategories,
          },
        },
      };
    });
  };

  const deleteSubcategory = (categoryId, subcategoryId, migrateToSubcategoryId = null) => {
    const mId = state.selectedMonthId;
    setState((prev) => {
      const monthObj = prev.months[mId];
      
      // Update transactions if migrated
      let updatedTransactions = monthObj.transactions;
      if (migrateToSubcategoryId) {
        const targetSub = monthObj.categories
          .flatMap((c) => c.subcategories)
          .find((s) => s.id === migrateToSubcategoryId);

        updatedTransactions = monthObj.transactions.map((tx) =>
          tx.subcategoryId === subcategoryId
            ? {
                ...tx,
                subcategoryId: migrateToSubcategoryId,
                subcategoryName: targetSub?.name || tx.subcategoryName,
              }
            : tx
        );
      } else {
        // Remove transactions associated with this subcategory
        updatedTransactions = monthObj.transactions.filter((tx) => tx.subcategoryId !== subcategoryId);
      }

      const updatedCategories = monthObj.categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            subcategories: cat.subcategories.filter((sub) => sub.id !== subcategoryId),
          };
        }
        return cat;
      });

      return {
        ...prev,
        months: {
          ...prev.months,
          [mId]: {
            ...monthObj,
            categories: updatedCategories,
            transactions: updatedTransactions,
          },
        },
      };
    });
  };

  // Onboarding Completion Action
  const completeOnboarding = (setupData) => {
    const mId = '2026-09';
    const monthName = 'September 2026';

    const incomeSources = setupData.incomeSources || [{ id: 'inc-1', name: 'Primary Salary', amount: 50000 }];
    const totalInc = incomeSources.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    const categories = [
      {
        id: 'needs',
        name: 'Needs',
        budget: setupData.allocations?.needs || totalInc * 0.5,
        subcategories: setupData.subcategories?.needs || DEFAULT_CATEGORIES_TEMPLATE[0].subcategories,
      },
      {
        id: 'wants',
        name: 'Wants',
        budget: setupData.allocations?.wants || totalInc * 0.3,
        subcategories: setupData.subcategories?.wants || DEFAULT_CATEGORIES_TEMPLATE[1].subcategories,
      },
      {
        id: 'savings',
        name: 'Savings',
        budget: setupData.allocations?.savings || totalInc * 0.2,
        subcategories: setupData.subcategories?.savings || DEFAULT_CATEGORIES_TEMPLATE[2].subcategories,
      },
    ];

    setState((prev) => ({
      ...prev,
      isOnboarded: true,
      selectedMonthId: mId,
      months: {
        ...prev.months,
        [mId]: {
          monthId: mId,
          monthName,
          incomeSources,
          categories,
          transactions: prev.months[mId]?.transactions || [],
        },
      },
    }));
  };

  const restartOnboarding = () => {
    setState((prev) => ({
      ...prev,
      isOnboarded: false,
    }));
  };

  const resetToDefault = () => {
    setState(INITIAL_MONTH_DATA);
  };

  const updateCurrency = (newCurr) => {
    setState((prev) => ({ ...prev, currency: newCurr }));
  };

  const value = {
    ...state,
    currentMonth,
    selectedMonth: currentMonth.monthName,
    incomeSources: currentMonth.incomeSources || [],
    categories: currentMonth.categories || DEFAULT_CATEGORIES_TEMPLATE,
    transactions: currentMonth.transactions || [],
    ...calculations,
    formatCurrency,
    switchMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    updateCategoryAllocations,
    updateCategoryPercentages,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    completeOnboarding,
    restartOnboarding,
    resetToDefault,
    updateCurrency,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
