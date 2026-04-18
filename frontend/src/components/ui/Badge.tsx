import type { CSSProperties, ReactNode } from 'react';

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
  style?: CSSProperties;
};

const toneStyleMap: Record<BadgeTone, CSSProperties> = {
  neutral: {
    background: 'var(--color-surface-100)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-surface-200)',
  },
  info: {
    background: 'var(--color-info-bg)',
    color: 'var(--color-info-text)',
    border: '1px solid var(--color-info-border)',
  },
  success: {
    background: 'var(--color-success-bg)',
    color: 'var(--color-success-text)',
    border: '1px solid var(--color-success-border)',
  },
  warning: {
    background: 'var(--color-warning-bg)',
    color: 'var(--color-warning-text)',
    border: '1px solid var(--color-warning-border)',
  },
  danger: {
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger-text)',
    border: '1px solid var(--color-danger-border)',
  },
};

export default function Badge({ tone = 'neutral', children, style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--font-size-2xs)',
        fontWeight: 'var(--font-weight-bold)',
        lineHeight: '1',
        whiteSpace: 'nowrap',
        padding: '0.25rem 0.5rem',
        ...toneStyleMap[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
