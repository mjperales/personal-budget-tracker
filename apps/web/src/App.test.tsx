import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import * as api from './lib/api';

vi.mock('./lib/api');

describe('App', () => {
  it('renders the budget tracker page', () => {
    vi.mocked(api.fetchSummary).mockResolvedValue({
      income: 0,
      expenses: 0,
      balance: 0,
    });

    render(<App />);
    
    expect(screen.getByRole('heading', { level: 1, name: /personal budget tracker/i })).toBeInTheDocument();
  });
});
