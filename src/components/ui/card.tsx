import type { ComponentProps } from 'react';

export function Card({ className = '', ...props }: ComponentProps<'section'>) {
  return <section data-slot="card" className={`ui-card ${className}`} {...props} />;
}

export function CardHeader({ className = '', ...props }: ComponentProps<'header'>) {
  return <header data-slot="card-header" className={`ui-card-header ${className}`} {...props} />;
}

export function CardTitle({ className = '', ...props }: ComponentProps<'h2'>) {
  return <h2 data-slot="card-title" className={`ui-card-title ${className}`} {...props} />;
}

export function CardDescription({ className = '', ...props }: ComponentProps<'p'>) {
  return <p data-slot="card-description" className={`ui-card-description ${className}`} {...props} />;
}

export function CardContent({ className = '', ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={`ui-card-content ${className}`} {...props} />;
}
