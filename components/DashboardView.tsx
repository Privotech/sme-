'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/lib/business-store';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Package,
  ArrowUpRight,
  Clock,
  UserCheck,
  CreditCard,
  Plus,
  Receipt,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Sale } from '@/types';
import { FormattedTime, FormattedDate } from '@/components/FormattedDate';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenQuickSale: () => void;
  onOpenRestock: (productId?: string) => void;
}

export function DashboardView({
  onNavigate,
  onOpenQuickSale,
  onOpenRestock,
}: DashboardViewProps) {
  const { metrics, formatCurrency, settings, products, setSelectedReceiptSale } = useBusinessStore();
  const [trendMetric, setTrendMetric] = useState<'revenue' | 'profit'>('revenue');

  // Find max value in trend for clean SVG bar chart scaling
  const maxTrendVal = Math.max(
    ...metrics.salesTrend.map((t) => (trendMetric === 'revenue' ? t.revenue : t.profit)),
    100
  );

  const lowStockItems = products.filter(
    (p) => p.stock <= (p.minStockAlert || settings.lowStockThreshold)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-900">
            Welcome back to {settings.businessName}
          </h2>
          <p className="text-xs text-neutral-500">
            Here is your live business overview for today. Sales, stock levels, and operating ledger are synchronized.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQuickSale}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>New Sale (POS)</span>
          </button>
          <button
            onClick={() => onOpenRestock()}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 shadow-2xs transition hover:bg-neutral-50"
          >
            <Package className="h-3.5 w-3.5 text-neutral-500" />
            <span>Restock Inventory</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Sales */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Today&apos;s Sales</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {formatCurrency(metrics.todaySales)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-700">{metrics.todaySalesCount}</span>
            <span>transactions recorded</span>
          </div>
        </div>

        {/* Month Net Operating Profit */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Month Net Profit</span>
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-md ${
                metrics.monthNetProfit >= 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {metrics.monthNetProfit >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
          </div>
          <div
            className={`mt-2 text-2xl font-bold tracking-tight tabular-nums ${
              metrics.monthNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(metrics.monthNetProfit)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
            <span>Revenue: </span>
            <span className="font-semibold text-neutral-700 tabular-nums">
              {formatCurrency(metrics.monthSales)}
            </span>
            <span className="mx-1">·</span>
            <span>Exp: </span>
            <span className="font-semibold text-neutral-700 tabular-nums">
              {formatCurrency(metrics.monthExpenses)}
            </span>
          </div>
        </div>

        {/* Customer Receivables (Owed to store) */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Customer Receivables (Debts)</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-900 tabular-nums">
            {formatCurrency(metrics.totalReceivables)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-neutral-500">
              {metrics.debtors.length} customer tab{metrics.debtors.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => onNavigate('customers')}
              className="font-medium text-amber-700 hover:text-amber-900 hover:underline"
            >
              Collect &rarr;
            </button>
          </div>
        </div>

        {/* Inventory Stock Valuation */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Total Stock Valuation</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {formatCurrency(metrics.inventoryValuationRetail)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <span>Cost basis: </span>
            <span className="font-semibold text-neutral-700 tabular-nums">
              {formatCurrency(metrics.inventoryValuationCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Sales Trend Chart & Urgent Action Drawer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Trend Chart (2 columns) */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                7-Day Financial Performance
              </h3>
              <p className="text-xs text-neutral-500">
                Daily {trendMetric === 'revenue' ? 'gross sales revenue' : 'gross profit contribution'}
              </p>
            </div>
            {/* Metric Switcher */}
            <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1">
              <button
                onClick={() => setTrendMetric('revenue')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  trendMetric === 'revenue'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setTrendMetric('profit')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  trendMetric === 'profit'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Gross Profit
              </button>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="mt-6 flex h-48 w-full items-end gap-2 border-b border-neutral-200 pb-2 sm:gap-4">
            {metrics.salesTrend.map((day, idx) => {
              const val = trendMetric === 'revenue' ? day.revenue : day.profit;
              const barHeightPct = Math.max(8, Math.min(100, (val / maxTrendVal) * 100));

              return (
                <div
                  key={day.date}
                  className="group relative flex flex-1 flex-col items-center justify-end h-full"
                >
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute -top-8 z-10 hidden rounded bg-neutral-900 px-2 py-1 text-[11px] font-medium text-white shadow-xs group-hover:block whitespace-nowrap">
                    {formatCurrency(val)}
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className={`w-full max-w-[42px] rounded-t-sm transition-all duration-200 group-hover:opacity-80 ${
                      trendMetric === 'revenue'
                        ? 'bg-neutral-900'
                        : 'bg-emerald-600'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Day Labels */}
          <div className="mt-2 flex w-full justify-between gap-2 text-[11px] text-neutral-500 sm:gap-4">
            {metrics.salesTrend.map((day) => (
              <div key={day.date} className="flex-1 text-center truncate" suppressHydrationWarning>
                {day.label}
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Actions: Low Stock & Outstanding Credit */}
        <div className="space-y-4">
          {/* Low Stock Watch */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Low Stock Priority</span>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs text-neutral-500 hover:text-neutral-900"
              >
                View all &rarr;
              </button>
            </div>

            <div className="mt-3 divide-y divide-neutral-100">
              {lowStockItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  All inventory levels are healthy!
                </div>
              ) : (
                lowStockItems.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-medium text-neutral-800 truncate">{p.name}</p>
                      <p className="text-[11px] text-neutral-400">{p.sku}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                          p.stock === 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.stock} left
                      </span>
                      <button
                        onClick={() => onOpenRestock(p.id)}
                        className="rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Unpaid Tabs */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                <CreditCard className="h-4 w-4 text-rose-500" />
                <span>Customer Credit Tabs</span>
              </div>
              <button
                onClick={() => onNavigate('customers')}
                className="text-xs text-neutral-500 hover:text-neutral-900"
              >
                Ledger &rarr;
              </button>
            </div>

            <div className="mt-3 divide-y divide-neutral-100">
              {metrics.debtors.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  Zero unpaid customer debts. Outstanding!
                </div>
              ) : (
                metrics.debtors.slice(0, 3).map((debtor) => (
                  <div
                    key={debtor.id}
                    className="flex items-center justify-between py-2 text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-medium text-neutral-800 truncate">{debtor.name}</p>
                      <p className="text-[11px] text-neutral-400">{debtor.phone || 'No phone'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-rose-600 tabular-nums">
                        {formatCurrency(debtor.totalDebt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Products & Recent Sales Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Selling Products */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
            Top Selling Products
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Items driving the highest turnover volume
          </p>

          <div className="space-y-3">
            {metrics.topSellingProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No sales records yet.
              </div>
            ) : (
              metrics.topSellingProducts.map((p, idx) => (
                <div key={p.productId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-600">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-neutral-800 truncate">
                      {p.productName}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      {p.totalQuantity} sold
                    </span>
                    <span className="ml-2 text-neutral-500 tabular-nums">
                      ({formatCurrency(p.totalRevenue)})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                Recent Sales Transactions
              </h3>
              <p className="text-xs text-neutral-500">
                Latest customer purchases and payment statuses
              </p>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-medium text-neutral-700 hover:text-neutral-900"
            >
              All Sales &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-medium">
                  <th className="pb-2">Invoice</th>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Payment</th>
                  <th className="pb-2 text-right">Total</th>
                  <th className="pb-2 text-right">Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {metrics.recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-400">
                      No sales recorded yet. Start by opening the POS register.
                    </td>
                  </tr>
                ) : (
                  metrics.recentSales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-2.5 font-semibold text-neutral-900">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-2.5 text-neutral-500" suppressHydrationWarning>
                        <FormattedTime date={sale.createdAt} />
                      </td>
                      <td className="py-2.5">
                        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-neutral-900 tabular-nums">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            sale.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sale.status === 'CREDIT'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => setSelectedReceiptSale(sale)}
                          className="inline-flex items-center gap-1 rounded border border-neutral-200 bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50"
                        >
                          <Receipt className="h-3 w-3 text-neutral-500" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
