import React from 'react';

type DashboardPanelProps = {
  title: string;
  children: React.ReactNode;
};

const DashboardPanel: React.FC<DashboardPanelProps> = ({ title, children }) => {
  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '1rem',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>{title}</h3>
      <div>{children}</div>
    </section>
  );
};

export default DashboardPanel;