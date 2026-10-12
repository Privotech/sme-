export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT' | 'SPLIT';
export type SaleStatus = 'COMPLETED' | 'PARTIAL' | 'CREDIT' | 'CANCELLED';
export type OrderStatus = 'NEW' | 'PROCESSING' | 'READY_DISPATCH' | 'DELIVERED' | 'CANCELLED';

export type BusinessNiche =
  | 'FASHION'
  | 'FOOD_PROVISIONS'
  | 'ELECTRONICS'
  | 'PHARMACY'
  | 'COSMETICS'
  | 'GENERAL';

export type ExpenseCategory =
  | 'RENT'
  | 'GENERATOR_FUEL'
  | 'ELECTRICITY_NEPA'
  | 'LOGISTICS_DISPATCH'
  | 'SALARIES'
  | 'SUPPLIES'
  | 'MARKETING'
  | 'MAINTENANCE'
  | 'OTHER';

export type StockMovementType = 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'DAMAGE' | 'RETURN';

export type StaffRole = 'OWNER' | 'MANAGER' | 'CASHIER';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  phone?: string;
  pin?: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  description?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SaleItem {
  id?: string;
  saleId?: string;
  productId?: string | null;
  productName: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string | null;
  customer?: Customer | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  orderStatus?: OrderStatus;
  cashierName?: string;
  notes?: string | null;
  createdAt: string | Date;
  items: SaleItem[];
}

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  totalDebt: number;
  totalSpent: number;
  notes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  sales?: Sale[];
  payments?: CustomerPayment[];
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  customer?: { name: string; phone?: string | null };
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  note?: string | null;
  createdAt: string | Date;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string | Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt: string | Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: { name: string; sku: string };
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number | null;
  note?: string | null;
  createdAt: string | Date;
}

export interface BusinessSetting {
  id: string;
  businessName: string;
  phone: string;
  email: string;
  address: string;
  cityState: string;
  currencySymbol: string;
  currencyCode: string;
  taxRate: number;
  enableTax: boolean;
  receiptFooter: string;
  lowStockThreshold: number;
  activeNiche: BusinessNiche;
  bankDetails: BankDetails;
  staffList: StaffMember[];
  activeStaffId: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface DashboardMetrics {
  todaySales: number;
  todaySalesCount: number;
  monthSales: number;
  monthSalesCount: number;
  monthExpenses: number;
  monthNetProfit: number;
  totalReceivables: number;
  inventoryValuationCost: number;
  inventoryValuationRetail: number;
  lowStockCount: number;
  outOfStockCount: number;
  topSellingProducts: {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  recentSales: Sale[];
  salesTrend: {
    date: string;
    label: string;
    revenue: number;
    profit: number;
  }[];
  debtors: {
    id: string;
    name: string;
    phone?: string | null;
    totalDebt: number;
  }[];
  pendingOrdersCount: number;
}
