
import { create } from 'zustand';
import { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: 'n1',
      type: 'info',
      title: 'Welcome!',
      message: 'Thanks for joining Nova AI Solutions.',
      read: false,
      createdAt: new Date().toISOString()
    }
  ],
  unreadCount: 1,
  addNotification: (notification) => set((state) => {
    const notifications = [notification, ...state.notifications];
    return { 
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    };
  }),
  markAsRead: (id) => set((state) => {
    const notifications = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    return {
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    };
  }),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  clearAll: () => set({ notifications: [], unreadCount: 0 })
}));
