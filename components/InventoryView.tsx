'use client';

import React, { useState, useMemo } from 'react';
import { useBusinessStore } from '@/lib/business-store';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  History,
  TrendingUp,
  Edit,
  Trash2,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { Product, StockMovementType } from '@/types';

interface InventoryViewProps {
  onOpenNewProduct: () => void;
  onOpenRestock: (productId?: string) => void;
}

export function InventoryView({ onOpenNewProduct, onOpenRestock }: InventoryViewProps) {
  const {
    products,
    stockMovements,
    deleteProduct,
    adjustStock,
    formatCurrency,
    settings,
  } = useBusinessStore();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'movements'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Adjustment Modal State
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<StockMovementType>('ADJUSTMENT');
  const [adjustNote, setAdjustNote] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Inventory Totals
  const totalCostValuation = useMemo(
    () => products.reduce((acc, p) => acc + p.costPrice * p.stock, 0),
    [products]
  );
  const totalRetailValuation = useMemo(
    () => products.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0),
    [products]
  );
  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock <= (p.minStockAlert || settings.lowStockThreshold)).length,
    [products, settings.lowStockThreshold]
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => p.stock === 0).length,
    [products]
  );

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));
      const matchesCat =
        categoryFilter === 'ALL' || p.category.toLowerCase() === categoryFilter.toLowerCase();

      let matchesStock = true;
      const isLow = p.stock > 0 && p.stock <= (p.minStockAlert || settings.lowStockThreshold);
      if (stockStatusFilter === 'IN_STOCK') matchesStock = p.stock > 0;
      if (stockStatusFilter === 'LOW_STOCK') matchesStock = isLow;
      if (stockStatusFilter === 'OUT_OF_STOCK') matchesStock = p.stock === 0;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockStatusFilter, settings.lowStockThreshold]);

  const handleConfirmAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct || adjustQuantity === 0) return;

    adjustStock({
      productId: adjustingProduct.id,
      quantityDelta: adjustQuantity,
      type: adjustType,
      note: adjustNote || `${adjustType} audit adjustment`,
    });

    setAdjustingProduct(null);
    setAdjustQuantity(0);
    setAdjustNote('');
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-neutral-500">Active SKUs</span>
          <div className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {products.length}
          </div>
          <span className="text-[11px] text-neutral-400">
            {products.reduce((acc, p) => acc + p.stock, 0)} total units in inventory
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-neutral-500">Stock Valuation (Cost)</span>
          <div className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {formatCurrency(totalCostValuation)}
          </div>
          <span className="text-[11px] text-neutral-400">Capital tied up in goods</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-neutral-500">Stock Valuation (Retail)</span>
          <div className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {formatCurrency(totalRetailValuation)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold tabular-nums">
            +{formatCurrency(totalRetailValuation - totalCostValuation)} unrealized profit
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-neutral-500">Stock Alerts</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tracking-tight tabular-nums ${
                lowStockCount + outOfStockCount > 0 ? 'text-amber-800' : 'text-neutral-900'
              }`}
            >
              {lowStockCount + outOfStockCount}
            </span>
            <span className="text-xs text-neutral-500">
              ({lowStockCount} low, {outOfStockCount} out)
            </span>
          </div>
          <span className="text-[11px] text-neutral-400">Items below reorder limit</span>
        </div>
      </div>

      {/* Main View Container */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-xs">
        {/* Navigation Tabs & Actions */}
        <div className="flex flex-col justify-between gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('catalog')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeSubTab === 'catalog'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Catalog & Stock Levels ({products.length})
            </button>
            <button
              onClick={() => setActiveSubTab('movements')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeSubTab === 'movements'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Movement History ({stockMovements.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenRestock()}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50"
            >
              <PlusCircle className="h-3.5 w-3.5 text-neutral-500" />
              <span>Receive Restock</span>
            </button>
            <button
              onClick={onOpenNewProduct}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {activeSubTab === 'catalog' ? (
          <>
            {/* Filter Controls */}
            <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Filter by product name, SKU, or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50/50 py-1.5 pl-8 pr-4 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Status Segmented Buttons */}
                <div className="flex items-center rounded-lg bg-neutral-100 p-0.5">
                  {(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStockStatusFilter(st)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                        stockStatusFilter === st
                          ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {st === 'ALL'
                        ? 'All'
                        : st === 'IN_STOCK'
                        ? 'In Stock'
                        : st === 'LOW_STOCK'
                        ? 'Low Stock'
                        : 'Out of Stock'}
                    </button>
                  ))}
                </div>

                {/* Category Dropdown */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-700 focus:border-neutral-900 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'ALL' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/60 text-neutral-500 font-medium">
                    <th className="py-2.5 px-4">SKU / Code</th>
                    <th className="py-2.5 px-4">Product Name & Category</th>
                    <th className="py-2.5 px-4 text-right">Cost</th>
                    <th className="py-2.5 px-4 text-right">Selling Price</th>
                    <th className="py-2.5 px-4 text-right">Margin %</th>
                    <th className="py-2.5 px-4 text-center">Stock Level</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                        No inventory items found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isOutOfStock = p.stock === 0;
                      const isLowStock =
                        p.stock > 0 && p.stock <= (p.minStockAlert || settings.lowStockThreshold);
                      const profitPerUnit = p.sellingPrice - p.costPrice;
                      const marginPct =
                        p.costPrice > 0 ? ((profitPerUnit / p.costPrice) * 100).toFixed(0) : '0';

                      return (
                        <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-neutral-800">
                            {p.sku}
                            {p.barcode && (
                              <span className="block text-[10px] text-neutral-400 font-sans">
                                {p.barcode}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-neutral-900 block">{p.name}</span>
                            <span className="text-[11px] text-neutral-500">{p.category}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-neutral-600 tabular-nums">
                            {formatCurrency(p.costPrice)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-neutral-900 tabular-nums">
                            {formatCurrency(p.sellingPrice)}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                profitPerUnit > 0
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              +{marginPct}% ({formatCurrency(profitPerUnit)})
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <span
                                className={`rounded px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                                  isOutOfStock
                                    ? 'bg-rose-100 text-rose-700'
                                    : isLowStock
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-neutral-100 text-neutral-800'
                                }`}
                              >
                                {p.stock} {p.unit}
                              </span>
                            </div>
                            <span className="block text-[10px] text-neutral-400 mt-0.5">
                              Min limit: {p.minStockAlert || settings.lowStockThreshold}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => onOpenRestock(p.id)}
                                className="rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100 shadow-2xs"
                                title="Quick Restock"
                              >
                                + Restock
                              </button>
                              <button
                                onClick={() => {
                                  setAdjustingProduct(p);
                                  setAdjustQuantity(0);
                                  setAdjustType('ADJUSTMENT');
                                }}
                                className="rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100 shadow-2xs"
                                title="Adjust Stock"
                              >
                                Adjust
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete product ${p.name}?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-1 text-neutral-400 hover:text-rose-600"
                                title="Delete"
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
          </>
        ) : (
          /* Movement Audit Log View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/60 text-neutral-500 font-medium">
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">Movement Type</th>
                  <th className="py-2.5 px-4 text-center">Change</th>
                  <th className="py-2.5 px-4 text-center">Previous &rarr; New</th>
                  <th className="py-2.5 px-4">Note / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {stockMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  stockMovements.map((m) => {
                    const prod = products.find((p) => p.id === m.productId);
                    return (
                      <tr key={m.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-neutral-900">
                          {prod ? prod.name : 'Unknown Product'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              m.type === 'RESTOCK'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.type === 'SALE'
                                ? 'bg-neutral-100 text-neutral-700'
                                : m.type === 'DAMAGE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {m.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold tabular-nums">
                          <span className={m.quantity >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                            {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-neutral-500 tabular-nums">
                          {m.previousStock} &rarr;{' '}
                          <span className="font-semibold text-neutral-800">{m.newStock}</span>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          {m.note || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900">Adjust Inventory Count</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Update physical count for &ldquo;{adjustingProduct.name}&rdquo;. Current count:{' '}
              <span className="font-bold text-neutral-800">{adjustingProduct.stock} {adjustingProduct.unit}</span>.
            </p>

            <form onSubmit={handleConfirmAdjustment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Adjustment Type
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as StockMovementType)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                >
                  <option value="ADJUSTMENT">Physical Audit Count</option>
                  <option value="DAMAGE">Damaged / Spoiled Goods</option>
                  <option value="RETURN">Customer Return</option>
                  <option value="RESTOCK">Supplier Restock Inflow</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Quantity Change (+ to add, - to deduct)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="e.g. -2 or +10"
                  value={adjustQuantity === 0 ? '' : adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none tabular-nums"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  New resulting stock:{' '}
                  <span className="font-semibold text-neutral-800">
                    {Math.max(0, adjustingProduct.stock + adjustQuantity)} {adjustingProduct.unit}
                  </span>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Audit Reason / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dropped in store, monthly inventory count correction"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustQuantity === 0}
                  className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
