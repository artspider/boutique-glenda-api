import { Card, Badge } from '../../ui';
import type { InventorySummaryProps } from './types';

const summaryCards = [
  {
    key: 'monitoredProducts',
    label: 'Productos monitoreados',
    pill: 'Activos',
    description: 'Inventario activo disponible para operación.',
    tone: 'info' as const,
  },
  {
    key: 'lowStockProducts',
    label: 'Stock bajo',
    pill: 'Alerta',
    description: 'Productos que requieren reposición pronta.',
    tone: 'warning' as const,
  },
  {
    key: 'outOfStockProducts',
    label: 'Sin stock',
    pill: 'Crítico',
    description: 'Productos agotados con impacto operativo inmediato.',
    tone: 'danger' as const,
  },
  {
    key: 'recentMovements',
    label: 'Movimientos recientes',
    pill: 'Bitácora',
    description: 'Eventos recientes detectados en la bitácora.',
    tone: 'success' as const,
  },
];

export default function InventarioSummary(props: InventorySummaryProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem',
      }}
    >
      {summaryCards.map((card) => (
        <Card key={card.key} variant="soft" padding="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <p
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {card.label}
              </p>
              <Badge tone={card.tone}>{card.pill}</Badge>
            </div>
            <h3 style={{ fontSize: 'var(--font-size-3xl)' }}>
              {props[card.key as keyof InventorySummaryProps]}
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {card.description}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
