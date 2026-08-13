import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies base styles', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-card', 'border', 'border-border', 'rounded-lg', 'p-6');
  });

  it('merges custom className with base styles', () => {
    const { container } = render(
      <Card className="border-destructive">
        <p>Content</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-card', 'border', 'border-destructive', 'rounded-lg', 'p-6');
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
