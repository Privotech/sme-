'use client';

import React, { useState, useMemo } from 'react';
import { useBusinessStore } from '@/lib/business-store';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  CreditCard,
  Banknote,
  Building2,
  Clock,
  User,
  ShoppingBag,
  Percent,
  X,
  Receipt,
  UserPlus,
  Copy,
  Check,
  Send,
  Truck,
} from 'lucide-react';
import { PaymentMethod, Product, OrderStatus } from '@/types';

interface PosViewProps {
  onOpenNewCustomer: () => void;
}

export function PosView({ onOpenNewCustomer }: PosViewProps) {
  const {
    products,
    customers,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    checkoutSale,
    formatCurrency,
    settings,
    currentStaff,
  } = useBusinessStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TRANSFER');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('DELIVERED');
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENT'>('FIXED');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [saleNotes, setSaleNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));
      const matchesCat =
        selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const calculatedDiscount = useMemo(() => {
    if (discountValue <= 0) return 0;
    if (discountType === 'PERCENT') {
      return Number(((subtotal * discountValue) / 100).toFixed(2));
    }
    return Math.min(discountValue, subtotal);
  }, [subtotal, discountType, discountValue]);

  const taxableAmount = Math.max(0, subtotal - calculatedDiscount);
  const tax = settings.enableTax ? Number(((taxableAmount * settings.taxRate) / 100).toFixed(2)) : 0;
  const total = Number((taxableAmount + tax).toFixed(2));

  // Change calculator for Cash
  const tenderedNum = parseFloat(amountTendered) || 0;
  const changeDue = Math.max(0, Number((tenderedNum - total).toFixed(2)));

  const handleCopyAccount = () => {
    if (!settings.bankDetails) return;
    const details = `${settings.bankDetails.bankName} - ${settings.bankDetails.accountNumber} (${settings.bankDetails.accountName})`;
    navigator.clipboard.writeText(details);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleCheckout = () => {
    setErrorMessage(null);
    if (cart.length === 0) {
      setErrorMessage('Cart is empty. Please select products to add.');
      return;
    }

    if (paymentMethod === 'CREDIT' && !selectedCustomerId) {
      setErrorMessage('Please select a customer for credit sales so the balance can be assigned to their ledger.');
      return;
    }

    if (paymentMethod === 'CASH' && tenderedNum > 0 && tenderedNum < total) {
      setErrorMessage(`Amount tendered (${formatCurrency(tenderedNum)}) is less than total bill (${formatCurrency(total)}).`);
      return;
    }

    try {
      const paid = paymentMethod === 'CREDIT' ? 0 : total;
      checkoutSale({
        customerId: selectedCustomerId || null,
        paymentMethod,
        discount: calculatedDiscount,
        paidAmount: paid,
        notes: saleNotes,
        orderStatus,
      });

      // Reset
      setAmountTendered('');
      setDiscountValue(0);
      setSaleNotes('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Checkout failed.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
      {/* Left: Product Catalog & Search (7 Cols) */}
      <div className="space-y-4 lg:col-span-7">
        {/* Search & Categories Bar */}
        <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50/50 py-2 pl-9 pr-4 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                }`}
              >
                {cat === 'ALL' ? 'All Items' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-3">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center text-xs text-neutral-400">
              No products found matching &ldquo;{searchQuery}&rdquo;. Try another search or category.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const inStock = p.stock > 0;
              const isLowStock = inStock && p.stock <= (p.minStockAlert || settings.lowStockThreshold);
              const inCartItem = cart.find((c) => c.product.id === p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => inStock && addToCart(p, 1)}
                  className={`group relative flex flex-col justify-between rounded-xl border p-3 text-left transition shadow-xs ${
                    !inStock
                      ? 'border-neutral-200 bg-neutral-100 opacity-60 cursor-not-allowed'
                      : inCartItem
                      ? 'border-neutral-900 bg-neutral-50/60 ring-1 ring-neutral-900 cursor-pointer'
                      : 'border-neutral-200 bg-white hover:border-neutral-400 cursor-pointer active:scale-98'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="truncate">{p.category}</span>
                      <span
                        className={`rounded px-1 text-[10px] font-semibold tabular-nums ${
                          !inStock
                            ? 'bg-rose-100 text-rose-700'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {!inStock ? 'Out' : `${p.stock} ${p.unit}`}
                      </span>
                    </div>

                    <h4 className="mt-1 font-semibold text-xs text-neutral-900 line-clamp-2">
                      {p.name}
                    </h4>
                    <p className="mt-0.5 text-[10px] text-neutral-400 truncate">{p.sku}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="font-bold text-sm text-neutral-900 tabular-nums">
                      {formatCurrency(p.sellingPrice)}
                    </span>

                    {inCartItem ? (
                      <span className="flex h-5 items-center rounded-full bg-neutral-900 px-2 text-[10px] font-bold text-white tabular-nums">
                        {inCartItem.quantity}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-neutral-500 group-hover:text-neutral-900">
                        + Add
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Active Order Cart & Register Checkout (5 Cols) */}
      <div className="space-y-4 lg:col-span-5">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
          {/* Cart Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-neutral-900" />
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                Current Sale
              </h3>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 tabular-nums">
                {cart.reduce((a, c) => a + c.quantity, 0)} items
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Customer Assignment */}
          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              >
                <option value="">Walk-in Customer (No saved profile)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.totalDebt > 0 ? `(Owes ${formatCurrency(c.totalDebt)})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={onOpenNewCustomer}
              className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 shadow-2xs shrink-0"
              title="Add New Customer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="mt-3 max-h-60 overflow-y-auto divide-y divide-neutral-100 pr-1">
            {cart.length === 0 ? (
              <div className="py-10 text-center text-xs text-neutral-400">
                Cart is empty. Tap products to add them to this transaction.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between py-2 text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-semibold text-neutral-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 tabular-nums">
                      {formatCurrency(item.unitPrice)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-neutral-800 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        if (item.quantity < item.product.stock) {
                          updateCartQuantity(item.product.id, item.quantity + 1);
                        }
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="ml-3 flex items-center gap-2 text-right shrink-0">
                    <span className="font-semibold text-neutral-900 tabular-nums w-16">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-neutral-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discount & Order Status */}
          {cart.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Fulfillment Type:</span>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                  className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-800 focus:outline-none"
                >
                  <option value="DELIVERED">Immediate Store Handover</option>
                  <option value="READY_DISPATCH">Dispatch via Rider / Delivery</option>
                  <option value="PROCESSING">Needs Packaging / Tailoring</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Discount:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={discountValue === 0 ? '' : discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-20 rounded border border-neutral-300 px-2 py-1 text-right text-xs focus:border-neutral-900 focus:outline-none tabular-nums"
                  />
                  <button
                    onClick={() => setDiscountType(discountType === 'FIXED' ? 'PERCENT' : 'FIXED')}
                    className="rounded border border-neutral-300 bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-700"
                  >
                    {discountType === 'FIXED' ? settings.currencySymbol : '%'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary Math */}
          {cart.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal:</span>
                <span className="tabular-nums font-medium text-neutral-800">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="tabular-nums font-medium">
                    -{formatCurrency(calculatedDiscount)}
                  </span>
                </div>
              )}

              {settings.enableTax && (
                <div className="flex justify-between text-neutral-500">
                  <span>VAT ({settings.taxRate}%):</span>
                  <span className="tabular-nums font-medium text-neutral-800">
                    {formatCurrency(tax)}
                  </span>
                </div>
              )}

              <div className="flex items-baseline justify-between border-t border-neutral-200 pt-2 text-sm font-bold text-neutral-900">
                <span>Total Due:</span>
                <span className="text-lg tabular-nums text-neutral-900">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          {cart.length > 0 && (
            <div className="mt-4 space-y-2">
              <label className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                Payment Channel
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'TRANSFER', label: 'Bank Transfer', icon: Building2 },
                  { id: 'CARD', label: 'POS Terminal', icon: CreditCard },
                  { id: 'CASH', label: 'Cash', icon: Banknote },
                  { id: 'CREDIT', label: 'Credit Tab', icon: Clock },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center transition ${
                        isSelected
                          ? item.id === 'CREDIT'
                            ? 'border-amber-500 bg-amber-50 text-amber-900 font-semibold'
                            : 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[11px] whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bank Transfer Details Box (Nigerian Special) */}
          {cart.length > 0 && paymentMethod === 'TRANSFER' && settings.bankDetails && (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-800">Transfer To:</span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="flex items-center gap-1 text-[11px] text-neutral-700 hover:text-neutral-900 font-medium"
                >
                  {copiedBank ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedBank ? 'Copied' : 'Copy Acct'}</span>
                </button>
              </div>
              <div className="rounded bg-white p-2 border border-neutral-200 font-mono text-neutral-900">
                <p className="font-bold text-sm">{settings.bankDetails.bankName}</p>
                <p className="text-base font-extrabold tracking-wider">{settings.bankDetails.accountNumber}</p>
                <p className="text-[11px] text-neutral-500 font-sans">{settings.bankDetails.accountName}</p>
              </div>
              <span className="text-[10px] text-neutral-400 block">
                Cashier: Verify alert in bank app before handing over items.
              </span>
            </div>
          )}

          {/* Cash Tender Calculator */}
          {cart.length > 0 && paymentMethod === 'CASH' && (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-800">Cash Received:</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder={total.toString()}
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  className="w-28 rounded border border-neutral-300 bg-white px-2 py-1 text-right text-xs font-semibold focus:border-neutral-900 focus:outline-none tabular-nums"
                />
              </div>

              {tenderedNum > 0 && (
                <div className="flex items-center justify-between border-t border-neutral-200 pt-2">
                  <span className="text-neutral-600">Change Due:</span>
                  <span className="text-sm font-bold text-emerald-700 tabular-nums">
                    {formatCurrency(changeDue)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Credit Sale Warning Notice */}
          {cart.length > 0 && paymentMethod === 'CREDIT' && (
            <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              <p className="font-semibold">Credit Ledger Tab:</p>
              <p className="text-[11px] mt-0.5 text-amber-800">
                This transaction will record a debt of{' '}
                <span className="font-bold tabular-nums">{formatCurrency(total)}</span> on{' '}
                {selectedCustomerId
                  ? customers.find((c) => c.id === selectedCustomerId)?.name
                  : 'the customer'}&apos;s account.
              </p>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* Complete Sale Action */}
          <div className="mt-5">
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold shadow-xs transition ${
                cart.length === 0
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-98'
              }`}
            >
              <Receipt className="h-4 w-4" />
              <span>
                {paymentMethod === 'CREDIT' ? 'Record Credit Sale' : `Complete Sale (${formatCurrency(total)})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
