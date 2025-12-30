import * as React from 'react';
import { cn } from '@/lib/cn';
import { buttonVariants } from './button.styles';
import type { ButtonProps } from './button.types';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      'data-testid': testId,
      className,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref
  ) => {
    // Note: asChild pattern would require @radix-ui/react-slot
    // For now, we render a standard button
    return (
      <button
        ref={ref}
        data-testid={testId}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
