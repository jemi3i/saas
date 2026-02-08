export enum Role {
  PLATFORM_ADMIN = 'platform_admin',
  BUSINESS_OWNER = 'business_owner',
  BUSINESS_ADMIN = 'business_admin',
  ACCOUNTANT = 'accountant',
  TEAM_MEMBER = 'team_member',
  CLIENT_EXTERNAL = 'client_external',
}

export enum EnterpriseStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
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
