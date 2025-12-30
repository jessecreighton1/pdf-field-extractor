import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import type { buttonVariants } from './button.styles';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Test identifier for debugging and testing
   */
  'data-testid'?: string;

  /**
   * Render as a child element (for link styling)
   * @default false
   */
  asChild?: boolean;
}

export type ButtonVariant = NonNullable<ButtonProps['variant']>;
export type ButtonSize = NonNullable<ButtonProps['size']>;
