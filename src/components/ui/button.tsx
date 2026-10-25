import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'default' | 'outline' | 'ghost';
};

export function Button({ className = '', type = 'button', variant = 'default', ...props }: ButtonProps) {
  return <button data-slot="button" className={`ui-button ${variant} ${className}`} type={type} {...props} />;
}
