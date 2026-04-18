import type { CSSProperties } from 'react';
import type {
  InventoryFilter,
  InventoryMovement,
  InventoryMovementType,
  InventoryStatus,
} from './types';

export const inventoryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '0.85rem',
};

export function getInventoryStatusLabel(status: InventoryStatus): string {
  switch (status) {
    case 'healthy':
      return 'Stock normal';
    case 'low_stock':
      return 'Stock bajo';
    case 'out_of_stock':
      return 'Sin stock';
    case 'inactive':
      return 'Inactivo';
    default:
      return 'Sin definir';
  }
}

export function getInventoryStatusTone(
  status: InventoryStatus
): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'low_stock':
      return 'warning';
    case 'out_of_stock':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function getInventoryFilterLabel(filter: InventoryFilter): string {
  switch (filter) {
    case 'healthy':
      return 'Stock normal';
    case 'low_stock':
      return 'Stock bajo';
    case 'out_of_stock':
      return 'Agotados';
    default:
      return 'Todos';
  }
}

export function getMovementTypeLabel(type: InventoryMovementType): string {
  switch (type) {
    case 'in':
      return 'Entrada';
    case 'out':
      return 'Salida';
    case 'adjustment':
      return 'Ajuste';
    default:
      return 'Movimiento';
  }
}

export function getMovementTone(
  type: InventoryMovementType
): 'success' | 'warning' | 'info' {
  switch (type) {
    case 'in':
      return 'success';
    case 'out':
      return 'warning';
    default:
      return 'info';
  }
}

export function formatInventoryDate(value: string | null): string {
  if (!value) {
    return 'Sin movimientos';
  }

  return new Date(value).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMovementQuantity(movement: InventoryMovement): string {
  if (movement.movement_type === 'adjustment') {
    return `${movement.quantity > 0 ? '+' : ''}${movement.quantity}`;
  }

  return `${movement.movement_type === 'out' ? '-' : '+'}${Math.abs(movement.quantity)}`;
}
