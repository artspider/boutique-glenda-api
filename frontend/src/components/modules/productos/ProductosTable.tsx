import React, { useState } from 'react';
import type { ProductosTableProps } from './types';
import {
  cardStyle,
  colors,
  pillBase,
  secondaryButtonStyle,
  tdStyle,
  thStyle,
} from './styles';
import { getMarginBadgeStyle, getStockBadgeStyle, money } from './utils';

/**
 * Tabla operativa de productos
 */
const ProductosTable: React.FC<ProductosTableProps> = ({
  productos,
  onEdit,
  onDelete,
}) => {
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);

  return (
    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
      {/* Encabezado corto del bloque */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: `1px solid ${colors.border}`,
          background: colors.cardBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 13, color: colors.text }}>
            Lista de productos
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: 11, color: colors.textMuted }}>
            Vista operativa del catálogo.
          </p>
        </div>

        <span
          style={{
            ...pillBase,
            background: colors.primarySoft,
            color: colors.textSoft,
          }}
        >
          {productos.length} registros
        </span>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12,
            minWidth: 860,
          }}
        >
          <thead>
            <tr style={{ background: colors.tableHeadBg }}>
              <th style={thStyle}>Producto</th>
              <th style={thStyle}>SKU</th>
              <th style={thStyle}>Costo</th>
              <th style={thStyle}>Precio</th>
              <th style={thStyle}>Utilidad</th>
              <th style={thStyle}>Margen</th>
              <th style={thStyle}>Stock</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    padding: 18,
                    textAlign: 'center',
                    color: colors.textMuted,
                    fontSize: 12,
                  }}
                >
                  Sin productos
                </td>
              </tr>
            ) : (
              productos.map((p) => {
                const utilidadFila = Number(p.sale_price) - Number(p.cost_price);
                const margenFila =
                  Number(p.sale_price) > 0
                    ? (utilidadFila / Number(p.sale_price)) * 100
                    : 0;

                const isHovered = hoveredRowId === p.id;

                return (
                  <tr
                    key={p.id}
                    onMouseEnter={() => setHoveredRowId(p.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    style={{
                      borderTop: `1px solid ${colors.borderSoft}`,
                      background: isHovered ? colors.cardBgSoft : colors.cardBg,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Producto */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: colors.text,
                            lineHeight: 1.2,
                          }}
                        >
                          {p.name}
                        </span>

                        <span
                          style={{
                            fontSize: 11,
                            color: colors.textMuted,
                            lineHeight: 1.2,
                            whiteSpace: 'normal',
                          }}
                        >
                          {p.description || '-'}
                        </span>
                      </div>
                    </td>

                    {/* SKU */}
                    <td style={tdStyle}>
                      <span
                        style={{
                          color: colors.textSoft,
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      >
                        {p.sku}
                      </span>
                    </td>

                    {/* Costo */}
                    <td style={tdStyle}>
                      <span style={{ color: colors.text }}>{money(Number(p.cost_price))}</span>
                    </td>

                    {/* Precio */}
                    <td style={tdStyle}>
                      <span style={{ color: colors.text, fontWeight: 700 }}>
                        {money(Number(p.sale_price))}
                      </span>
                    </td>

                    {/* Utilidad */}
                    <td style={tdStyle}>
                      <span
                        style={{
                          color: utilidadFila < 0 ? colors.dangerText : colors.text,
                          fontWeight: 700,
                        }}
                      >
                        {money(utilidadFila)}
                      </span>
                    </td>

                    {/* Margen */}
                    <td style={tdStyle}>
                      <span style={getMarginBadgeStyle(margenFila)}>
                        {margenFila.toFixed(1)}%
                      </span>
                    </td>

                    {/* Stock */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            color: colors.text,
                            fontWeight: 700,
                            minWidth: 16,
                          }}
                        >
                          {p.stock}
                        </span>

                        <span style={getStockBadgeStyle(p.stock, p.minimum_stock)}>
                          {p.stock <= 0
                            ? 'Sin stock'
                            : p.stock <= p.minimum_stock
                            ? 'Bajo'
                            : 'Ok'}
                        </span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td style={tdStyle}>
                      <span
                        style={{
                          ...pillBase,
                          background: p.is_active ? colors.successBg : colors.inactiveBg,
                          color: p.is_active ? colors.successText : colors.inactiveText,
                        }}
                      >
                        {p.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          style={{
                            ...secondaryButtonStyle,
                            padding: '6px 10px',
                            fontSize: 11,
                            color: colors.textSoft,
                          }}
                          onClick={() => onEdit(p)}
                        >
                          Editar
                        </button>

                        <button
                          style={{
                            ...secondaryButtonStyle,
                            padding: '6px 10px',
                            fontSize: 11,
                            color: colors.dangerText,
                            borderColor: colors.dangerBorder,
                            background: colors.cardBg,
                          }}
                          onClick={() => onDelete(p.id)}
                        >
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductosTable;