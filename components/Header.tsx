'use client';

import React from 'react';
import { useBusinessStore } from '@/lib/business-store';
import {
  ShoppingBag,
  Package,
  AlertTriangle,
  User,
  Store,
  ChevronDown,
} from 'lucide-react';
import { BusinessNiche } from '@/types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewProduct: () => void;
  onOpenQuickSale: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  onOpenNewProduct,
  onOpenQuickSale,
}: HeaderProps) {
  const {
    settings,
    metrics,
    cart,
    currentStaff,
    switchStaff,
    switchNiche,
  } = useBusinessStore();

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Business Overview';
      case 'pos':
        return 'Point of Sale (POS)';
      case 'inventory':
        return 'Inventory & Stock';
      case 'orders':
        return 'Orders & WhatsApp Dispatch';
      case 'sales':
        return 'Sales & Invoices';
      case 'expenses':
        return 'Operating Expenses & P&L';
      case 'customers':
        return 'Customers & Debt Ledger';
      case 'settings':
        return 'Business Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Zone 1: Breadcrumb / Store Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col truncate">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 truncate">
            <span className="font-semibold text-neutral-800 truncate">{settings.businessName}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[11px] text-neutral-400 truncate">{settings.cityState}</span>
          </div>
          <h1 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
            {getTabTitle(activeTab)}
          </h1>
        </div>
      </div>

      {/* Zone 2 & 3: Staff Selector, Niche Presets & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Niche Demo Preset Switcher */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs">
          <Store className="h-3.5 w-3.5 text-neutral-500" />
          <span className="text-[11px] text-neutral-500">Niche:</span>
          <select
            value={settings.activeNiche || 'FASHION'}
            onChange={(e) => switchNiche(e.target.value as BusinessNiche)}
            className="bg-transparent font-semibold text-neutral-800 focus:outline-none cursor-pointer text-xs"
          >
            <option value="FASHION">👗 Fashion Boutique</option>
            <option value="FOOD_PROVISIONS">🛒 Food &amp; Provisions</option>
            <option value="ELECTRONICS">📱 Tech &amp; Gadgets</option>
            <option value="PHARMACY">💊 Pharmacy &amp; Health</option>
            <option value="COSMETICS">💄 Cosmetics &amp; Skincare</option>
          </select>
        </div>

        {/* Staff Account Switcher */}
        <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs">
          <User className="h-3.5 w-3.5 text-neutral-500" />
          <span className="text-[11px] text-neutral-500">Staff:</span>
          <select
            value={currentStaff.id}
            onChange={(e) => switchStaff(e.target.value)}
            className="bg-transparent font-semibold text-neutral-800 focus:outline-none cursor-pointer text-xs"
          >
            {settings.staffList?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role})
              </option>
            ))}
          </select>
        </div>

        {/* Low Stock Alert */}
        {metrics.lowStockCount > 0 && (
          <button
            onClick={() => setActiveTab('inventory')}
            className="hidden items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100 sm:flex"
            title={`${metrics.lowStockCount} items below minimum stock level`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>{metrics.lowStockCount} Low Stock</span>
          </button>
        )}

        {/* Quick Add Product */}
        <button
          onClick={onOpenNewProduct}
          className="hidden items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-xs transition hover:bg-neutral-50 lg:flex"
        >
          <Package className="h-3.5 w-3.5 text-neutral-500" />
          <span>New Item</span>
        </button>

        {/* Primary POS Button */}
        <button
          onClick={() => {
            setActiveTab('pos');
            onOpenQuickSale();
          }}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 active:scale-98"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">Open POS Register</span>
          {cart.length > 0 && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              {cart.reduce((a, c) => a + c.quantity, 0)}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
