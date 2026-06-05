import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'শপিং (Shopping)', icon: 'ShoppingBag', color: '#3b82f6', type: 'expense', isDefault: true },
  { id: '2', name: 'বাসা (Home)', icon: 'Home', color: '#10b981', type: 'expense', isDefault: true },
  { id: '3', name: 'খাবার (Food & Drink)', icon: 'Utensils', color: '#ef4444', type: 'expense', isDefault: true },
  { id: '4', name: 'ভ্রমণ (Trips)', icon: 'Plane', color: '#8b5cf6', type: 'expense', isDefault: true },
  { id: '5', name: 'পরিবহন (Transport)', icon: 'Bus', color: '#f59e0b', type: 'expense', isDefault: true },
  { id: '6', name: 'স্বাস্থ্য (Health & Beauty)', icon: 'Heart', color: '#ec4899', type: 'expense', isDefault: true },
  { id: '7', name: 'খেলাধুলা (Sport)', icon: 'Dumbbell', color: '#06b6d4', type: 'expense', isDefault: true },
  { id: '8', name: 'বাচ্চা (Kids)', icon: 'Baby', color: '#64748b', type: 'expense', isDefault: true },
  { id: '9', name: 'বেতন (Salary)', icon: 'Wallet', color: '#10b981', type: 'income', isDefault: true },
  { id: '10', name: 'উপহার (Gift)', icon: 'Gift', color: '#f43f5e', type: 'income', isDefault: true },
];
