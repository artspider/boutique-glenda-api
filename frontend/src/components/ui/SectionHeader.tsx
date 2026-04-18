import type { CSSProperties, ReactNode } from 'react';

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  style?: CSSProperties;
};

export default function SectionHeader({
  title,
  subtitle,
  actions,
  style,
}: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem',
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.18rem' }}>
        <h2
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-extrabold)',
            color: 'var(--color-text-primary)',
          }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              maxWidth: '70ch',
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
