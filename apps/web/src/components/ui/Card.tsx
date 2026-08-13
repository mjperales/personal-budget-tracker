import { cn } from '@/lib/utils';
import type { CardProps } from './Card.types';

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div 
      className={cn('bg-card border border-border rounded-lg p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}
