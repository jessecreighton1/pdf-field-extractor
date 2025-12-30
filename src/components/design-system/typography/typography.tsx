import * as React from 'react';
import { cn } from '@/lib/cn';
import type { HeadingProps, ParagraphProps } from './typography.types';

// Heading Components
const TypographyH1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 'data-testid': testId, className, as: Tag = 'h1', ...props }, ref) => (
    <Tag
      ref={ref}
      data-testid={testId}
      className={cn(
        'text-4xl font-medium tracking-tight text-text-primary',
        'lg:text-5xl',
        className
      )}
      {...props}
    />
  )
);
TypographyH1.displayName = 'TypographyH1';

const TypographyH2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 'data-testid': testId, className, as: Tag = 'h2', ...props }, ref) => (
    <Tag
      ref={ref}
      data-testid={testId}
      className={cn(
        'text-3xl font-medium tracking-tight text-text-primary',
        'lg:text-4xl',
        className
      )}
      {...props}
    />
  )
);
TypographyH2.displayName = 'TypographyH2';

const TypographyH3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 'data-testid': testId, className, as: Tag = 'h3', ...props }, ref) => (
    <Tag
      ref={ref}
      data-testid={testId}
      className={cn(
        'text-2xl font-medium tracking-tight text-text-primary',
        className
      )}
      {...props}
    />
  )
);
TypographyH3.displayName = 'TypographyH3';

const TypographyH4 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 'data-testid': testId, className, as: Tag = 'h4', ...props }, ref) => (
    <Tag
      ref={ref}
      data-testid={testId}
      className={cn(
        'text-xl font-medium tracking-tight text-text-primary',
        className
      )}
      {...props}
    />
  )
);
TypographyH4.displayName = 'TypographyH4';

const TypographyH5 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 'data-testid': testId, className, as: Tag = 'h5', ...props }, ref) => (
    <Tag
      ref={ref}
      data-testid={testId}
      className={cn(
        'text-lg font-medium text-text-primary',
        className
      )}
      {...props}
    />
  )
);
TypographyH5.displayName = 'TypographyH5';

// Paragraph Components
const TypographyP = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ 'data-testid': testId, className, ...props }, ref) => (
    <p
      ref={ref}
      data-testid={testId}
      className={cn('text-sm font-normal leading-normal tracking-normal text-text-primary', className)}
      {...props}
    />
  )
);
TypographyP.displayName = 'TypographyP';

const TypographyPBold = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ 'data-testid': testId, className, ...props }, ref) => (
    <p
      ref={ref}
      data-testid={testId}
      className={cn('text-sm font-medium leading-normal tracking-normal text-text-primary', className)}
      {...props}
    />
  )
);
TypographyPBold.displayName = 'TypographyPBold';

const TypographyP2 = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ 'data-testid': testId, className, ...props }, ref) => (
    <p
      ref={ref}
      data-testid={testId}
      className={cn('text-xs font-normal leading-snug tracking-normal text-text-secondary', className)}
      {...props}
    />
  )
);
TypographyP2.displayName = 'TypographyP2';

const TypographyCaption = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ 'data-testid': testId, className, ...props }, ref) => (
    <p
      ref={ref}
      data-testid={testId}
      className={cn('text-xs font-normal leading-snug tracking-normal text-text-tertiary', className)}
      {...props}
    />
  )
);
TypographyCaption.displayName = 'TypographyCaption';

const TypographyMuted = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ 'data-testid': testId, className, ...props }, ref) => (
    <p
      ref={ref}
      data-testid={testId}
      className={cn('text-xs font-normal leading-snug tracking-normal text-text-disabled', className)}
      {...props}
    />
  )
);
TypographyMuted.displayName = 'TypographyMuted';

export {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyH5,
  TypographyP,
  TypographyPBold,
  TypographyP2,
  TypographyCaption,
  TypographyMuted,
};
