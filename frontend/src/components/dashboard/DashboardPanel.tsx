import React from 'react';
import { Card } from '../ui';

type DashboardPanelProps = {
  title?: string;
  children: React.ReactNode;
};

const DashboardPanel: React.FC<DashboardPanelProps> = ({ title, children }) => {
  return (
    <Card
      style={{
        padding: '1rem',
      }}
    >
      {title ? <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>{title}</h3> : null}
      <div>{children}</div>
    </Card>
  );
};

export default DashboardPanel;
