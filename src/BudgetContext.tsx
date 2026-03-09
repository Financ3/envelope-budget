import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { Envelope, Expense } from './types';
import { loadEnvelopes, loadExpenses, saveEnvelopes, saveExpenses } from './storage';

interface State {
  envelopes: Envelope[];
  expenses: Expense[];
  loaded: boolean;
}

type Action =
  | { type: 'LOAD'; envelopes: Envelope[]; expenses: Expense[] }
  | { type: 'ADD_ENVELOPE'; envelope: Envelope }
  | { type: 'UPDATE_ENVELOPE'; envelope: Envelope }
  | { type: 'DELETE_ENVELOPE'; id: string }
  | { type: 'ADD_EXPENSE'; expense: Expense; updatedEnvelope: Envelope }
  | { type: 'RESET_MONTH' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { envelopes: action.envelopes, expenses: action.expenses, loaded: true };

    case 'ADD_ENVELOPE':
      return { ...state, envelopes: [...state.envelopes, action.envelope] };

    case 'UPDATE_ENVELOPE':
      return {
        ...state,
        envelopes: state.envelopes.map((e) =>
          e.id === action.envelope.id ? action.envelope : e
        ),
      };

    case 'DELETE_ENVELOPE':
      return {
        ...state,
        envelopes: state.envelopes.filter((e) => e.id !== action.id),
        expenses: state.expenses.filter((ex) => ex.envelope_id !== action.id),
      };

    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.expense],
        envelopes: state.envelopes.map((e) =>
          e.id === action.updatedEnvelope.id ? action.updatedEnvelope : e
        ),
      };

    case 'RESET_MONTH':
      return {
        ...state,
        expenses: [],
        envelopes: state.envelopes.map((e) => ({
          ...e,
          spent_amount: 0,
          remaining_amount: e.planned_amount,
        })),
      };

    default:
      return state;
  }
}

interface BudgetContextValue {
  envelopes: Envelope[];
  expenses: Expense[];
  loaded: boolean;
  addEnvelope: (name: string, planned_amount: number) => Promise<void>;
  updateEnvelope: (envelope: Envelope) => Promise<void>;
  deleteEnvelope: (id: string) => Promise<void>;
  subtractExpense: (envelopeId: string, amount: number, note: string) => Promise<void>;
  resetMonth: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    envelopes: [],
    expenses: [],
    loaded: false,
  });

  useEffect(() => {
    (async () => {
      const [envelopes, expenses] = await Promise.all([loadEnvelopes(), loadExpenses()]);
      dispatch({ type: 'LOAD', envelopes, expenses });
    })();
  }, []);

  const addEnvelope = useCallback(
    async (name: string, planned_amount: number) => {
      const envelope: Envelope = {
        id: Date.now().toString(),
        name,
        planned_amount,
        spent_amount: 0,
        remaining_amount: planned_amount,
      };
      dispatch({ type: 'ADD_ENVELOPE', envelope });
      await saveEnvelopes([...state.envelopes, envelope]);
    },
    [state.envelopes]
  );

  const updateEnvelope = useCallback(
    async (envelope: Envelope) => {
      dispatch({ type: 'UPDATE_ENVELOPE', envelope });
      await saveEnvelopes(state.envelopes.map((e) => (e.id === envelope.id ? envelope : e)));
    },
    [state.envelopes]
  );

  const deleteEnvelope = useCallback(
    async (id: string) => {
      dispatch({ type: 'DELETE_ENVELOPE', id });
      await Promise.all([
        saveEnvelopes(state.envelopes.filter((e) => e.id !== id)),
        saveExpenses(state.expenses.filter((ex) => ex.envelope_id !== id)),
      ]);
    },
    [state.envelopes, state.expenses]
  );

  const subtractExpense = useCallback(
    async (envelopeId: string, amount: number, note: string) => {
      const envelope = state.envelopes.find((e) => e.id === envelopeId);
      if (!envelope) return;

      const updatedEnvelope: Envelope = {
        ...envelope,
        spent_amount: envelope.spent_amount + amount,
        remaining_amount: envelope.remaining_amount - amount,
      };
      const expense: Expense = {
        id: Date.now().toString(),
        envelope_id: envelopeId,
        amount,
        note,
        timestamp: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_EXPENSE', expense, updatedEnvelope });

      await Promise.all([
        saveEnvelopes(state.envelopes.map((e) => (e.id === envelopeId ? updatedEnvelope : e))),
        saveExpenses([...state.expenses, expense]),
      ]);
    },
    [state.envelopes, state.expenses]
  );

  const resetMonth = useCallback(async () => {
    const reset = state.envelopes.map((e) => ({
      ...e,
      spent_amount: 0,
      remaining_amount: e.planned_amount,
    }));
    dispatch({ type: 'RESET_MONTH' });
    await Promise.all([saveEnvelopes(reset), saveExpenses([])]);
  }, [state.envelopes]);

  return (
    <BudgetContext.Provider
      value={{
        envelopes: state.envelopes,
        expenses: state.expenses,
        loaded: state.loaded,
        addEnvelope,
        updateEnvelope,
        deleteEnvelope,
        subtractExpense,
        resetMonth,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider');
  return ctx;
}
