'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/lib/business-store';
import {
  Settings,
  Store,
  DollarSign,
  Download,
  Upload,
  RotateCcw,
  Check,
  Building,
  User,
  Plus,
  Shield,
} from 'lucide-react';
import { BusinessNiche, StaffRole } from '@/types';

const POPULAR_NIGERIAN_BANKS = [
  'Moniepoint Microfinance Bank',
  'OPay Digital Services',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'Access Bank',
  'United Bank for Africa (UBA)',
  'First Bank of Nigeria',
  'Kuda Microfinance Bank',
  'PalmPay',
  'Stanbic IBTC Bank',
  'Fidelity Bank',
  'Sterling Bank',
  'FCMB',
  'Wema Bank / ALAT',
];

const CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi (GH₵)' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KSh)' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (R)' },
];

export function SettingsView() {
  const {
    settings,
    updateSettings,
    exportDataJSON,
    importDataJSON,
    resetToDemoData,
    addStaffMember,
  } = useBusinessStore();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Business profile
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [cityState, setCityState] = useState(settings.cityState || 'Lagos, Nigeria');
  const [selectedCurrency, setSelectedCurrency] = useState(settings.currencyCode);
  const [enableTax, setEnableTax] = useState(settings.enableTax);
  const [taxRate, setTaxRate] = useState(settings.taxRate.toString());
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold.toString());
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);

  // Bank details
  const [bankName, setBankName] = useState(settings.bankDetails?.bankName || 'Moniepoint Microfinance Bank');
  const [accountNumber, setAccountNumber] = useState(settings.bankDetails?.accountNumber || '');
  const [accountName, setAccountName] = useState(settings.bankDetails?.accountName || '');

  // Add staff inline state
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('CASHIER');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const curr = CURRENCIES.find((c) => c.code === selectedCurrency);
    updateSettings({
      businessName: businessName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      cityState: cityState.trim(),
      currencyCode: selectedCurrency,
      currencySymbol: curr ? curr.symbol : '₦',
      enableTax,
      taxRate: parseFloat(taxRate) || 0,
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
      receiptFooter: receiptFooter.trim(),
      bankDetails: {
        bankName,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    addStaffMember(newStaffName.trim(), newStaffRole, newStaffPhone.trim() || undefined);
    setNewStaffName('');
    setNewStaffPhone('');
    setIsAddingStaff(false);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sme-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJSON(content);
      if (success) {
        setImportStatus('Backup data restored successfully!');
      } else {
        setImportStatus('Failed to parse backup JSON. Please check file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Store className="h-4 w-4 text-neutral-800" />
            <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
              Business Profile &amp; Location
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Business / Brand Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">Store WhatsApp / Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">City &amp; State</label>
              <input
                type="text"
                placeholder="e.g. Lagos, Abuja, Port Harcourt, Kano"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700">Shop Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Nigerian Bank Transfer Details */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Building className="h-4 w-4 text-neutral-800" />
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                Direct Bank Transfer Details
              </h3>
              <p className="text-[11px] text-neutral-500">
                Displayed to customers on checkout, receipts, and WhatsApp invoices for payment verification
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Bank Name</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              >
                {POPULAR_NIGERIAN_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">Account Number</label>
              <input
                type="text"
                maxLength={10}
                required
                placeholder="10-digit NUBAN account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-mono font-bold tracking-wider text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">Account Beneficiary Name</label>
              <input
                type="text"
                required
                placeholder="Name on bank account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax Configuration */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <DollarSign className="h-4 w-4 text-neutral-800" />
            <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
              Currency &amp; Receipt Configuration
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Store Currency</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Low Stock Threshold (Alert limit)
              </label>
              <input
                type="number"
                min="1"
                required
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none tabular-nums"
              />
            </div>

            <div className="sm:col-span-2 rounded-lg border border-neutral-100 bg-neutral-50/70 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-neutral-900">
                    Enable Value Added Tax (VAT)
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Standard Nigerian VAT is 7.5%
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enableTax}
                  onChange={(e) => setEnableTax(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </div>

              {enableTax && (
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-xs text-neutral-700">VAT Rate (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-24 rounded border border-neutral-300 bg-white px-2 py-1 text-xs focus:border-neutral-900 focus:outline-none tabular-nums"
                  />
                  <span className="text-xs text-neutral-500">% added to invoices</span>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700">
                Receipt Footer / Return Policy
              </label>
              <textarea
                rows={2}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Check className="h-4 w-4" />
                Settings saved successfully!
              </span>
            )}
          </div>
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800"
          >
            Save All Settings
          </button>
        </div>
      </form>

      {/* Staff Accounts Management */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-neutral-800" />
            <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
              Staff Accounts &amp; Permissions
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingStaff(!isAddingStaff)}
            className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Staff</span>
          </button>
        </div>

        {isAddingStaff && (
          <form onSubmit={handleAddStaffSubmit} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs space-y-3">
            <h4 className="font-semibold text-neutral-800">New Staff Attendant</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-neutral-600">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tunde (Sales)"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-neutral-600">Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
                  className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1 text-neutral-900"
                >
                  <option value="CASHIER">Cashier (POS &amp; Sales only)</option>
                  <option value="MANAGER">Manager (Inventory &amp; Sales)</option>
                  <option value="OWNER">Store Owner (Super Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600">Phone</label>
                <input
                  type="tel"
                  placeholder="+234 80..."
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1 text-neutral-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingStaff(false)}
                className="rounded border border-neutral-300 px-3 py-1 text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-neutral-900 px-4 py-1 font-semibold text-white hover:bg-neutral-800"
              >
                Save Attendant
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-neutral-100">
          {settings.staffList?.map((staff) => (
            <div key={staff.id} className="flex items-center justify-between py-2 text-xs">
              <div>
                <span className="font-semibold text-neutral-900">{staff.name}</span>
                {staff.phone && (
                  <span className="ml-2 text-neutral-400 font-mono text-[11px]">{staff.phone}</span>
                )}
              </div>
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-700">
                {staff.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Reset Section */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold tracking-tight text-neutral-900 border-b border-neutral-100 pb-3">
          Data Management &amp; Backup
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-semibold text-neutral-900">Export Store Backup</h4>
              <p className="mt-1 text-[11px] text-neutral-500">
                Download a JSON backup containing all inventory, sales, customer debts, and expenses.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white py-1.5 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50"
            >
              <Download className="h-3.5 w-3.5 text-neutral-600" />
              <span>Download Backup</span>
            </button>
          </div>

          <div className="rounded-lg border border-neutral-200 p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-semibold text-neutral-900">Restore Backup</h4>
              <p className="mt-1 text-[11px] text-neutral-500">
                Upload a previously exported business JSON file to restore records.
              </p>
            </div>
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white py-1.5 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50">
              <Upload className="h-3.5 w-3.5 text-neutral-600" />
              <span>Upload Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="rounded-lg border border-neutral-200 p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-semibold text-neutral-900">Reset Demo Data</h4>
              <p className="mt-1 text-[11px] text-neutral-500">
                Restores starter catalog and transactions for testing and product evaluation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    'Reset store data to sample presets? This will reload the Nigerian demo store.'
                  )
                ) {
                  resetToDemoData();
                  alert('Demo store data restored successfully!');
                }
              }}
              className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/50 py-1.5 text-xs font-medium text-rose-800 shadow-2xs hover:bg-rose-100"
            >
              <RotateCcw className="h-3.5 w-3.5 text-rose-700" />
              <span>Restore Demo Data</span>
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-700">
            {importStatus}
          </div>
        )}
      </div>
    </div>
  );
}
