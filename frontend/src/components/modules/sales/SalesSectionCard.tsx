import React from 'react';

type SalesSectionCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accentColor?: string;
  backgroundColor?: string;
};

const SalesSectionCard: React.FC<SalesSectionCardProps> = ({
  title,
  subtitle,
  children,
  accentColor = '#2563eb',
  backgroundColor = '#ffffff',
}) => {
  return (
    <section
      style={{
        backgroundColor,
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 700,
            color: accentColor,
          }}
        >
          {title}
        </h3>

        {subtitle && (
          <p
            style={{
              margin: '0.35rem 0 0 0',
              fontSize: '0.9rem',
              color: '#64748b',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div
        style={{
          padding: '1.25rem',
        }}
      >
        {children}
      </div>
    </section>
  );
};

export default SalesSectionCard;