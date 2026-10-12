'use client';

import React, { useState, useMemo } from 'react';
import { useBusinessStore } from '@/lib/business-store';
import {
  Users,
  Plus,
  Search,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  DollarSign,
  Copy,
  Check,
  Trash2,
  Edit,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { Customer, PaymentMethod } from '@/types';

interface CustomersViewProps {
  onOpenNewCustomer: () => void;
}

export function CustomersView({ onOpenNewCustomer }: CustomersViewProps) {
  const {
    customers,
    sales,
    deleteCustomer,
    recordCustomerPayment,
    formatCurrency,
    settings,
    setSelectedReceiptSale,
  } = useBusinessStore();

  const [activeTab, setActiveTab] = useState<'debtors' | 'all'>('debtors');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Debt Payment Modal State
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentNote, setPaymentNote] = useState('');

  // Debtors vs All customers
  const debtorsList = useMemo(() => {
    return customers.filter((c) => c.totalDebt > 0);
  }, [customers]);

  const totalOutstandingDebt = useMemo(() => {
    return debtorsList.reduce((acc, c) => acc + c.totalDebt, 0);
  }, [debtorsList]);

  // Filtered
  const filteredCustomers = useMemo(() => {
    const source = activeTab === 'debtors' ? debtorsList : customers;
    return source.filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });
  }, [customers, debtorsList, activeTab, searchQuery]);

  const handleSettleDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingCustomer) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    recordCustomerPayment(
      payingCustomer.id,
      amount,
      paymentMethod,
      paymentNote || `Debt payment of ${formatCurrency(amount)}`
    );

    setPayingCustomer(null);
    setPaymentAmount('');
    setPaymentNote('');
  };

  const copyPaymentReminder = (customer: Customer) => {
    const text = `Hello ${customer.name}, friendly reminder from ${settings.businessName}: you have an outstanding credit balance of ${formatCurrency(customer.totalDebt)}. Kindly settle when convenient. Thank you!`;
    navigator.clipboard.writeText(text);
    setCopiedId(customer.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Ledger Metric Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-neutral-500">Uncollected Customer Debt</span>
          <div className="mt-1 text-2xl font-bold tracking-tight text-amber-900 tabular-nums">
            {formatCurrency(totalOutstandingDebt)}
          </div>
          <span className="text-[11px] text-neutral-400">
            Across {debtorsList.length} customer accounts
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-neutral-500">Total Registered Customers</span>
          <div className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {customers.length}
          </div>
          <span className="text-[11px] text-neutral-400">
            {customers.filter((c) => c.totalSpent > 0).length} active buyers
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div>
            <span className="text-xs text-neutral-500">Customer Accounts</span>
            <p className="text-xs text-neutral-700 font-medium mt-1">
              Add new client or record credit
            </p>
          </div>
          <button
            onClick={onOpenNewCustomer}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-xs">
        {/* Navigation Subtabs & Search */}
        <div className="flex flex-col justify-between gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('debtors')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'debtors'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Credit &amp; Debt Ledger ({debtorsList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All Customers ({customers.length})
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50/50 py-1.5 pl-8 pr-4 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-neutral-500 font-medium">
                <th className="py-2.5 px-4">Customer Name</th>
                <th className="py-2.5 px-4">Phone / Contact</th>
                <th className="py-2.5 px-4 text-right">Outstanding Debt</th>
                <th className="py-2.5 px-4 text-right">Lifetime Spend</th>
                <th className="py-2.5 px-4">Notes</th>
                <th className="py-2.5 px-4 text-right">Ledger Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                    {activeTab === 'debtors'
                      ? 'No customers currently owe money! All credit tabs are cleared.'
                      : 'No customer profiles found matching your search.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const hasDebt = cust.totalDebt > 0;
                  return (
                    <tr key={cust.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900 block">{cust.name}</span>
                        {cust.email && (
                          <span className="text-[11px] text-neutral-400 block">{cust.email}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-700">
                        {cust.phone || <span className="text-neutral-400 font-sans">-</span>}
                      </td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums">
                        {hasDebt ? (
                          <span className="rounded bg-rose-50 px-2 py-0.5 text-xs text-rose-700 border border-rose-200">
                            {formatCurrency(cust.totalDebt)}
                          </span>
                        ) : (
                          <span className="text-neutral-400">0.00</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-neutral-800 tabular-nums">
                        {formatCurrency(cust.totalSpent)}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 max-w-xs truncate">
                        {cust.notes || cust.address || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {hasDebt && (
                            <>
                              <button
                                onClick={() => {
                                  setPayingCustomer(cust);
                                  setPaymentAmount(cust.totalDebt.toString());
                                  setPaymentMethod('CASH');
                                }}
                                className="rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-100"
                                title="Settle / Collect Debt Payment"
                              >
                                Settle Tab
                              </button>
                              <button
                                onClick={() => copyPaymentReminder(cust)}
                                className="rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100 shadow-2xs inline-flex items-center gap-1"
                                title="Copy Payment Reminder message for WhatsApp/SMS"
                              >
                                {copiedId === cust.id ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600" />
                                    <span className="text-emerald-700">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 text-neutral-500" />
                                    <span>Reminder</span>
                                  </>
                                )}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Delete customer profile ${cust.name}?`)) {
                                deleteCustomer(cust.id);
                              }
                            }}
                            className="p-1 text-neutral-400 hover:text-rose-600"
                            title="Delete customer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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

      {/* Settle Debt Payment Modal */}
      {payingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900">
              Record Debt Payment: {payingCustomer.name}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Current outstanding debt:{' '}
              <span className="font-bold text-rose-600 tabular-nums">
                {formatCurrency(payingCustomer.totalDebt)}
              </span>
            </p>

            <form onSubmit={handleSettleDebt} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Payment Amount Received ({settings.currencySymbol})
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    max={payingCustomer.totalDebt}
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none tabular-nums font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(payingCustomer.totalDebt.toString())}
                    className="whitespace-nowrap rounded-lg border border-neutral-300 bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
                  >
                    Pay Full Tab
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Payment Channel
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card / POS</option>
                  <option value="TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Note / Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid in cash at front counter"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setPayingCustomer(null)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
