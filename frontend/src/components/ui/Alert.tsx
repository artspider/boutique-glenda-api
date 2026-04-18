import type { CSSProperties, ReactNode } from 'react';

type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export type AlertProps = {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  style?: CSSProperties;
};

const toneStyleMap: Record<AlertTone, CSSProperties> = {
  info: {
    background: 'var(--color-info-bg)',
    border: '1px solid var(--color-info-border)',
    color: 'var(--color-info-text)',
  },
  success: {
    background: 'var(--color-success-bg)',
    border: '1px solid var(--color-success-border)',
    color: 'var(--color-success-text)',
  },
  warning: {
    background: 'var(--color-warning-bg)',
    border: '1px solid var(--color-warning-border)',
    color: 'var(--color-warning-text)',
  },
  danger: {
    background: 'var(--color-danger-bg)',
    border: '1px solid var(--color-danger-border)',
    color: 'var(--color-danger-text)',
  },
};

export default function Alert({
  tone = 'info',
  title,
  children,
  style,
}: AlertProps) {
  return (
    <div
      role="status"
      style={{
        borderRadius: 'var(--radius-md)',
        padding: '0.65rem 0.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        ...toneStyleMap[tone],
        ...style,
      }}
    >
      {title ? (
        <strong
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-extrabold)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          {title}
        </strong>
      ) : null}
      <span
        style={{
          fontSize: 'var(--font-size-xs)',
          lineHeight: 'var(--line-height-normal)',
        }}
      >
        {children}
      </span>
    </div>
  );
}
