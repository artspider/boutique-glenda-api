import React from 'react';

type SalesSectionTone = 'default' | 'blue' | 'indigo' | 'green' | 'amber' | 'accent';

type SalesSectionCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  tone?: SalesSectionTone;
};

const toneStyles: Record<
  SalesSectionTone,
  {
    containerBackground: string;
    containerBorder: string;
    headerBackground: string;
    titleColor: string;
    subtitleColor: string;
  }
> = {
  default: {
    containerBackground: '#ffffff',
    containerBorder: '#e5e7eb',
    headerBackground: '#f8fafc',
    titleColor: '#0f172a',
    subtitleColor: '#64748b',
  },
  blue: {
    containerBackground: '#ffffff',
    containerBorder: '#bfdbfe',
    headerBackground: '#eff6ff',
    titleColor: '#1d4ed8',
    subtitleColor: '#475569',
  },
  indigo: {
    containerBackground: '#ffffff',
    containerBorder: '#c7d2fe',
    headerBackground: '#eef2ff',
    titleColor: '#4338ca',
    subtitleColor: '#475569',
  },
  green: {
    containerBackground: '#ffffff',
    containerBorder: '#bbf7d0',
    headerBackground: '#f0fdf4',
    titleColor: '#15803d',
    subtitleColor: '#475569',
  },
  amber: {
    containerBackground: '#ffffff',
    containerBorder: '#fde68a',
    headerBackground: '#fffbeb',
    titleColor: '#b45309',
    subtitleColor: '#475569',
  },
  accent: {
    containerBackground: '#ffffff',
    containerBorder: '#93c5fd',
    headerBackground: '#dbeafe',
    titleColor: '#1e40af',
    subtitleColor: '#334155',
  },
};

const SalesSectionCard: React.FC<SalesSectionCardProps> = ({
  title,
  subtitle,
  children,
  tone = 'default',
}) => {
  const palette = toneStyles[tone];

  return (
    <section
      style={{
        backgroundColor: palette.containerBackground,
        border: `1px solid ${palette.containerBorder}`,
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '0.8rem 1rem',
          borderBottom: `1px solid ${palette.containerBorder}`,
          backgroundColor: palette.headerBackground,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '0.98rem',
            fontWeight: 700,
            color: palette.titleColor,
          }}
        >
          {title}
        </h3>

        {subtitle && (
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.82rem',
              color: palette.subtitleColor,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div
        style={{
          padding: '1rem',
        }}
      >
        {children}
      </div>
    </section>
  );
};

export default SalesSectionCard;