'use client';

import React, { useState, useMemo } from 'react';
import { useBusinessStore } from '@/lib/business-store';
import {
  Wallet,
  Plus,
  Search,
  Building,
  Zap,
  Users,
  Box,
  Truck,
  Wrench,
  Fuel,
  DollarSign,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '@/types';
import { FormattedDate } from '@/components/FormattedDate';

export function ExpensesView() {
  const { expenses, addExpense, deleteExpense, sales, formatCurrency, settings } = useBusinessStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('GENERATOR_FUEL');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formMethod, setFormMethod] = useState<PaymentMethod>('TRANSFER');
  const [formRef, setFormRef] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Category Icon & Label mapping
  const categoryLabels: Record<ExpenseCategory, { label: string; icon: any }> = {
    GENERATOR_FUEL: { label: 'Generator Fuel (PMS / Diesel)', icon: Fuel },
    RENT: { label: 'Shop Rent & Stall Lease', icon: Building },
    ELECTRICITY_NEPA: { label: 'NEPA / DisCo Electricity Token', icon: Zap },
    LOGISTICS_DISPATCH: { label: 'Dispatch Rider & Logistics', icon: Truck },
    SALARIES: { label: 'Staff Wages & Stipends', icon: Users },
    SUPPLIES: { label: 'Packaging Bags & Consumables', icon: Box },
    MARKETING: { label: 'Marketing & Influencer Ads', icon: DollarSign },
    MAINTENANCE: { label: 'Generator & Shop Repairs', icon: Wrench },
    OTHER: { label: 'Miscellaneous Other', icon: HelpCircle },
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.referenceNumber && e.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategoryFilter === 'ALL' || e.category === selectedCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [expenses, searchQuery, selectedCategoryFilter]);

  const totalExpenseSum = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // P&L Math
  const activeSales = sales.filter((s) => s.status !== 'CANCELLED');
  const totalRevenue = activeSales.reduce((acc, s) => acc + s.total, 0);
  const totalCogs = activeSales.reduce((acc, s) => {
    return acc + s.items.reduce((itAcc, item) => itAcc + item.unitCost * item.quantity, 0);
  }, 0);
  const grossProfit = totalRevenue - totalCogs;
  const netProfit = grossProfit - totalExpenseSum;
  const netMarginPct = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const categoryBreakdown = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    expenses.forEach((e) => {
      const prev = map.get(e.category) || 0;
      map.set(e.category, prev + e.amount);
    });
    return Array.from(map.entries())
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        pct: totalExpenseSum > 0 ? (amount / totalExpenseSum) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, totalExpenseSum]);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount);
    if (!formTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    addExpense({
      title: formTitle.trim(),
      category: formCategory,
      amount: amountNum,
      date: new Date(formDate).toISOString(),
      paymentMethod: formMethod,
      referenceNumber: formRef.trim() || undefined,
      notes: formNotes.trim() || undefined,
    });

    setFormTitle('');
    setFormAmount('');
    setFormRef('');
    setFormNotes('');
    setIsAddExpenseOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* P&L Statement & Expense KPI Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* P&L Live Calculator Card (2 cols) */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                Profit &amp; Loss (P&amp;L) Estimation
              </h3>
              <p className="text-xs text-neutral-500">
                Gross sales minus wholesale inventory cost and operational overheads
              </p>
            </div>
            <div className="text-right">
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold tabular-nums ${
                  netProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {netMarginPct}% Net Margin
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-neutral-50 p-3">
              <span className="text-[11px] text-neutral-500">1. Gross Revenue</span>
              <div className="mt-1 text-base font-bold text-neutral-900 tabular-nums">
                {formatCurrency(totalRevenue)}
              </div>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3">
              <span className="text-[11px] text-neutral-500">2. Cost of Goods (COGS)</span>
              <div className="mt-1 text-base font-bold text-neutral-700 tabular-nums">
                -{formatCurrency(totalCogs)}
              </div>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3">
              <span className="text-[11px] text-neutral-500">3. Gross Profit</span>
              <div className="mt-1 text-base font-bold text-neutral-900 tabular-nums">
                {formatCurrency(grossProfit)}
              </div>
            </div>

            <div
              className={`rounded-lg p-3 ${
                netProfit >= 0
                  ? 'bg-emerald-50/80 border border-emerald-200'
                  : 'bg-rose-50/80 border border-rose-200'
              }`}
            >
              <span
                className={`text-[11px] font-semibold ${
                  netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                4. Net Operating Profit
              </span>
              <div
                className={`mt-1 text-base font-bold tabular-nums ${
                  netProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'
                }`}
              >
                {formatCurrency(netProfit)}
              </div>
            </div>
          </div>
        </div>

        {/* Total Expenses Action Box */}
        <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div>
            <span className="text-xs text-neutral-500">Total Operating Expenses</span>
            <div className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {formatCurrency(totalExpenseSum)}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {expenses.length} overhead disbursements recorded
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" />
              <span>Log New Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table & Category Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Table (2 Cols) */}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-xs lg:col-span-2">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search expense description, notes, or ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50/50 py-1.5 pl-8 pr-4 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:border-neutral-900 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(categoryLabels).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/60 text-neutral-500 font-medium">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Title &amp; Notes</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                      No expenses logged matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 text-neutral-500 whitespace-nowrap" suppressHydrationWarning>
                        <FormattedDate date={exp.date} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900 block">{exp.title}</span>
                        {exp.notes && (
                          <span className="text-[11px] text-neutral-500">{exp.notes}</span>
                        )}
                        {exp.referenceNumber && (
                          <span className="text-[10px] text-neutral-400 block font-mono">
                            Ref: {exp.referenceNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700">
                          {categoryLabels[exp.category]?.label || exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        <span className="text-[11px]">{exp.paymentMethod}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-neutral-900 tabular-nums">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Delete expense "${exp.title}"?`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown Sidebar */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
            Expenses by Category
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Where your operating funds are allocated
          </p>

          <div className="space-y-3">
            {categoryBreakdown.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No expenses logged yet.
              </div>
            ) : (
              categoryBreakdown.map((item) => {
                const info = categoryLabels[item.category];
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-800">{info?.label}</span>
                      <span className="font-semibold text-neutral-900 tabular-nums">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, item.pct)}%` }}
                        className="h-full rounded-full bg-neutral-800 transition-all"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Log Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900">Log Operating Expense</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Record fuel, rent, dispatch fees, or wages for accurate profit estimation.
            </p>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50 Litres Generator Fuel, Shop Rent, Dispatch to Lekki"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  >
                    {Object.entries(categoryLabels).map(([key, it]) => (
                      <option key={key} value={key}>
                        {it.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Amount ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    placeholder="0"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Payment Channel</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as PaymentMethod)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  >
                    <option value="TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">POS Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Reference / Receipt No (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. NNPC-0192, DISP-883"
                  value={formRef}
                  onChange={(e) => setFormRef(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Additional details..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
