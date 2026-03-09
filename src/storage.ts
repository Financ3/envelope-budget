import AsyncStorage from '@react-native-async-storage/async-storage';
import { Envelope, Expense } from './types';

const ENVELOPES_KEY = 'envelopes';
const EXPENSES_KEY = 'expenses';

export async function loadEnvelopes(): Promise<Envelope[]> {
  const raw = await AsyncStorage.getItem(ENVELOPES_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function saveEnvelopes(envelopes: Envelope[]): Promise<void> {
  await AsyncStorage.setItem(ENVELOPES_KEY, JSON.stringify(envelopes));
}

export async function loadExpenses(): Promise<Expense[]> {
  const raw = await AsyncStorage.getItem(EXPENSES_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}
