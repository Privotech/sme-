'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/lib/business-store';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const { addProduct, formatCurrency, settings } = useBusinessStore();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('General');
  const [unit, setUnit] = useState('pcs');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [minStockAlert, setMinStockAlert] = useState(settings.lowStockThreshold.toString());
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const cost = parseFloat(costPrice) || 0;
  const sell = parseFloat(sellingPrice) || 0;
  const profit = sell - cost;
  const markupPct = cost > 0 ? ((profit / cost) * 100).toFixed(0) : '0';

  const handleGenerateSku = () => {
    const prefix = (category.slice(0, 3) || 'ITM').toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    setSku(`${prefix}-${rand}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalSku = sku.trim() || `SKU-${Date.now().toString().slice(-6)}`;

    addProduct({
      name: name.trim(),
      sku: finalSku,
      barcode: barcode.trim() || undefined,
      category: category.trim() || 'General',
      unit: unit.trim() || 'pcs',
      costPrice: cost,
      sellingPrice: sell,
      stock: parseInt(stock, 10) || 0,
      minStockAlert: parseInt(minStockAlert, 10) || settings.lowStockThreshold,
      description: description.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-base font-bold text-neutral-900">Add New Product</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Organic Rolled Oats (1kg)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="font-semibold text-neutral-700">SKU / Item Code</label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="text-[10px] text-neutral-600 hover:text-neutral-900 hover:underline"
                >
                  Generate
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. GRN-OAT-007"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 font-mono text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700">Barcode (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 7935731907"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 font-mono text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700">Category</label>
              <input
                type="text"
                placeholder="e.g. Beverages, Bakery, Pantry"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700">Unit of Measurement</label>
              <input
                type="text"
                placeholder="e.g. pcs, bag, bottle, kg"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing & Margins */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-3.5 space-y-3">
            <span className="font-semibold text-neutral-800 block">Pricing &amp; Margins</span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-600">Cost Price ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="0.00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block text-neutral-600">Selling Price ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="0.00"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none tabular-nums font-semibold"
                />
              </div>
            </div>

            {/* Margin Calculation Preview */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-200">
              <span className="text-neutral-500">Gross Margin per Unit:</span>
              <span
                className={`font-bold tabular-nums ${
                  profit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {formatCurrency(profit)} ({markupPct}% markup)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700">Initial Stock Quantity</label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700">Low Stock Alert Level</label>
              <input
                type="number"
                min="1"
                required
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Product details, supplier origin, or specifications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-neutral-900 px-4 py-1.5 font-semibold text-white hover:bg-neutral-800"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
