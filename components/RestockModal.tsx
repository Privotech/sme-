'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/lib/business-store';
import { X, PackagePlus } from 'lucide-react';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductId?: string;
}

export function RestockModal({
  isOpen,
  onClose,
  defaultProductId,
}: RestockModalProps) {
  const { products, adjustStock, settings } = useBusinessStore();

  const initialProdId = defaultProductId || products[0]?.id || '';
  const [selectedProdId, setSelectedProdId] = useState(initialProdId);
  const [quantity, setQuantity] = useState('20');
  const [customCost, setCustomCost] = useState<string | null>(null);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const activeId = selectedProdId || initialProdId;
  const targetProd = products.find((p) => p.id === activeId);
  const displayedCost =
    customCost !== null ? customCost : targetProd ? targetProd.costPrice.toString() : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (!activeId || isNaN(qty) || qty <= 0) return;

    adjustStock({
      productId: activeId,
      quantityDelta: qty,
      type: 'RESTOCK',
      unitCost: parseFloat(displayedCost) || (targetProd ? targetProd.costPrice : 0),
      note: note.trim() || 'Supplier inventory restock',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-neutral-800" />
            <h3 className="text-base font-bold text-neutral-900">Receive Inventory Restock</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700">Select Product</label>
            <select
              value={activeId}
              onChange={(e) => {
                setSelectedProdId(e.target.value);
                setCustomCost(null);
              }}
              className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - Current Stock: {p.stock} {p.unit}
                </option>
              ))}
            </select>
          </div>

          {targetProd && (
            <div className="rounded-lg bg-neutral-50 p-2.5 text-[11px] text-neutral-600 flex justify-between">
              <span>
                Current Stock:{' '}
                <strong className="text-neutral-900">
                  {targetProd.stock} {targetProd.unit}
                </strong>
              </span>
              <span>
                Reorder Limit:{' '}
                <strong className="text-neutral-900">
                  {targetProd.minStockAlert || settings.lowStockThreshold}
                </strong>
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700">Quantity Added</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none tabular-nums font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700">
                Unit Cost ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={displayedCost}
                onChange={(e) => setCustomCost(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700">Supplier Note / Invoice Ref</label>
            <input
              type="text"
              placeholder="e.g. Apex Wholesale Invoice #8829"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
              Confirm Restock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
