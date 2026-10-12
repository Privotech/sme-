'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  Customer,
  Sale,
  Expense,
  StockMovement,
  BusinessSetting,
  CartItem,
  PaymentMethod,
  StockMovementType,
  DashboardMetrics,
  BusinessNiche,
  OrderStatus,
  StaffRole,
  StaffMember,
} from '@/types';
import {
  INITIAL_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  NICHE_PRESETS,
} from './sample-data';

interface BusinessStoreContextType {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  stockMovements: StockMovement[];
  settings: BusinessSetting;
  cart: CartItem[];
  isLoaded: boolean;
  selectedReceiptSale: Sale | null;
  setSelectedReceiptSale: (sale: Sale | null) => void;
  // Current Staff & Role
  currentStaff: StaffMember;
  switchStaff: (staffId: string) => void;
  addStaffMember: (name: string, role: StaffRole, phone?: string) => void;
  // Niche Preset Switcher
  switchNiche: (niche: BusinessNiche) => void;
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  // Sales & Orders
  checkoutSale: (params: {
    customerId?: string | null;
    paymentMethod: PaymentMethod;
    discount?: number;
    paidAmount?: number;
    notes?: string;
    orderStatus?: OrderStatus;
  }) => Sale;
  voidSale: (saleId: string) => void;
  updateOrderStatus: (saleId: string, status: OrderStatus) => void;
  // Products / Inventory
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (params: {
    productId: string;
    quantityDelta: number;
    type: StockMovementType;
    note?: string;
    unitCost?: number;
  }) => void;
  // Customers & Debt Ledger
  addCustomer: (customer: { name: string; phone?: string; email?: string; address?: string; notes?: string }) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  recordCustomerPayment: (customerId: string, amount: number, paymentMethod: PaymentMethod, note?: string) => void;
  // Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  deleteExpense: (id: string) => void;
  // Settings & Utilities
  updateSettings: (updates: Partial<BusinessSetting>) => void;
  formatCurrency: (amount: number | null | undefined) => string;
  generateWhatsAppShareUrl: (sale: Sale) => string;
  metrics: DashboardMetrics;
  resetToDemoData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const BusinessStoreContext = createContext<BusinessStoreContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: 'sme_ng_products_v2',
  CUSTOMERS: 'sme_ng_customers_v2',
  SALES: 'sme_ng_sales_v2',
  EXPENSES: 'sme_ng_expenses_v2',
  MOVEMENTS: 'sme_ng_movements_v2',
  SETTINGS: 'sme_ng_settings_v2',
};

function generateInitialSales(products: Product[], customers: Customer[]): Sale[] {
  const now = Date.now();
  const sales: Sale[] = [];

  const sampleConfigs = [
    {
      hoursAgo: 2,
      custId: customers[0]?.id,
      items: [
        { prod: products[0], qty: 2 },
        { prod: products[1], qty: 1 },
      ],
      method: 'TRANSFER' as PaymentMethod,
      payFull: true,
      orderStatus: 'DELIVERED' as OrderStatus,
      cashier: 'Blessing (Cashier)',
    },
    {
      hoursAgo: 4,
      custId: customers[1]?.id,
      items: [
        { prod: products[1], qty: 1 },
        { prod: products[3], qty: 1 },
      ],
      method: 'CARD' as PaymentMethod,
      payFull: true,
      orderStatus: 'READY_DISPATCH' as OrderStatus,
      cashier: 'Privilege (Owner)',
    },
    {
      hoursAgo: 16,
      custId: customers[2]?.id,
      items: [
        { prod: products[5] || products[0], qty: 1 },
        { prod: products[4] || products[1], qty: 1 },
      ],
      method: 'CREDIT' as PaymentMethod,
      payFull: false,
      orderStatus: 'PROCESSING' as OrderStatus,
      cashier: 'Blessing (Cashier)',
    },
    {
      hoursAgo: 26,
      custId: null,
      items: [
        { prod: products[2] || products[0], qty: 1 },
      ],
      method: 'CASH' as PaymentMethod,
      payFull: true,
      orderStatus: 'DELIVERED' as OrderStatus,
      cashier: 'Blessing (Cashier)',
    },
  ];

  sampleConfigs.forEach((cfg, idx) => {
    const validItems = cfg.items.filter((it) => !!it.prod);
    if (validItems.length === 0) return;

    let subtotal = 0;
    const saleItems = validItems.map((it) => {
      const lineTotal = it.prod.sellingPrice * it.qty;
      subtotal += lineTotal;
      return {
        id: `si-${idx}-${it.prod.id}`,
        productId: it.prod.id,
        productName: it.prod.name,
        quantity: it.qty,
        unitCost: it.prod.costPrice,
        unitPrice: it.prod.sellingPrice,
        subtotal: lineTotal,
      };
    });

    const total = subtotal;
    const paid = cfg.payFull ? total : 0;
    const balanceDue = total - paid;

    sales.push({
      id: `sale-demo-${idx + 1}`,
      invoiceNumber: `INV-${1000 + idx}`,
      customerId: cfg.custId,
      subtotal,
      discount: 0,
      tax: 0,
      total,
      paidAmount: paid,
      balanceDue,
      paymentMethod: cfg.method,
      status: balanceDue > 0 ? 'CREDIT' : 'COMPLETED',
      orderStatus: cfg.orderStatus,
      cashierName: cfg.cashier,
      notes: cfg.payFull ? 'Paid via Bank Transfer' : 'Customer took on store tab with promised transfer',
      createdAt: new Date(now - cfg.hoursAgo * 60 * 60 * 1000).toISOString(),
      items: saleItems,
    });
  });

  return sales;
}

const defaultInitialProducts: Product[] = INITIAL_PRODUCTS.map((p) => ({
  ...p,
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
}));
const defaultInitialCustomers: Customer[] = INITIAL_CUSTOMERS.map((c) => ({
  ...c,
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
}));
const defaultInitialExpenses: Expense[] = INITIAL_EXPENSES.map((e) => ({
  ...e,
  createdAt: '2026-10-01T10:00:00.000Z',
}));
const defaultInitialSales: Sale[] = generateInitialSales(defaultInitialProducts, defaultInitialCustomers);

function getInitialStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function BusinessStoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    getInitialStorage(STORAGE_KEYS.PRODUCTS, defaultInitialProducts)
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    getInitialStorage(STORAGE_KEYS.CUSTOMERS, defaultInitialCustomers)
  );
  const [sales, setSales] = useState<Sale[]>(() =>
    getInitialStorage(STORAGE_KEYS.SALES, defaultInitialSales)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    getInitialStorage(STORAGE_KEYS.EXPENSES, defaultInitialExpenses)
  );
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() =>
    getInitialStorage(STORAGE_KEYS.MOVEMENTS, [])
  );
  const [settings, setSettings] = useState<BusinessSetting>(() =>
    getInitialStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<Sale | null>(null);

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(stockMovements));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error syncing store to localStorage:', e);
    }
  }, [products, customers, sales, expenses, stockMovements, settings]);

  // Current active staff
  const currentStaff = useMemo(() => {
    const found = settings.staffList?.find((s) => s.id === settings.activeStaffId);
    return found || settings.staffList?.[0] || {
      id: 'staff-1',
      name: 'Store Owner',
      role: 'OWNER',
    };
  }, [settings.staffList, settings.activeStaffId]);

  const switchStaff = useCallback((staffId: string) => {
    setSettings((prev) => ({ ...prev, activeStaffId: staffId }));
  }, []);

  const addStaffMember = useCallback((name: string, role: StaffRole, phone?: string) => {
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name,
      role,
      phone,
    };
    setSettings((prev) => ({
      ...prev,
      staffList: [...(prev.staffList || []), newStaff],
    }));
  }, []);

  // Switch Niche Preset
  const switchNiche = useCallback((niche: BusinessNiche) => {
    const preset = NICHE_PRESETS[niche];
    if (!preset) return;

    const newProds: Product[] = preset.products.map((p) => ({
      ...p,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setProducts(newProds);
    setSettings((prev) => ({
      ...prev,
      activeNiche: niche,
      businessName: preset.businessName,
      address: preset.address,
      cityState: preset.cityState,
    }));
    setCart([]);
  }, []);

  // Currency formatter
  const formatCurrency = useCallback(
    (amount: number | null | undefined): string => {
      const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
      return `${settings.currencySymbol}${val.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    },
    [settings.currencySymbol]
  );

  // WhatsApp Order & Receipt Link Generator
  const generateWhatsAppShareUrl = useCallback(
    (sale: Sale): string => {
      const customer = customers.find((c) => c.id === sale.customerId);
      const phoneDigits = customer?.phone?.replace(/[^0-9]/g, '') || '';

      const lines = [
        `*${settings.businessName.toUpperCase()}*`,
        `📍 ${settings.address}`,
        `🧾 *Order Invoice: ${sale.invoiceNumber}*`,
        `📅 ${new Date(sale.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`,
        `👤 Customer: ${customer ? customer.name : 'Valued Customer'}`,
        '--------------------------------',
        '*ITEMS ORDERED:*',
        ...sale.items.map(
          (it) => `• ${it.quantity}x ${it.productName} @ ${formatCurrency(it.unitPrice)} = ${formatCurrency(it.subtotal)}`
        ),
        '--------------------------------',
        `*TOTAL:* ${formatCurrency(sale.total)}`,
        `Paid: ${formatCurrency(sale.paidAmount)} (${sale.paymentMethod})`,
        sale.balanceDue > 0 ? `⚠️ *BALANCE DUE:* ${formatCurrency(sale.balanceDue)}` : '✅ *STATUS: PAID IN FULL*',
        '--------------------------------',
        '*BANK PAYMENT DETAILS:*',
        `Bank: ${settings.bankDetails?.bankName || 'Moniepoint'}`,
        `Account No: ${settings.bankDetails?.accountNumber || '8149201842'}`,
        `Account Name: ${settings.bankDetails?.accountName || settings.businessName}`,
        '--------------------------------',
        settings.receiptFooter || 'Thank you for your business!',
      ];

      const message = encodeURIComponent(lines.join('\n'));
      return phoneDigits
        ? `https://wa.me/${phoneDigits}?text=${message}`
        : `https://wa.me/?text=${message}`;
    },
    [customers, settings, formatCurrency]
  );

  // Cart operations
  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty <= 0) return prev.filter((item) => item.product.id !== product.id);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity, unitPrice: product.sellingPrice }];
    });
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Checkout Sale with Inventory Deduction and Customer Ledger updates
  const checkoutSale = useCallback(
    (params: {
      customerId?: string | null;
      paymentMethod: PaymentMethod;
      discount?: number;
      paidAmount?: number;
      notes?: string;
      orderStatus?: OrderStatus;
    }): Sale => {
      if (cart.length === 0) {
        throw new Error('Cart is empty');
      }

      const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
      const discount = Math.max(0, params.discount || 0);
      const taxableAmount = Math.max(0, subtotal - discount);
      const tax = settings.enableTax ? (taxableAmount * settings.taxRate) / 100 : 0;
      const total = Number((taxableAmount + tax).toFixed(2));

      let paid = typeof params.paidAmount === 'number' ? params.paidAmount : total;
      if (params.paymentMethod === 'CREDIT') {
        paid = 0;
      }
      paid = Math.min(paid, total);
      const balanceDue = Number(Math.max(0, total - paid).toFixed(2));

      const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;

      const saleItems = cart.map((item) => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitCost: item.product.costPrice,
        unitPrice: item.unitPrice,
        subtotal: Number((item.unitPrice * item.quantity).toFixed(2)),
      }));

      const newSale: Sale = {
        id: `sale-${Date.now()}`,
        invoiceNumber: invoiceNum,
        customerId: params.customerId || null,
        subtotal,
        discount,
        tax,
        total,
        paidAmount: paid,
        balanceDue,
        paymentMethod: params.paymentMethod,
        status: balanceDue > 0 ? (paid > 0 ? 'PARTIAL' : 'CREDIT') : 'COMPLETED',
        orderStatus: params.orderStatus || 'NEW',
        cashierName: currentStaff.name,
        notes: params.notes || null,
        createdAt: new Date().toISOString(),
        items: saleItems,
      };

      // 1. Deduct stock for each product & log movements
      const nowIso = new Date().toISOString();
      setProducts((prev) =>
        prev.map((prod) => {
          const inCart = cart.find((c) => c.product.id === prod.id);
          if (inCart) {
            const newStock = Math.max(0, prod.stock - inCart.quantity);
            return { ...prod, stock: newStock, updatedAt: nowIso };
          }
          return prod;
        })
      );

      const movements: StockMovement[] = cart.map((item) => ({
        id: `mov-${Date.now()}-${item.product.id}`,
        productId: item.product.id,
        type: 'SALE',
        quantity: -item.quantity,
        previousStock: item.product.stock,
        newStock: Math.max(0, item.product.stock - item.quantity),
        note: `Sold on invoice ${invoiceNum}`,
        createdAt: nowIso,
      }));
      setStockMovements((prev) => [...movements, ...prev]);

      // 2. Update Customer debt & total spent if customer was selected
      if (params.customerId) {
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === params.customerId) {
              return {
                ...c,
                totalSpent: Number((c.totalSpent + total).toFixed(2)),
                totalDebt: Number((c.totalDebt + balanceDue).toFixed(2)),
                updatedAt: nowIso,
              };
            }
            return c;
          })
        );
      }

      // 3. Record Sale
      setSales((prev) => [newSale, ...prev]);
      setCart([]);
      setSelectedReceiptSale(newSale);
      return newSale;
    },
    [cart, settings.enableTax, settings.taxRate, currentStaff.name]
  );

  const voidSale = useCallback((saleId: string) => {
    setSales((prev) => {
      const target = prev.find((s) => s.id === saleId);
      if (!target) return prev;

      // Restore product stock
      setProducts((currentProds) =>
        currentProds.map((prod) => {
          const item = target.items.find((it) => it.productId === prod.id);
          if (item) {
            return { ...prod, stock: prod.stock + item.quantity };
          }
          return prod;
        })
      );

      // Revert customer debt if applicable
      if (target.customerId && target.balanceDue > 0) {
        setCustomers((currentCusts) =>
          currentCusts.map((c) => {
            if (c.id === target.customerId) {
              return {
                ...c,
                totalDebt: Math.max(0, Number((c.totalDebt - target.balanceDue).toFixed(2))),
                totalSpent: Math.max(0, Number((c.totalSpent - target.total).toFixed(2))),
              };
            }
            return c;
          })
        );
      }

      return prev.map((s) => (s.id === saleId ? { ...s, status: 'CANCELLED' } : s));
    });
  }, []);

  const updateOrderStatus = useCallback((saleId: string, status: OrderStatus) => {
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, orderStatus: status } : s))
    );
  }, []);

  // Products & Inventory Management
  const addProduct = useCallback(
    (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
      const now = new Date().toISOString();
      const newProd: Product = {
        ...productData,
        id: `prod-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setProducts((prev) => [newProd, ...prev]);

      if (newProd.stock > 0) {
        setStockMovements((prev) => [
          {
            id: `mov-${Date.now()}`,
            productId: newProd.id,
            type: 'RESTOCK',
            quantity: newProd.stock,
            previousStock: 0,
            newStock: newProd.stock,
            unitCost: newProd.costPrice,
            note: 'Initial catalog inventory count',
            createdAt: now,
          },
          ...prev,
        ]);
      }
      return newProd;
    },
    []
  );

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((c) => c.product.id !== id));
  }, []);

  const adjustStock = useCallback(
    (params: {
      productId: string;
      quantityDelta: number;
      type: StockMovementType;
      note?: string;
      unitCost?: number;
    }) => {
      const target = products.find((p) => p.id === params.productId);
      if (!target) return;

      const previousStock = target.stock;
      const newStock = Math.max(0, previousStock + params.quantityDelta);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === params.productId
            ? { ...p, stock: newStock, updatedAt: new Date().toISOString() }
            : p
        )
      );

      setStockMovements((prev) => [
        {
          id: `mov-${Date.now()}`,
          productId: params.productId,
          type: params.type,
          quantity: params.quantityDelta,
          previousStock,
          newStock,
          unitCost: params.unitCost ?? target.costPrice,
          note: params.note || `${params.type} adjustment`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [products]
  );

  // Customer Management & Debt Settling
  const addCustomer = useCallback(
    (customerData: { name: string; phone?: string; email?: string; address?: string; notes?: string }): Customer => {
      const now = new Date().toISOString();
      const newCust: Customer = {
        ...customerData,
        id: `cust-${Date.now()}`,
        totalDebt: 0,
        totalSpent: 0,
        createdAt: now,
        updatedAt: now,
      };
      setCustomers((prev) => [newCust, ...prev]);
      return newCust;
    },
    []
  );

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    );
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const recordCustomerPayment = useCallback(
    (customerId: string, amount: number, paymentMethod: PaymentMethod, note?: string) => {
      if (amount <= 0) return;
      const now = new Date().toISOString();

      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === customerId) {
            const updatedDebt = Math.max(0, Number((c.totalDebt - amount).toFixed(2)));
            return {
              ...c,
              totalDebt: updatedDebt,
              updatedAt: now,
            };
          }
          return c;
        })
      );
    },
    []
  );

  // Expenses
  const addExpense = useCallback(
    (expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense => {
      const newExpense: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setExpenses((prev) => [newExpense, ...prev]);
      return newExpense;
    },
    []
  );

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<BusinessSetting>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset to sample data
  const resetToDemoData = useCallback(() => {
    const initProds = INITIAL_PRODUCTS.map((p) => ({
      ...p,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const initCusts = INITIAL_CUSTOMERS.map((c) => ({
      ...c,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const initExps = INITIAL_EXPENSES.map((e) => ({
      ...e,
      createdAt: new Date().toISOString(),
    }));
    const initSales = generateInitialSales(initProds, initCusts);

    setProducts(initProds);
    setCustomers(initCusts);
    setExpenses(initExps);
    setSales(initSales);
    setStockMovements([]);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
  }, []);

  // Export JSON backup
  const exportDataJSON = useCallback(() => {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings,
      products,
      customers,
      sales,
      expenses,
      stockMovements,
    };
    return JSON.stringify(backup, null, 2);
  }, [settings, products, customers, sales, expenses, stockMovements]);

  // Import JSON backup
  const importDataJSON = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.products)) setProducts(parsed.products);
      if (Array.isArray(parsed.customers)) setCustomers(parsed.customers);
      if (Array.isArray(parsed.sales)) setSales(parsed.sales);
      if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
      if (Array.isArray(parsed.stockMovements)) setStockMovements(parsed.stockMovements);
      if (parsed.settings && typeof parsed.settings === 'object') setSettings(parsed.settings);
      return true;
    } catch (e) {
      console.error('Failed to import JSON backup:', e);
      return false;
    }
  }, []);

  // Computed metrics
  const metrics: DashboardMetrics = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const activeSales = sales.filter((s) => s.status !== 'CANCELLED');

    // Today's metrics
    const todaySalesList = activeSales.filter(
      (s) => new Date(s.createdAt).getTime() >= startOfToday
    );
    const todaySales = todaySalesList.reduce((acc, s) => acc + s.total, 0);
    const todaySalesCount = todaySalesList.length;

    // Month metrics
    const monthSalesList = activeSales.filter(
      (s) => new Date(s.createdAt).getTime() >= startOfMonth
    );
    const monthSales = monthSalesList.reduce((acc, s) => acc + s.total, 0);
    const monthSalesCount = monthSalesList.length;

    const monthCogs = monthSalesList.reduce((acc, sale) => {
      const saleCost = sale.items.reduce((itemAcc, item) => itemAcc + item.unitCost * item.quantity, 0);
      return acc + saleCost;
    }, 0);

    const monthExpenses = expenses
      .filter((e) => new Date(e.date).getTime() >= startOfMonth)
      .reduce((acc, e) => acc + e.amount, 0);

    const monthGrossProfit = monthSales - monthCogs;
    const monthNetProfit = monthGrossProfit - monthExpenses;

    // Customer receivables
    const totalReceivables = customers.reduce((acc, c) => acc + (c.totalDebt || 0), 0);

    // Stock valuations
    const inventoryValuationCost = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);
    const inventoryValuationRetail = products.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0);

    const lowStockThreshold = settings.lowStockThreshold || 5;
    const lowStockCount = products.filter(
      (p) => p.stock > 0 && p.stock <= (p.minStockAlert || lowStockThreshold)
    ).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;

    // Top selling
    const productSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();
    activeSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = productSalesMap.get(item.productId || item.productName) || {
          name: item.productName,
          qty: 0,
          revenue: 0,
        };
        existing.qty += item.quantity;
        existing.revenue += item.subtotal;
        productSalesMap.set(item.productId || item.productName, existing);
      });
    });

    const topSellingProducts = Array.from(productSalesMap.entries())
      .map(([id, data]) => ({
        productId: id,
        productName: data.name,
        totalQuantity: data.qty,
        totalRevenue: data.revenue,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    // Sales trend
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStart = d.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      const daySales = activeSales.filter((s) => {
        const t = new Date(s.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      });
      const revenue = daySales.reduce((acc, s) => acc + s.total, 0);
      const cost = daySales.reduce((acc, s) => {
        return acc + s.items.reduce((iAcc, item) => iAcc + item.unitCost * item.quantity, 0);
      }, 0);
      const profit = revenue - cost;

      salesTrend.push({
        date: d.toISOString().slice(0, 10),
        label: dayLabel,
        revenue: Number(revenue.toFixed(2)),
        profit: Number(profit.toFixed(2)),
      });
    }

    const debtors = customers
      .filter((c) => c.totalDebt > 0)
      .sort((a, b) => b.totalDebt - a.totalDebt)
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        totalDebt: c.totalDebt,
      }));

    const pendingOrdersCount = activeSales.filter(
      (s) => s.orderStatus === 'NEW' || s.orderStatus === 'PROCESSING' || s.orderStatus === 'READY_DISPATCH'
    ).length;

    return {
      todaySales,
      todaySalesCount,
      monthSales,
      monthSalesCount,
      monthExpenses,
      monthNetProfit,
      totalReceivables,
      inventoryValuationCost,
      inventoryValuationRetail,
      lowStockCount,
      outOfStockCount,
      topSellingProducts,
      recentSales: activeSales.slice(0, 8),
      salesTrend,
      debtors,
      pendingOrdersCount,
    };
  }, [sales, expenses, products, customers, settings.lowStockThreshold]);

  return (
    <BusinessStoreContext.Provider
      value={{
        products,
        customers,
        sales,
        expenses,
        stockMovements,
        settings,
        cart,
        isLoaded: true,
        selectedReceiptSale,
        setSelectedReceiptSale,
        currentStaff,
        switchStaff,
        addStaffMember,
        switchNiche,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        checkoutSale,
        voidSale,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordCustomerPayment,
        addExpense,
        deleteExpense,
        updateSettings,
        formatCurrency,
        generateWhatsAppShareUrl,
        metrics,
        resetToDemoData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </BusinessStoreContext.Provider>
  );
}

export function useBusinessStore() {
  const context = useContext(BusinessStoreContext);
  if (!context) {
    throw new Error('useBusinessStore must be used within a BusinessStoreProvider');
  }
  return context;
}
