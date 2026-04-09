import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const DashboardModule: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <h2>Dashboard de cobranza</h2>

      {/* 🔵 FILA 1 — KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={cardStyle('#e6f4ff', '#91caff')}>
          <p>Total por cobrar</p>
          <h3>{formatCurrency(0)}</h3>
        </div>

        <div style={cardStyle('#fff1f0', '#ffa39e')}>
          <p>Total vencido</p>
          <h3 style={{ color: '#cf1322' }}>{formatCurrency(0)}</h3>
        </div>

        <div style={cardStyle('#f6ffed', '#b7eb8f')}>
          <p>Pagos del día</p>
          <h3 style={{ color: '#389e0d' }}>{formatCurrency(0)}</h3>
        </div>

        <div style={cardStyle('#fffbe6', '#ffe58f')}>
          <p>Próximos pagos</p>
          <h3>{formatCurrency(0)}</h3>
        </div>
      </div>

      {/* 🟣 FILA 2 — LISTA + ALERTAS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1rem',
        }}
      >
        {/* Próximos pagos */}
        <div style={boxStyle}>
          <h3>Próximos pagos</h3>
          <p style={{ color: '#888' }}>Aquí se mostrará la lista de pagos próximos</p>
        </div>

        {/* Alertas */}
        <div style={boxStyle}>
          <h3>Alertas</h3>
          <p style={{ color: '#888' }}>Pagos vencidos recientes</p>
        </div>
      </div>

      {/* 🟢 FILA 3 — PRODUCTO + MENSAJES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
        }}
      >
        {/* Producto estrella */}
        <div style={boxStyle}>
          <h3>Producto estrella</h3>
          <p style={{ color: '#888' }}>Producto más vendido</p>
        </div>

        {/* Mensajes */}
        <div style={boxStyle}>
          <h3>Mensajes recientes</h3>
          <p style={{ color: '#888' }}>WhatsApp / Instagram</p>
        </div>
      </div>

    </div>
  );
};

export default DashboardModule;

/* 🔧 estilos reutilizables */

const cardStyle = (bg: string, border: string): React.CSSProperties => ({
  backgroundColor: bg,
  border: `1px solid ${border}`,
  borderRadius: '12px',
  padding: '1rem',
});

const boxStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #ddd',
  borderRadius: '12px',
  padding: '1rem',
};