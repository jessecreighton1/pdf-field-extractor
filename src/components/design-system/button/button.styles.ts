import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const variantClasses = {
  default: cn(
    'bg-background-primary text-text-primary-invert',
    'hover:bg-background-primary-hover hover:shadow-sm',
    'active:bg-background-primary-pressed',
    'disabled:bg-background-primary-disabled'
  ),
  secondary: cn(
    'bg-background-secondary text-text-primary',
    'hover:bg-background-secondary-hover hover:shadow-sm',
    'active:bg-background-secondary-pressed',
    'disabled:bg-background-secondary-disabled disabled:text-text-disabled'
  ),
  outline: cn(
    'border border-border-default bg-transparent text-text-primary',
    'hover:bg-background-tertiary-hover hover:shadow-sm',
    'active:bg-background-tertiary-pressed',
    'disabled:text-text-disabled'
  ),
  ghost: cn(
    'bg-transparent text-text-secondary',
    'hover:bg-background-tertiary-hover hover:text-text-primary',
    'active:bg-background-tertiary-pressed',
    'disabled:text-text-disabled'
  ),
  accent: cn(
    'bg-sunlight text-text-primary',
    'hover:bg-sunlight/90 hover:shadow-sm',
    'active:bg-sunlight/80'
  ),
  destructive: cn(
    'bg-validation-destructive text-text-primary-invert',
    'hover:bg-validation-destructive/90 hover:shadow-sm',
    'active:bg-validation-destructive/80',
    'disabled:bg-validation-destructive-disabled'
  ),
} as const;

export const sizeClasses = {
  sm: cn('h-7 min-w-7 gap-x-1 rounded-md px-2.5 py-2 text-xs font-medium tracking-normal leading-7 [&_svg]:size-3 [&_svg]:stroke-2'),
  md: cn('h-8 min-w-8 gap-x-1 rounded-md px-2.5 py-[9px] text-sm font-medium tracking-normal leading-8 [&_svg]:size-3.5 [&_svg]:stroke-2'),
  lg: cn('h-10 min-w-10 gap-x-1.5 rounded-md px-4 py-2.5 text-base font-medium tracking-normal leading-10 [&_svg]:size-4 [&_svg]:stroke-2'),
  icon: cn('h-8 min-w-8 rounded-md p-2 [&_svg]:size-4'),
} as const;

export const buttonVariants = cva(
  cn(
    'm-0 inline-flex cursor-pointer items-center justify-center whitespace-nowrap',
    'ring-offset-ring-offset-surface',
    'transition-all duration-300',
    'outline-hidden -outline-offset-1',
    'focus:outline-1 focus:outline-outline-focus',
    'disabled:pointer-events-none disabled:cursor-not-allowed'
  ),
  {
    variants: {
      variant: variantClasses,
      size: sizeClasses,
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);
