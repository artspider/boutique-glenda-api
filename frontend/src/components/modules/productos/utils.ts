import { pillBase } from './styles';

/**
 * Formatea dinero
 */
export const money = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value || 0);

/**
 * Convierte string a número seguro
 */
export const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Badge según margen
 */
export const getMarginBadgeStyle = (value: number): React.CSSProperties => {
  if (value < 20) {
    return { ...pillBase, background: '#fee2e2', color: '#b91c1c' };
  }
  if (value < 40) {
    return { ...pillBase, background: '#fef3c7', color: '#b45309' };
  }
  return { ...pillBase, background: '#dcfce7', color: '#15803d' };
};

/**
 * Badge según stock
 */
export const getStockBadgeStyle = (
  stock: number,
  minimum: number
): React.CSSProperties => {
  if (stock <= 0) {
    return { ...pillBase, background: '#fee2e2', color: '#b91c1c' };
  }
  if (stock <= minimum) {
    return { ...pillBase, background: '#fef3c7', color: '#b45309' };
  }
  return { ...pillBase, background: '#e5e7eb', color: '#374151' };
};