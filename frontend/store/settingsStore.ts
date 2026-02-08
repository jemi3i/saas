
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BusinessSettings } from '../types';

interface SettingsState {
  settings: BusinessSettings;
  updateSettings: (data: Partial<BusinessSettings>) => void;
}

// Fix: Added missing 'currency' and 'dataSovereigntyTunisia' properties to match BusinessSettings interface
const DEFAULT_SETTINGS: BusinessSettings = {
  name: 'Nova AI Solutions',
  taxId: 'US-99-1234567',
  address: '123 Innovation Way, San Francisco, CA 94103',
  invoicePrefix: 'INV-',
  defaultTaxRate: 19,
  currency: 'TND',
  emailNotifications: true,
  language: 'en',
  logo: 'https://picsum.photos/seed/nova-logo/200/200',
  dataSovereigntyTunisia: true
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (data) => set((state) => ({
        settings: { ...state.settings, ...data }
      })),
    }),
    {
      name: 'business-settings',
    }
  )
);
