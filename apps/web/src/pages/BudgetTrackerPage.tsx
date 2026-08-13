import { useState } from 'react';
import { toast } from 'sonner';
import { SummaryPanel } from '../components/SummaryPanel';
import { SpendingInsights } from '../components/SpendingInsights';
import { TransactionHistory } from '../components/TransactionHistory';
import { TransactionForm } from '../components/TransactionForm';
import { DeleteTransactionDialog } from '../components/DeleteTransactionDialog';
import { deleteTransaction, type Transaction } from '../lib/api';

export function BudgetTrackerPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTransactionAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    setIsDeleting(true);

    try {
      await deleteTransaction(transactionToDelete.id);
      toast.success(`"${transactionToDelete.description}" was deleted successfully.`);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete transaction';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Personal Budget Tracker
          </h1>
          <p className="text-muted-foreground">
            Track your income and expenses
          </p>
        </header>

        <main className="space-y-8">
          {/* Financial Summary - Full width */}
          <section aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="sr-only">
              Financial Summary
            </h2>
            <SummaryPanel refreshKey={refreshKey} />
          </section>

          {/* Spending Insights and Form - Side by side on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Spending Insights */}
            <section aria-labelledby="spending-insights-heading">
              <h2 id="spending-insights-heading" className="sr-only">
                Spending Insights
              </h2>
              <SpendingInsights refreshKey={refreshKey} />
            </section>

            {/* Add Transaction Form */}
            <section aria-labelledby="add-transaction-heading">
              <h2 id="add-transaction-heading" className="sr-only">
                Add Transaction
              </h2>
              <TransactionForm onSuccess={handleTransactionAdded} />
            </section>
          </div>

          {/* Transaction History */}
          <section aria-labelledby="transactions-heading">
            <h2 id="transactions-heading" className="sr-only">
              Transaction History
            </h2>
            <TransactionHistory 
              refreshKey={refreshKey} 
              onDeleteClick={handleDeleteClick}
            />
          </section>
        </main>

        <DeleteTransactionDialog
          transaction={transactionToDelete}
          open={deleteDialogOpen}
          onOpenChange={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
