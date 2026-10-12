'use client';

import React, { useState, useMemo } from 'react';
import { useBusinessStore } from '@/lib/business-store';
import {
  Search,
  Filter,
  Receipt,
  RotateCcw,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { Sale, PaymentMethod, SaleStatus } from '@/types';
import { FormattedDateTime } from '@/components/FormattedDate';

export function SalesView() {
  const { sales, customers, voidSale, formatCurrency, setSelectedReceiptSale } = useBusinessStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  // Filtered sales list
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const customer = customers.find((c) => c.id === sale.customerId);
      const customerName = customer ? customer.name.toLowerCase() : 'walk-in';

      const matchesSearch =
        sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerName.includes(searchQuery.toLowerCase());

      const matchesMethod = methodFilter === 'ALL' || sale.paymentMethod === methodFilter;
      const matchesStatus = statusFilter === 'ALL' || sale.status === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [sales, customers, searchQuery, methodFilter, statusFilter]);

  // Aggregate stats for filtered sales
  const totalVolume = filteredSales.reduce((acc, s) => (s.status !== 'CANCELLED' ? acc + s.total : acc), 0);
  const totalCollected = filteredSales.reduce(
    (acc, s) => (s.status !== 'CANCELLED' ? acc + s.paidAmount : acc),
    0
  );
  const totalUncollected = filteredSales.reduce(
    (acc, s) => (s.status !== 'CANCELLED' ? acc + s.balanceDue : acc),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Aggregates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-neutral-500">Total Sales Volume</span>
          <div className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {formatCurrency(totalVolume)}
          </div>
          <span className="text-[11px] text-neutral-400">
            {filteredSales.filter((s) => s.status !== 'CANCELLED').length} successful sales
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-neutral-500">Collected Cash / Bank</span>
          <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
            {formatCurrency(totalCollected)}
          </div>
          <span className="text-[11px] text-neutral-400">Received at point of sale</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-neutral-500">Uncollected Credit Balance</span>
          <div className="mt-1 text-2xl font-bold tracking-tight text-amber-800 tabular-nums">
            {formatCurrency(totalUncollected)}
          </div>
          <span className="text-[11px] text-neutral-400">Purchases on store tab</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-xs">
        {/* Search & Filters */}
        <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search invoice number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50/50 py-1.5 pl-8 pr-4 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Payment Method filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:border-neutral-900 focus:outline-none"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card / POS</option>
              <option value="TRANSFER">Bank Transfer</option>
              <option value="CREDIT">Store Credit Tab</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:border-neutral-900 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="CREDIT">On Credit</option>
              <option value="CANCELLED">Void / Cancelled</option>
            </select>
          </div>
        </div>

        {/* Sales Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-neutral-500 font-medium">
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Date & Time</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Items Count</th>
                <th className="py-2.5 px-4 text-right">Total</th>
                <th className="py-2.5 px-4 text-right">Balance Due</th>
                <th className="py-2.5 px-4 text-center">Payment</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Receipt / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-neutral-400">
                    No sales found matching your search.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const customer = customers.find((c) => c.id === sale.customerId);
                  const isCancelled = sale.status === 'CANCELLED';

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        isCancelled ? 'opacity-50 line-through' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-neutral-900">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 whitespace-nowrap" suppressHydrationWarning>
                        <FormattedDateTime date={sale.createdAt} />
                      </td>
                      <td className="py-3 px-4 font-medium text-neutral-800">
                        {customer ? customer.name : 'Walk-in Customer'}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {sale.items.reduce((a, it) => a + it.quantity, 0)} items
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-neutral-900 tabular-nums">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold tabular-nums">
                        {sale.balanceDue > 0 ? (
                          <span className="text-rose-600">
                            {formatCurrency(sale.balanceDue)}
                          </span>
                        ) : (
                          <span className="text-neutral-400">0.00</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                            sale.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sale.status === 'CREDIT'
                              ? 'bg-rose-100 text-rose-800'
                              : sale.status === 'CANCELLED'
                              ? 'bg-neutral-200 text-neutral-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedReceiptSale(sale)}
                            className="inline-flex items-center gap-1 rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50"
                            title="Print / View Receipt"
                          >
                            <Receipt className="h-3 w-3 text-neutral-500" />
                            <span>Receipt</span>
                          </button>
                          {!isCancelled && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Void sale ${sale.invoiceNumber}? Stock quantities will be returned to inventory.`
                                  )
                                ) {
                                  voidSale(sale.id);
                                }
                              }}
                              className="rounded border border-neutral-200 bg-white p-1 text-neutral-400 hover:text-rose-600 shadow-2xs"
                              title="Void Sale & Return Stock"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
