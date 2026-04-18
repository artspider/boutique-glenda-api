import type { CSSProperties, ReactNode } from 'react';

type CardVariant = 'default' | 'soft' | 'outlined';

export type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: CSSProperties;
};

const variantStyleMap: Record<CardVariant, CSSProperties> = {
  default: {
    background: 'var(--color-surface-0)',
    border: '1px solid var(--color-border-soft)',
    boxShadow: 'var(--shadow-sm)',
  },
  soft: {
    background: 'var(--color-surface-50)',
    border: '1px solid var(--color-surface-200)',
    boxShadow: 'none',
  },
  outlined: {
    background: 'var(--color-surface-0)',
    border: '1px solid var(--color-border-strong)',
    boxShadow: 'none',
  },
};

const paddingStyleMap: Record<NonNullable<CardProps['padding']>, CSSProperties> = {
  none: { padding: 0 },
  sm: { padding: '0.65rem' },
  md: { padding: '0.95rem' },
  lg: { padding: '1.25rem' },
};

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
}: CardProps) {
  return (
    <section
      style={{
        borderRadius: 'var(--radius-lg)',
        ...variantStyleMap[variant],
        ...paddingStyleMap[padding],
        ...style,
      }}
    >
      {children}
    </section>
  );
}
