export interface Envelope {
  id: string;
  name: string;
  planned_amount: number;
  spent_amount: number;
  remaining_amount: number;
}

export interface Expense {
  id: string;
  envelope_id: string;
  amount: number;
  note: string;
  timestamp: string;
}
