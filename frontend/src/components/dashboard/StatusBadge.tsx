import React from 'react';

type StatusBadgeProps = {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  backgroundColor = '#fffbe6',
  textColor = '#ad6800',
  borderColor = '#ffe58f',
}) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.8rem',
        fontWeight: 500,
        backgroundColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {label}
    </span>
  );
};

export default StatusBadge;