'use client';

import React, { useState, useMemo } from 'react';
import { useBusinessStore } from '@/lib/business-store';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  PackageCheck,
  Send,
  ExternalLink,
  MapPin,
  Phone,
  Receipt,
  User,
  AlertCircle,
} from 'lucide-react';
import { OrderStatus, Sale } from '@/types';
import { FormattedTime } from '@/components/FormattedDate';

export function OrdersView() {
  const {
    sales,
    customers,
    updateOrderStatus,
    formatCurrency,
    generateWhatsAppShareUrl,
    setSelectedReceiptSale,
  } = useBusinessStore();

  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active sales with orders
  const activeOrders = useMemo(() => {
    return sales.filter((s) => s.status !== 'CANCELLED');
  }, [sales]);

  const filteredOrders = useMemo(() => {
    return activeOrders.filter((order) => {
      const cust = customers.find((c) => c.id === order.customerId);
      const custName = cust ? cust.name.toLowerCase() : 'walk-in';
      const custPhone = cust?.phone || '';

      const matchesSearch =
        order.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        custName.includes(searchQuery.toLowerCase()) ||
        custPhone.includes(searchQuery);

      const matchesStatus =
        statusFilter === 'ALL' || (order.orderStatus || 'NEW') === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeOrders, customers, searchQuery, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: activeOrders.length,
      new: activeOrders.filter((o) => (o.orderStatus || 'NEW') === 'NEW').length,
      processing: activeOrders.filter((o) => o.orderStatus === 'PROCESSING').length,
      ready: activeOrders.filter((o) => o.orderStatus === 'READY_DISPATCH').length,
      delivered: activeOrders.filter((o) => o.orderStatus === 'DELIVERED').length,
    };
  }, [activeOrders]);

  const getStatusBadge = (status?: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return {
          label: 'New Order',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'PROCESSING':
        return {
          label: 'Packaging',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'READY_DISPATCH':
        return {
          label: 'Ready for Dispatch',
          color: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'DELIVERED':
        return {
          label: 'Delivered',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'bg-neutral-100 text-neutral-600 border-neutral-200',
        };
      default:
        return {
          label: 'New Order',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] text-neutral-500">New Orders</span>
          <div className="mt-1 text-2xl font-bold text-blue-700 tabular-nums">
            {counts.new}
          </div>
          <span className="text-[10px] text-neutral-400">Awaiting preparation</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] text-neutral-500">In Packaging</span>
          <div className="mt-1 text-2xl font-bold text-amber-700 tabular-nums">
            {counts.processing}
          </div>
          <span className="text-[10px] text-neutral-400">Being packed & sorted</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] text-neutral-500">Ready for Dispatch / Pickup</span>
          <div className="mt-1 text-2xl font-bold text-purple-700 tabular-nums">
            {counts.ready}
          </div>
          <span className="text-[10px] text-neutral-400">With rider or front desk</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] text-neutral-500">Delivered / Completed</span>
          <div className="mt-1 text-2xl font-bold text-emerald-700 tabular-nums">
            {counts.delivered}
          </div>
          <span className="text-[10px] text-neutral-400">Received by customers</span>
        </div>
      </div>

      {/* Main Order Queue */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-xs">
        {/* Filter Bar */}
        <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: `All Orders (${counts.all})` },
              { id: 'NEW', label: `New (${counts.new})` },
              { id: 'PROCESSING', label: `Packaging (${counts.processing})` },
              { id: 'READY_DISPATCH', label: `Dispatch Ready (${counts.ready})` },
              { id: 'DELIVERED', label: `Delivered (${counts.delivered})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  statusFilter === tab.id
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search customer, phone, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50/50 py-1.5 pl-8 pr-4 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-neutral-500 font-medium">
                <th className="py-2.5 px-4">Order / Invoice</th>
                <th className="py-2.5 px-4">Customer & Contact</th>
                <th className="py-2.5 px-4">Items Summary</th>
                <th className="py-2.5 px-4 text-right">Total</th>
                <th className="py-2.5 px-4 text-center">Payment</th>
                <th className="py-2.5 px-4 text-center">Fulfillment Status</th>
                <th className="py-2.5 px-4 text-right">WhatsApp & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                    No orders matching this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const cust = customers.find((c) => c.id === order.customerId);
                  const statusInfo = getStatusBadge(order.orderStatus);
                  const waUrl = generateWhatsAppShareUrl(order);

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-neutral-900 block">
                          {order.invoiceNumber}
                        </span>
                        <span className="text-[10px] text-neutral-400 block" suppressHydrationWarning>
                          <FormattedTime date={order.createdAt} />
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900 block">
                          {cust ? cust.name : 'Walk-in Customer'}
                        </span>
                        {cust?.phone && (
                          <span className="text-[11px] text-neutral-500 block font-mono">
                            {cust.phone}
                          </span>
                        )}
                        {cust?.address && (
                          <span className="text-[10px] text-neutral-400 block truncate max-w-[200px]">
                            📍 {cust.address}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-medium text-neutral-800 block truncate">
                          {order.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          Staff: {order.cashierName || 'Attendant'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-neutral-900 tabular-nums">
                        {formatCurrency(order.total)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            order.balanceDue > 0
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {order.balanceDue > 0 ? 'Credit / Due' : 'Paid In Full'}
                        </span>
                        <span className="block text-[10px] text-neutral-400 mt-0.5">
                          {order.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <select
                          value={order.orderStatus || 'NEW'}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`rounded-md border px-2 py-1 text-[11px] font-semibold focus:outline-none ${statusInfo.color}`}
                        >
                          <option value="NEW">New Order</option>
                          <option value="PROCESSING">Packaging</option>
                          <option value="READY_DISPATCH">Ready for Dispatch</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* WhatsApp Invoice Button */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-100"
                            title="Send order invoice & bank details on WhatsApp"
                          >
                            <Send className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => setSelectedReceiptSale(order)}
                            className="rounded border border-neutral-200 bg-white p-1 text-neutral-600 hover:bg-neutral-100 shadow-2xs"
                            title="Print / View Receipt"
                          >
                            <Receipt className="h-3.5 w-3.5" />
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
    </div>
  );
}
