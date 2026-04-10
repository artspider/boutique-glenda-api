import React from 'react';

interface CreditosSummaryCardsProps {
  active: number;
  overdue: number;
  paid: number;
  totalBalance: number;
}

interface SummaryCardPalette {
  background: string;
  border: string;
  valueColor: string;
}

const baseCardStyle: React.CSSProperties = {
  borderRadius: '12px',
  padding: '0.8rem 0.9rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  minHeight: '84px',
  justifyContent: 'center',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.82rem',
  fontWeight: 500,
  color: '#595959',
};

const helperStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.74rem',
  color: '#8c8c8c',
};

const valueStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.45rem',
  fontWeight: 700,
  lineHeight: 1.1,
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
};

const CreditosSummaryCards: React.FC<CreditosSummaryCardsProps> = ({
  active,
  overdue,
  paid,
  totalBalance,
}) => {
  const activePalette: SummaryCardPalette = {
    background: '#eaf4ff',
    border: '#91caff',
    valueColor: '#1677ff',
  };

  const overduePalette: SummaryCardPalette = {
    background: '#fff1f0',
    border: '#ffaca3',
    valueColor: '#cf1322',
  };

  const paidPalette: SummaryCardPalette = {
    background: '#f6ffed',
    border: '#b7eb8f',
    valueColor: '#389e0d',
  };

  const balancePalette: SummaryCardPalette = {
    background: '#fffbe6',
    border: '#f5d66f',
    valueColor: '#262626',
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.6rem',
      }}
    >
      <div
        style={{
          ...baseCardStyle,
          background: activePalette.background,
          border: `1px solid ${activePalette.border}`,
        }}
      >
        <p style={titleStyle}>Activos</p>
        <p style={{ ...valueStyle, color: activePalette.valueColor }}>{active}</p>
        <p style={helperStyle}>En curso</p>
      </div>

      <div
        style={{
          ...baseCardStyle,
          background: overduePalette.background,
          border: `1px solid ${overduePalette.border}`,
        }}
      >
        <p style={titleStyle}>Vencidos</p>
        <p style={{ ...valueStyle, color: overduePalette.valueColor }}>{overdue}</p>
        <p style={helperStyle}>Urgente</p>
      </div>

      <div
        style={{
          ...baseCardStyle,
          background: paidPalette.background,
          border: `1px solid ${paidPalette.border}`,
        }}
      >
        <p style={titleStyle}>Liquidados</p>
        <p style={{ ...valueStyle, color: paidPalette.valueColor }}>{paid}</p>
        <p style={helperStyle}>Cerrados</p>
      </div>

      <div
        style={{
          ...baseCardStyle,
          background: balancePalette.background,
          border: `1px solid ${balancePalette.border}`,
        }}
      >
        <p style={titleStyle}>Saldo</p>
        <p
          style={{
            ...valueStyle,
            color: balancePalette.valueColor,
            fontSize: '1.2rem',
          }}
        >
          {formatCurrency(totalBalance)}
        </p>
        <p style={helperStyle}>Pendiente</p>
      </div>
    </div>
  );
};

export default CreditosSummaryCards;