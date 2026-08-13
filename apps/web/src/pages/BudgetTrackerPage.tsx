import { SummaryPanel } from '../components/SummaryPanel';
import { Card } from '../components/ui/Card';

export function BudgetTrackerPage() {
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
          {/* Financial Summary */}
          <section aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="sr-only">
              Financial Summary
            </h2>
            <SummaryPanel />
          </section>

          {/* Add Transaction - Placeholder */}
          <section aria-labelledby="add-transaction-heading">
            <Card>
              <h2 id="add-transaction-heading" className="text-xl font-semibold mb-4">
                Add Transaction
              </h2>
              <p className="text-muted-foreground text-sm">
                Transaction form will be implemented in the next phase.
              </p>
            </Card>
          </section>

          {/* Transactions - Placeholder */}
          <section aria-labelledby="transactions-heading">
            <Card>
              <h2 id="transactions-heading" className="text-xl font-semibold mb-4">
                Transactions
              </h2>
              <p className="text-muted-foreground text-sm">
                Transaction list and filters will be implemented in the next phase.
              </p>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
