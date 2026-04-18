import { Badge, Button, Card, EmptyState, Input, Select } from '../../ui';
import type { InventoryTableProps } from './types';
import {
  formatInventoryDate,
  getInventoryFilterLabel,
  getInventoryStatusLabel,
  getInventoryStatusTone,
} from './utils';

export default function InventarioTable({
  items,
  searchTerm,
  statusFilter,
  includeInactive,
  selectedProductId,
  onSearchTermChange,
  onStatusFilterChange,
  onIncludeInactiveChange,
  onViewHistory,
  onCreateEntry,
  onAdjustStock,
  onManualOut,
}: InventoryTableProps) {
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'end',
          }}
        >
          <Input
            id="inventory-search"
            label="Buscar producto"
            placeholder="Nombre o SKU"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            containerStyle={{ flex: '1 1 220px' }}
          />

          <Select
            id="inventory-status-filter"
            label="Estado"
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as InventoryTableProps['statusFilter'])}
            containerStyle={{ width: '180px' }}
          >
            {(['all', 'healthy', 'low_stock', 'out_of_stock'] as const).map((option) => (
              <option key={option} value={option}>
                {getInventoryFilterLabel(option)}
              </option>
            ))}
          </Select>

          <label
            htmlFor="inventory-include-inactive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              minHeight: '2.5rem',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            <input
              id="inventory-include-inactive"
              type="checkbox"
              checked={includeInactive}
              onChange={(event) => onIncludeInactiveChange(event.target.checked)}
            />
            Mostrar inactivos
          </label>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="No hay productos para mostrar"
            description="Ajusta los filtros o registra productos para comenzar a monitorear existencias."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  {['Producto', 'Categoría', 'Stock', 'Estado', 'Último movimiento', 'Acciones'].map(
                    (header) => (
                      <th
                        key={header}
                        style={{
                          textAlign: 'left',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                          padding: '0 0 0.65rem 0',
                          borderBottom: '1px solid var(--color-border-soft)',
                        }}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isSelected = item.product_id === selectedProductId;

                  return (
                    <tr key={item.product_id}>
                      <td
                        style={{
                          padding: '0.85rem 0.45rem 0.85rem 0',
                          borderBottom: '1px solid var(--color-border-soft)',
                          minWidth: '220px',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <strong>{item.name}</strong>
                          <span
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {item.sku || 'Sin SKU'}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 0.45rem',
                          borderBottom: '1px solid var(--color-border-soft)',
                        }}
                      >
                        <span style={{ fontSize: 'var(--font-size-xs)' }}>
                          {item.category || 'Sin categoría'}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 0.45rem',
                          borderBottom: '1px solid var(--color-border-soft)',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <strong>{item.stock}</strong>
                          <span
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            Min {item.minimum_stock}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 0.45rem',
                          borderBottom: '1px solid var(--color-border-soft)',
                        }}
                      >
                        <Badge tone={getInventoryStatusTone(item.status)}>
                          {getInventoryStatusLabel(item.status)}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 0.45rem',
                          borderBottom: '1px solid var(--color-border-soft)',
                          minWidth: '170px',
                        }}
                      >
                        <span style={{ fontSize: 'var(--font-size-xs)' }}>
                          {formatInventoryDate(item.last_movement_at)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 0 0.85rem 0.45rem',
                          borderBottom: '1px solid var(--color-border-soft)',
                          minWidth: '260px',
                        }}
                      >
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                          <Button
                            size="sm"
                            variant={isSelected ? 'primary' : 'secondary'}
                            onClick={() => onViewHistory(item.product_id)}
                          >
                            {isSelected ? 'Historial activo' : 'Ver historial'}
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => onCreateEntry(item.product_id)}>
                            Entrada
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => onAdjustStock(item.product_id)}>
                            Ajustar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onManualOut(item.product_id)}>
                            Salida
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
