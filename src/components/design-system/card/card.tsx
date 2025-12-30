import * as React from 'react';
import { cn } from '@/lib/cn';
import type {
  CardProps,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps,
} from './card.types';

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 'data-testid': testId, className, ...props }, ref) => (
    <div
      ref={ref}
      data-testid={testId}
      className={cn(
        'bg-surface rounded-2xl p-6',
        'shadow-sm shadow-bark/5',
        'border border-bark/5',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ 'data-testid': testId, className, ...props }, ref) => (
    <div
      ref={ref}
      data-testid={testId}
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ 'data-testid': testId, className, ...props }, ref) => (
    <div
      ref={ref}
      data-testid={testId}
      className={cn('py-2', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ 'data-testid': testId, className, ...props }, ref) => (
    <div
      ref={ref}
      data-testid={testId}
      className={cn('flex items-center pt-4', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
