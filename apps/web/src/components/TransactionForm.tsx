import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { createTransaction } from '../lib/api';
import { Card } from './ui/Card';
import type { TransactionFormProps, TransactionFormData, TransactionFormErrors } from './TransactionForm.types';

const initialFormData: TransactionFormData = {
  date: new Date().toISOString().split('T')[0],
  description: '',
  amount: '',
  type: 'expense',
  category: '',
};

function validateForm(data: TransactionFormData): TransactionFormErrors {
  const errors: TransactionFormErrors = {};

  if (!data.date) {
    errors.date = 'Date is required';
  }

  if (!data.description.trim()) {
    errors.description = 'Description is required';
  }

  const amountNum = parseFloat(data.amount);
  if (!data.amount || isNaN(amountNum) || amountNum <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!data.type || (data.type !== 'income' && data.type !== 'expense')) {
    errors.type = 'Type must be income or expense';
  }

  if (!data.category.trim()) {
    errors.category = 'Category is required';
  }

  return errors;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>(initialFormData);
  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const transaction = await createTransaction({
        date: formData.date,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category.trim(),
      });

      toast.success(`"${transaction.description}" was added successfully.`);
      setFormData(initialFormData);
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add transaction';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TransactionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">
            Date <span className="text-destructive" aria-label="required">*</span>
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'date-error' : undefined}
          />
          {errors.date && (
            <p id="date-error" className="text-sm text-destructive mt-1" role="alert">
              {errors.date}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description <span className="text-destructive" aria-label="required">*</span>
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <p id="description-error" className="text-sm text-destructive mt-1" role="alert">
              {errors.description}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Amount <span className="text-destructive" aria-label="required">*</span>
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
          />
          {errors.amount && (
            <p id="amount-error" className="text-sm text-destructive mt-1" role="alert">
              {errors.amount}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">
            Type <span className="text-destructive" aria-label="required">*</span>
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value as 'income' | 'expense')}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.type}
            aria-describedby={errors.type ? 'type-error' : undefined}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          {errors.type && (
            <p id="type-error" className="text-sm text-destructive mt-1" role="alert">
              {errors.type}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category <span className="text-destructive" aria-label="required">*</span>
          </label>
          <input
            type="text"
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? 'category-error' : undefined}
          />
          {errors.category && (
            <p id="category-error" className="text-sm text-destructive mt-1" role="alert">
              {errors.category}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md font-semibold text-base hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
        >
          {isSubmitting ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </Card>
  );
}
