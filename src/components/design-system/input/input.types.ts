import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Test identifier for debugging and testing
   */
  'data-testid'?: string;
}

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Test identifier for debugging and testing
   */
  'data-testid'?: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Test identifier for debugging and testing
   */
  'data-testid'?: string;
}
