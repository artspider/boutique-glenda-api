import React from 'react';
import KpiCard from '../../dashboard/KpiCard';

type PagosSummaryCardsProps = {
  overdue: number;
  dueToday: number;
  dueSoon: number;
  current: number;
};

const PagosSummaryCards: React.FC<PagosSummaryCardsProps> = ({
  overdue,
  dueToday,
  dueSoon,
  current,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.65rem',
      }}
    >
      <KpiCard
        title="Total vencido"
        value={String(overdue)}
        backgroundColor="#fff1f0"
        borderColor="#ffa39e"
        valueColor="#cf1322"
      />

      <KpiCard
        title="Pagos del día"
        value={String(dueToday)}
        backgroundColor="#f6ffed"
        borderColor="#b7eb8f"
        valueColor="#389e0d"
      />

      <KpiCard
        title="Próximos pagos"
        value={String(dueSoon)}
        backgroundColor="#fffbe6"
        borderColor="#ffe58f"
      />

      <KpiCard
        title="Al corriente"
        value={String(current)}
        backgroundColor="#e6f4ff"
        borderColor="#91caff"
      />
    </div>
  );
};

export default PagosSummaryCards;