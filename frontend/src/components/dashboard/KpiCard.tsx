import React from 'react';

type KpiCardProps = {
  title: string;
  value: string;
  backgroundColor: string;
  borderColor: string;
  valueColor?: string;
};

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  backgroundColor,
  borderColor,
  valueColor = '#262626',
}) => {
  return (
    <div
      style={{
        backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '1rem',
      }}
    >
      <p style={{ margin: 0, marginBottom: '0.5rem' }}>{title}</p>
      <h3 style={{ margin: 0, color: valueColor }}>{value}</h3>
    </div>
  );
};

export default KpiCard;