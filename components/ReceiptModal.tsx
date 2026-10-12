'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/lib/business-store';
import { Printer, X, Check, Copy, Send, Building } from 'lucide-react';
import { Sale } from '@/types';
import { FormattedDateTime } from '@/components/FormattedDate';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export function ReceiptModal({ sale, onClose }: ReceiptModalProps) {
  const { settings, customers, formatCurrency, generateWhatsAppShareUrl } = useBusinessStore();
  const [copied, setCopied] = useState(false);

  if (!sale) return null;

  const customer = customers.find((c) => c.id === sale.customerId);
  const waUrl = generateWhatsAppShareUrl(sale);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textLines = [
      settings.businessName.toUpperCase(),
      settings.address,
      `Phone: ${settings.phone}`,
      '--------------------------------',
      `INVOICE: ${sale.invoiceNumber}`,
      `DATE: ${new Date(sale.createdAt).toLocaleString()}`,
      `CUSTOMER: ${customer ? customer.name : 'Walk-in Customer'}`,
      `STAFF: ${sale.cashierName || 'Cashier'}`,
      '--------------------------------',
      ...sale.items.map(
        (it) => `${it.quantity}x ${it.productName} @ ${formatCurrency(it.unitPrice)} = ${formatCurrency(it.subtotal)}`
      ),
      '--------------------------------',
      `SUBTOTAL: ${formatCurrency(sale.subtotal)}`,
      sale.discount > 0 ? `DISCOUNT: -${formatCurrency(sale.discount)}` : null,
      sale.tax > 0 ? `VAT: +${formatCurrency(sale.tax)}` : null,
      `TOTAL: ${formatCurrency(sale.total)}`,
      `PAID (${sale.paymentMethod}): ${formatCurrency(sale.paidAmount)}`,
      sale.balanceDue > 0 ? `BALANCE DUE: ${formatCurrency(sale.balanceDue)}` : null,
      '--------------------------------',
      `BANK: ${settings.bankDetails?.bankName} - ${settings.bankDetails?.accountNumber}`,
      `ACCOUNT NAME: ${settings.bankDetails?.accountName}`,
      '--------------------------------',
      settings.receiptFooter,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(textLines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-4 py-3 no-print">
          <span className="text-xs font-bold text-neutral-800">Sales Invoice &amp; Receipt</span>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="overflow-y-auto p-6 bg-white flex-1" id="printable-receipt">
          <div className="text-center">
            <h2 className="text-base font-bold uppercase tracking-tight text-neutral-900">
              {settings.businessName}
            </h2>
            <p className="text-[11px] text-neutral-600 mt-0.5">{settings.address}</p>
            <p className="text-[11px] text-neutral-600">Tel: {settings.phone}</p>
            {settings.email && (
              <p className="text-[10px] text-neutral-400">{settings.email}</p>
            )}
          </div>

          <div className="my-3 border-t border-dashed border-neutral-300" />

          {/* Receipt Info */}
          <div className="space-y-1 text-[11px] text-neutral-700">
            <div className="flex justify-between">
              <span className="text-neutral-500">Invoice No:</span>
              <span className="font-mono font-semibold text-neutral-900">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Date:</span>
              <span suppressHydrationWarning>
                <FormattedDateTime date={sale.createdAt} />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Customer:</span>
              <span className="font-medium text-neutral-900">
                {customer ? customer.name : 'Walk-in Customer'}
              </span>
            </div>
            {sale.cashierName && (
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Attendant:</span>
                <span>{sale.cashierName}</span>
              </div>
            )}
          </div>

          <div className="my-3 border-t border-dashed border-neutral-300" />

          {/* Items Table */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[11px] font-semibold text-neutral-500 pb-1 border-b border-neutral-100">
              <span>Item / Qty</span>
              <span>Total</span>
            </div>

            {sale.items.map((item) => (
              <div key={item.id} className="flex justify-between text-neutral-800">
                <div className="truncate pr-2">
                  <p className="font-medium truncate">{item.productName}</p>
                  <p className="text-[10px] text-neutral-400 tabular-nums">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <span className="font-semibold tabular-nums shrink-0">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="my-3 border-t border-dashed border-neutral-300" />

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span className="tabular-nums font-medium text-neutral-800">
                {formatCurrency(sale.subtotal)}
              </span>
            </div>

            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span className="tabular-nums font-medium">-{formatCurrency(sale.discount)}</span>
              </div>
            )}

            {sale.tax > 0 && (
              <div className="flex justify-between text-neutral-500">
                <span>VAT ({settings.taxRate}%)</span>
                <span className="tabular-nums font-medium text-neutral-800">
                  +{formatCurrency(sale.tax)}
                </span>
              </div>
            )}

            <div className="flex justify-between pt-1 border-t border-neutral-200 text-sm font-bold text-neutral-900">
              <span>TOTAL DUE</span>
              <span className="tabular-nums">{formatCurrency(sale.total)}</span>
            </div>

            <div className="flex justify-between pt-1 text-neutral-600 text-[11px]">
              <span>Amount Paid ({sale.paymentMethod})</span>
              <span className="tabular-nums font-medium">{formatCurrency(sale.paidAmount)}</span>
            </div>

            {sale.balanceDue > 0 && (
              <div className="flex justify-between text-[11px] font-bold text-rose-700">
                <span>Balance Due (Debt Tab)</span>
                <span className="tabular-nums">{formatCurrency(sale.balanceDue)}</span>
              </div>
            )}
          </div>

          {/* Bank Payment Details */}
          {settings.bankDetails && (
            <div className="my-3 rounded bg-neutral-50 p-2 text-[10px] text-neutral-600 border border-neutral-200">
              <span className="font-bold text-neutral-900 block">Bank Transfer Details:</span>
              <p>Bank: <strong className="text-neutral-800">{settings.bankDetails.bankName}</strong></p>
              <p>Account No: <strong className="text-neutral-900 font-mono text-xs">{settings.bankDetails.accountNumber}</strong></p>
              <p>Name: {settings.bankDetails.accountName}</p>
            </div>
          )}

          <div className="my-3 border-t border-dashed border-neutral-300" />

          {/* Footer Note */}
          <div className="text-center text-[10px] text-neutral-500 space-y-2">
            <p>{settings.receiptFooter}</p>
            <div className="pt-1 flex flex-col items-center justify-center">
              <div
                className="h-7 w-40 bg-repeat-x opacity-80"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, #111 0, #111 2px, transparent 2px, transparent 4px, #111 4px, #111 7px, transparent 7px, transparent 9px)',
                }}
              />
              <span className="mt-1 font-mono tracking-widest text-[9px] text-neutral-400">
                {sale.invoiceNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (Excluded from print) */}
        <div className="flex flex-col gap-2 border-t border-neutral-100 bg-neutral-50 p-3 no-print">
          <div className="flex items-center gap-2">
            {/* Direct WhatsApp Share */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-400 bg-emerald-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send on WhatsApp</span>
            </a>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-900 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Slip</span>
            </button>
          </div>

          <button
            onClick={handleCopyText}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-neutral-300 bg-white py-1.5 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-100"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-neutral-500" />
            )}
            <span>{copied ? 'Invoice Text Copied!' : 'Copy Receipt Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
