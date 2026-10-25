import type { ComponentProps } from 'react';

type BadgeProps = ComponentProps<'span'> & {
  variant?: 'neutral' | 'success' | 'warning';
};

export function Badge({ className = '', variant = 'neutral', ...props }: BadgeProps) {
  return <span data-slot="badge" className={`ui-badge ${variant} ${className}`} {...props} />;
}
