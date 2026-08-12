import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import * as api from './lib/api';

vi.mock('./lib/api');

function renderApp() {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the app title', () => {
    vi.mocked(api.checkApiHealth).mockResolvedValue({ status: 'ok' });
    renderApp();
    
    expect(screen.getByText('Personal Budget Tracker')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    vi.mocked(api.checkApiHealth).mockImplementation(
      () => new Promise(() => {})
    );
    renderApp();
    
    expect(screen.getByText('Checking connection...')).toBeInTheDocument();
  });

  it('shows connected state when API health check succeeds', async () => {
    vi.mocked(api.checkApiHealth).mockResolvedValue({ status: 'ok' });
    renderApp();
    
    await waitFor(() => {
      expect(screen.getByText('Connected successfully')).toBeInTheDocument();
    });
  });

  it('shows error state when API health check fails', async () => {
    vi.mocked(api.checkApiHealth).mockRejectedValue(new Error('Network error'));
    renderApp();
    
    await waitFor(() => {
      expect(screen.getByText(/Connection failed/)).toBeInTheDocument();
    });
  });
});
