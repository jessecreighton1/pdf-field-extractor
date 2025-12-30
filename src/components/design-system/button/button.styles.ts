import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const variantClasses = {
  default: cn(
    'bg-bark text-sunlight',
    'hover:bg-bark/90',
    'active:bg-bark/80'
  ),
  secondary: cn(
    'bg-sand text-bark',
    'hover:bg-sand/80',
    'active:bg-sand/70',
    'border border-bark/20'
  ),
  outline: cn(
    'bg-transparent text-bark',
    'border-2 border-bark',
    'hover:bg-bark hover:text-sunlight',
    'active:bg-bark/90'
  ),
  ghost: cn(
    'bg-transparent text-bark',
    'hover:bg-bark/10',
    'active:bg-bark/20'
  ),
  accent: cn(
    'bg-sunlight text-bark',
    'hover:bg-sunlight/90',
    'active:bg-sunlight/80'
  ),
} as const;

export const sizeClasses = {
  sm: cn('h-8 px-3 py-1.5 text-sm'),
  md: cn('h-10 px-4 py-2 text-base'),
  lg: cn('h-12 px-6 py-3 text-lg'),
  icon: cn('h-10 w-10 p-2'),
} as const;

export const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center',
    'font-medium rounded-full',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50'
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
