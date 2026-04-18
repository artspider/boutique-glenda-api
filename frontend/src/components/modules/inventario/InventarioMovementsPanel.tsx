import { Badge, Card, EmptyState } from '../../ui';
import type { InventoryMovementsPanelProps } from './types';
import {
  formatInventoryDate,
  formatMovementQuantity,
  getMovementTone,
  getMovementTypeLabel,
} from './utils';

export default function InventarioMovementsPanel({
  movements,
  loading,
  selectedProductName,
  onClearSelection,
}: InventoryMovementsPanelProps) {
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h3 style={{ fontSize: 'var(--font-size-lg)' }}>
              {selectedProductName ? `Historial de ${selectedProductName}` : 'Movimientos recientes'}
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {selectedProductName
                ? 'Trazabilidad del producto seleccionado.'
                : 'Bitácora general del inventario con las últimas operaciones.'}
            </p>
          </div>
          {selectedProductName ? (
            <button
              type="button"
              onClick={onClearSelection}
              style={{
                color: 'var(--color-brand-700)',
                fontWeight: 'var(--font-weight-bold)',
                cursor: 'pointer',
              }}
            >
              Ver global
            </button>
          ) : null}
        </div>

        {loading ? (
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Cargando movimientos...
          </p>
        ) : movements.length === 0 ? (
          <EmptyState
            title="No hay movimientos registrados"
            description="Cuando existan entradas, salidas, ajustes o ventas, aparecerán aquí."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {movements.map((movement) => (
              <div
                key={movement.id}
                style={{
                  border: '1px solid var(--color-border-soft)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  background: 'var(--color-surface-50)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <strong>{movement.product_name || `Producto #${movement.product_id}`}</strong>
                    <Badge tone={getMovementTone(movement.movement_type)}>
                      {getMovementTypeLabel(movement.movement_type)}
                    </Badge>
                  </div>
                  <strong>{formatMovementQuantity(movement)}</strong>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: '0.45rem',
                  }}
                >
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    SKU: {movement.sku || 'Sin SKU'}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    Usuario: {movement.user_name || 'Sistema'}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    Fecha: {formatInventoryDate(movement.created_at)}
                  </span>
                </div>

                {movement.reference ? (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Referencia: {movement.reference}
                  </span>
                ) : null}

                {movement.notes ? (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    {movement.notes}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
