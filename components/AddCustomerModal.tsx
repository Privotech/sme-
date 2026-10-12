'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/lib/business-store';
import { X, UserPlus } from 'lucide-react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
  const { addCustomer } = useBusinessStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomer({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-neutral-850" />
            <h3 className="text-base font-bold text-neutral-900">Add Customer Account</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Samuel Adebayo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +1 555-019-2831"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700">Email Address</label>
              <input
                type="email"
                placeholder="e.g. customer@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700">Delivery / Physical Address</label>
            <input
              type="text"
              placeholder="e.g. 14 Market St, Suite 4"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700">Customer Notes / Preferences</label>
            <textarea
              rows={2}
              placeholder="e.g. Trusted customer, pays tab bi-weekly"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
