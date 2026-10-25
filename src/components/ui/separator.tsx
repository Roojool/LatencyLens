import type { ComponentProps } from 'react';

type SeparatorProps = Omit<ComponentProps<'div'>, 'role' | 'aria-orientation'> & {
  orientation?: 'horizontal' | 'vertical';
};

export function Separator({ className = '', orientation = 'horizontal', ...props }: SeparatorProps) {
  return <div
    data-slot="separator"
    role="separator"
    aria-orientation={orientation}
    className={`ui-separator ${orientation} ${className}`}
    {...props}
  />;
}
