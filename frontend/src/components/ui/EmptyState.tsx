import type { CSSProperties, ReactNode } from 'react';

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  style?: CSSProperties;
};

export default function EmptyState({
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  return (
    <div
      style={{
        border: '1px dashed var(--color-border-strong)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface-50)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
        alignItems: 'flex-start',
        ...style,
      }}
    >
      <h3
        style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-bold)',
        }}
      >
        {title}
      </h3>
      {description ? (
        <p
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          {description}
        </p>
      ) : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}
