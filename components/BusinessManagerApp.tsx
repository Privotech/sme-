'use client';

import React, { useState } from 'react';
import { BusinessStoreProvider, useBusinessStore } from '@/lib/business-store';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/DashboardView';
import { PosView } from '@/components/PosView';
import { InventoryView } from '@/components/InventoryView';
import { OrdersView } from '@/components/OrdersView';
import { SalesView } from '@/components/SalesView';
import { ExpensesView } from '@/components/ExpensesView';
import { CustomersView } from '@/components/CustomersView';
import { SettingsView } from '@/components/SettingsView';
import { ReceiptModal } from '@/components/ReceiptModal';
import { AddProductModal } from '@/components/AddProductModal';
import { RestockModal } from '@/components/RestockModal';
import { AddCustomerModal } from '@/components/AddCustomerModal';
import { Menu } from 'lucide-react';
import { useIsClient } from '@/components/FormattedDate';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Modals State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockProductId, setRestockProductId] = useState<string | undefined>(undefined);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const { selectedReceiptSale, setSelectedReceiptSale, isLoaded } = useBusinessStore();

  const handleOpenRestock = (productId?: string) => {
    setRestockProductId(productId);
    setIsRestockOpen(true);
  };



  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main App Layout */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header with Mobile Hamburger */}
        <div className="flex items-center">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-16 items-center justify-center px-4 text-neutral-600 hover:text-neutral-900 lg:hidden border-b border-neutral-200 bg-white"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <Header
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenNewProduct={() => setIsAddProductOpen(true)}
              onOpenQuickSale={() => setActiveTab('pos')}
            />
          </div>
        </div>

        {/* View Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
              onOpenQuickSale={() => setActiveTab('pos')}
              onOpenRestock={handleOpenRestock}
            />
          )}

          {activeTab === 'pos' && (
            <PosView onOpenNewCustomer={() => setIsAddCustomerOpen(true)} />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              onOpenNewProduct={() => setIsAddProductOpen(true)}
              onOpenRestock={handleOpenRestock}
            />
          )}

          {activeTab === 'orders' && <OrdersView />}

          {activeTab === 'sales' && <SalesView />}

          {activeTab === 'expenses' && <ExpensesView />}

          {activeTab === 'customers' && (
            <CustomersView onOpenNewCustomer={() => setIsAddCustomerOpen(true)} />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modals & Receipts */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

      <RestockModal
        isOpen={isRestockOpen}
        defaultProductId={restockProductId}
        onClose={() => {
          setIsRestockOpen(false);
          setRestockProductId(undefined);
        }}
      />

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />

      <ReceiptModal
        sale={selectedReceiptSale}
        onClose={() => setSelectedReceiptSale(null)}
      />
    </div>
  );
}

export function BusinessManagerApp() {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="flex min-h-screen bg-neutral-50 animate-pulse">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex w-64 flex-col border-r border-neutral-200 bg-white p-4 space-y-4 shrink-0">
          <div className="h-9 w-36 rounded-lg bg-neutral-200" />
          <div className="space-y-2 pt-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-8 rounded-lg bg-neutral-100" />
            ))}
          </div>
        </div>
        {/* Main Content skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between">
            <div className="h-6 w-32 rounded bg-neutral-200" />
            <div className="h-8 w-44 rounded-full bg-neutral-100" />
          </div>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="h-7 w-48 rounded bg-neutral-200" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
                  <div className="h-4 w-24 rounded bg-neutral-100" />
                  <div className="h-7 w-32 rounded bg-neutral-200" />
                </div>
              ))}
            </div>
            <div className="h-64 rounded-xl border border-neutral-200 bg-white p-6" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <BusinessStoreProvider>
      <AppContent />
    </BusinessStoreProvider>
  );
}
