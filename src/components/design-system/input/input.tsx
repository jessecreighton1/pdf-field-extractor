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
        'flex h-8 w-full rounded-md px-2.5 py-[9px]',
        'bg-background-secondary border border-border-default',
        'text-text-primary text-sm font-normal tracking-normal',
        'placeholder:text-text-tertiary',
        'outline-hidden -outline-offset-1',
        'focus:outline-1 focus:outline-outline-focus focus:border-border-selected',
        'hover:bg-background-secondary-hover',
        'disabled:cursor-not-allowed disabled:bg-background-secondary-disabled disabled:text-text-disabled',
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
        'text-xs font-medium leading-snug tracking-normal text-text-primary',
        'peer-disabled:cursor-not-allowed peer-disabled:text-text-disabled',
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
        'flex h-8 w-full rounded-md px-2.5 py-[9px]',
        'bg-background-secondary border border-border-default',
        'text-text-primary text-sm font-normal tracking-normal',
        'outline-hidden -outline-offset-1',
        'focus:outline-1 focus:outline-outline-focus focus:border-border-selected',
        'hover:bg-background-secondary-hover',
        'disabled:cursor-not-allowed disabled:bg-background-secondary-disabled disabled:text-text-disabled',
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
