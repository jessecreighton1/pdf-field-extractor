import * as React from 'react';
import { cn } from '@/lib/cn';
import type { LoadingSpinnerProps, LoadingSpinnerSize } from './loading-spinner.types';

const sizeClasses: Record<LoadingSpinnerSize, string> = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', className, 'aria-label': ariaLabel = 'Loading...', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        className={cn(
          'animate-spin rounded-full border-bark border-t-transparent',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
    );
  }
);
LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner, sizeClasses };
