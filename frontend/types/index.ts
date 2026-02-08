export enum Role {
  PLATFORM_ADMIN = 'platform_admin',
  BUSINESS_OWNER = 'business_owner',
  BUSINESS_ADMIN = 'business_admin',
  ACCOUNTANT = 'accountant',
  TEAM_MEMBER = 'team_member',
  CLIENT_EXTERNAL = 'client_external',
}

export type EnterpriseStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface Enterprise {
  id: string;
  name: string;
  taxId: string;
  ownerId: string;
  status: EnterpriseStatus;
  createdAt: string;
  country: string; // PDF requirement: Tunisia compliance often tied to residency
}

export interface Business {
  id: string;
  enterpriseId: string; // Linked to parent enterprise
  name: string;
  logo?: string;
  address: string;
  taxId: string;
  currency: string;
  taxRate: number;
  createdAt: string;
  ownerId: string;
  isCompliant: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  enterpriseId?: string; // Parent enterprise
  avatar?: string;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';
export type PermissionResource =
  | 'invoices'
  | 'expenses'
  | 'clients'
  | 'team'
  | 'reports'
  | 'settings'
  | 'admin_panel';

export interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export interface TeamMember {
  id: string;
  userId: string;
  businessId: string;
  enterpriseId: string;
  role: Role;
  permissions: Permission[];
  invitedAt: string;
  acceptedAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
  details: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export enum InvoiceStatus {
  PAID = 'paid',
  SENT = 'sent',
  PENDING = 'pending',
  OVERDUE = 'overdue',
  DRAFT = 'draft',
}

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ExpenseCategory {
  OFFICE_SUPPLIES = 'office_supplies',
  TRAVEL = 'travel',
  MEALS = 'meals',
  UTILITIES = 'utilities',
  SOFTWARE = 'software',
  HARDWARE = 'hardware',
  MARKETING = 'marketing',
  RENT = 'rent',
  SALARIES = 'salaries',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  PROFESSIONAL_SERVICES = 'professional_services',
  OTHER = 'other',
}

export enum ClientType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  businessId: string;
  clientId: string;
  client?: Client;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
  paidDate?: string;
  createdAt: string;
  updatedAt?: string;
  // Legacy fields for backwards compat
  clientName?: string;
  email?: string;
  amount?: number;
}

export interface Expense {
  id: string;
  businessId: string;
  description: string;
  amount: number;
  category: ExpenseCategory | string;
  vendor?: string;
  date: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  notes?: string;
  approvedById?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
  // Legacy fields
  expenseDate?: string;
  vendorName?: string;
}

export interface Client {
  id: string;
  businessId: string;
  clientType: ClientType;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  totalRevenue?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessSettings {
  name: string;
  logo?: string;
  taxId: string;
  address: string;
  invoicePrefix: string;
  defaultTaxRate: number;
  currency: string;
  emailNotifications: boolean;
  language: string;
  dataSovereigntyTunisia: boolean;
}
