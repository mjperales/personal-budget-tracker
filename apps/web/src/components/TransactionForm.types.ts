export interface TransactionFormProps {
  onSuccess: () => void;
}

export interface TransactionFormData {
  date: string;
  description: string;
  amount: string;
  type: 'income' | 'expense';
  category: string;
}

export interface TransactionFormErrors {
  date?: string;
  description?: string;
  amount?: string;
  type?: string;
  category?: string;
}
