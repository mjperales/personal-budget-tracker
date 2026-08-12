import { useEffect, useState } from 'react';
import { checkApiHealth } from './lib/api';

function App() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkApiHealth()
      .then(() => {
        setApiStatus('connected');
        setError(null);
      })
      .catch((err) => {
        setApiStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to connect to API');
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-600 mb-2">
            Personal Budget Tracker
          </h1>
          <p className="text-muted-foreground">
            Take control of your finances
          </p>
        </header>

        <main>
          <div className="max-w-md mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    apiStatus === 'connected'
                      ? 'bg-green-500'
                      : apiStatus === 'error'
                      ? 'bg-red-500'
                      : 'bg-yellow-500 animate-pulse'
                  }`}
                  aria-label={`API status: ${apiStatus}`}
                />
                <h2 className="text-lg font-semibold">API Status</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {apiStatus === 'loading' && 'Checking connection...'}
                {apiStatus === 'connected' && 'Connected successfully'}
                {apiStatus === 'error' && `Connection failed: ${error}`}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
