import React from 'react';
import { cardStyle, colors, softCardStyle } from './styles';
import type { ProductosResumenProps } from './types';

/**
 * Resumen rápido del catálogo
 */
const ProductosResumen: React.FC<ProductosResumenProps> = ({
  totalActivos,
  totalInactivos,
  totalStockBajo,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 8,
      }}
    >
      {/* Activos */}
      <div
        style={{
          ...cardStyle,
          padding: 10,
          background: colors.cardBg,
        }}
      >
        <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 700 }}>
          PRODUCTOS ACTIVOS
        </div>

        <div
          style={{
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>
            {totalActivos}
          </div>

          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: colors.successText,
              background: colors.successBg,
              padding: '2px 8px',
              borderRadius: 999,
            }}
          >
            Activos
          </span>
        </div>

        <div style={{ marginTop: 6, ...softCardStyle, padding: 6 }}>
          <span style={{ fontSize: 10, color: colors.textMuted }}>
            Productos disponibles para operación.
          </span>
        </div>
      </div>

      {/* Inactivos */}
      <div
        style={{
          ...cardStyle,
          padding: 10,
          background: colors.cardBg,
        }}
      >
        <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 700 }}>
          PRODUCTOS INACTIVOS
        </div>

        <div
          style={{
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>
            {totalInactivos}
          </div>

          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: colors.inactiveText,
              background: colors.inactiveBg,
              padding: '2px 8px',
              borderRadius: 999,
            }}
          >
            Inactivos
          </span>
        </div>

        <div style={{ marginTop: 6, ...softCardStyle, padding: 6 }}>
          <span style={{ fontSize: 10, color: colors.textMuted }}>
            Productos fuera de vista comercial.
          </span>
        </div>
      </div>

      {/* Stock bajo */}
      <div
        style={{
          ...cardStyle,
          padding: 10,
          background: colors.cardBg,
        }}
      >
        <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 700 }}>
          ALERTAS DE STOCK
        </div>

        <div
          style={{
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>
            {totalStockBajo}
          </div>

          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: colors.warningText,
              background: colors.warningBg,
              padding: '2px 8px',
              borderRadius: 999,
            }}
          >
            Stock bajo
          </span>
        </div>

        <div style={{ marginTop: 6, ...softCardStyle, padding: 6 }}>
          <span style={{ fontSize: 10, color: colors.textMuted }}>
            Requieren revisión o reposición.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductosResumen;