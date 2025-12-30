import * as React from 'react';
import { cn } from '@/lib/cn';
import type { InputProps, LabelProps, SelectProps } from './input.types';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 'data-testid': testId, className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-testid={testId}
      className={cn(
        'flex h-10 w-full rounded-lg px-3 py-2',
        'bg-surface border border-bark/20',
        'text-bark text-sm',
        'placeholder:text-bark/40',
        'focus:outline-none focus:ring-2 focus:ring-bark focus:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ 'data-testid': testId, className, ...props }, ref) => (
    <label
      ref={ref}
      data-testid={testId}
      className={cn(
        'text-sm font-medium text-bark',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 'data-testid': testId, className, children, ...props }, ref) => (
    <select
      ref={ref}
      data-testid={testId}
      className={cn(
        'flex h-10 w-full rounded-lg px-3 py-2',
        'bg-surface border border-bark/20',
        'text-bark text-sm',
        'focus:outline-none focus:ring-2 focus:ring-bark focus:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all duration-200',
        'appearance-none cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

export { Input, Label, Select };
