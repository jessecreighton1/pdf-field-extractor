import * as React from 'react';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Test identifier for debugging and testing
   */
  'data-testid'?: string;
}

export interface HeadingProps extends TypographyProps {
  /**
   * Render as a different element
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p';
}

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Test identifier for debugging and testing
   */
  'data-testid'?: string;
}
