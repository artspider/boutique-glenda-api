import React from 'react';

const DashboardModule: React.FC = () => {
  return (
    <div>
      <h2>Dashboard de cobranza</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '1rem',
            backgroundColor: '#ffffff',
          }}
        >
          <p>Total por cobrar</p>
          <h3>$0.00</h3>
        </div>

        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '1rem',
            backgroundColor: '#ffffff',
          }}
        >
          <p>Total vencido</p>
          <h3>$0.00</h3>
        </div>

        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '1rem',
            backgroundColor: '#ffffff',
          }}
        >
          <p>Pagos del día</p>
          <h3>$0.00</h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;