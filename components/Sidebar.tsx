'use client';

import React from 'react';
import { useBusinessStore } from '@/lib/business-store';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Truck,
  Receipt,
  Wallet,
  Users,
  Settings,
  Store,
  CreditCard,
  Building,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const { cart, metrics, settings, currentStaff } = useBusinessStore();

  const totalCartCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'pos',
      label: 'Point of Sale (POS)',
      icon: ShoppingBag,
      badge: totalCartCount > 0 ? `${totalCartCount}` : undefined,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: Package,
      badge: metrics.lowStockCount > 0 ? `${metrics.lowStockCount} low` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200',
    },
    {
      id: 'orders',
      label: 'Orders & Dispatch',
      icon: Truck,
      badge: metrics.pendingOrdersCount > 0 ? `${metrics.pendingOrdersCount} active` : undefined,
      badgeColor: 'bg-blue-100 text-blue-800 border border-blue-200',
    },
    {
      id: 'sales',
      label: 'Sales & Invoices',
      icon: Receipt,
    },
    {
      id: 'expenses',
      label: 'Expenses & P&L',
      icon: Wallet,
    },
    {
      id: 'customers',
      label: 'Customers & Debts',
      icon: Users,
      badge: metrics.debtors.length > 0 ? `${metrics.debtors.length} tabs` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-200',
    },
    {
      id: 'settings',
      label: 'Business Settings',
      icon: Settings,
    },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup */}
        <div className="flex h-16 items-center gap-3 border-b border-neutral-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-xs">
            <Store className="h-5 w-5" />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-bold tracking-tight text-neutral-900 truncate">
              SME OS Nigeria
            </span>
            <span className="text-[11px] text-neutral-500">
              Business Operating System
            </span>
          </div>
        </div>

        {/* Current User Role Header */}
        <div className="border-b border-neutral-100 bg-neutral-50/60 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-semibold text-neutral-800 truncate">{currentStaff.name}</span>
          </div>
          <span className="rounded bg-neutral-200/80 px-1.5 py-0.5 text-[10px] font-bold text-neutral-700">
            {currentStaff.role}
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="mb-2 px-2 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
            Operations Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-neutral-400 group-hover:text-neutral-700'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`ml-2 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums shrink-0 ${
                        item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Credit Tabs Callout */}
          {metrics.totalReceivables > 0 && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-900">
                  Uncollected Debts (Owo)
                </span>
                <span className="text-xs font-bold text-amber-900 tabular-nums">
                  {settings.currencySymbol}
                  {metrics.totalReceivables.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                  })}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-amber-700">
                {metrics.debtors.length} customer tab{metrics.debtors.length > 1 ? 's' : ''} awaiting collection.
              </p>
              <button
                onClick={() => handleSelect('customers')}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded border border-amber-300 bg-white py-1 text-[11px] font-medium text-amber-900 shadow-2xs hover:bg-amber-100/50"
              >
                <span>Open Debt Ledger</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Bank Transfer Details Widget */}
          {settings.bankDetails && (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-[11px]">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                <Building className="h-3 w-3 text-neutral-500" />
                <span>Store Bank Details</span>
              </div>
              <p className="text-neutral-600 mt-1 font-mono font-medium">
                {settings.bankDetails.bankName}
              </p>
              <p className="text-neutral-900 font-mono font-bold">
                {settings.bankDetails.accountNumber}
              </p>
              <p className="text-[10px] text-neutral-400 truncate">
                {settings.bankDetails.accountName}
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-neutral-200 p-3.5">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <div className="flex flex-col truncate pr-2">
              <span className="truncate font-semibold text-neutral-800">
                {settings.businessName}
              </span>
              <span className="text-[10px] text-neutral-400">
                Currency: <strong className="text-neutral-700">{settings.currencyCode} ({settings.currencySymbol})</strong>
              </span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 shrink-0">
              <CreditCard className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
