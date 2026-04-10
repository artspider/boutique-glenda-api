import React from 'react';
import type { ClientesTableProps } from '../types';
import { formatCreditLimit, getCustomerFullName } from '../utils';
import {
  cardStyle,
  sectionHeaderStyle,
  sectionTitleStyle,
  metaTextStyle,
  tableContainerStyle,
  tableStyle,
  thStyle,
  tdStyle,
  namePrimaryStyle,
  nameSecondaryStyle,
  rowActionsStyle,
  editButtonStyle,
  dangerButtonStyle,
  secondaryButtonStyle,
  primaryButtonStyle,
  badgeActiveStyle,
  badgeInactiveStyle,
  emptyStateStyle,
  formGridStyle,
  fieldGroupStyle,
  labelStyle,
  inputStyle,
  softCardStyle,
  summaryLabelStyle,
} from '../styles';

/**
 * =========================================================
 * ClientesTable
 * ---------------------------------------------------------
 * Componente visual de tabla para el módulo Clientes.
 * Responsabilidades:
 * - renderizar buscador y controles del listado
 * - mostrar clientes paginados
 * - presentar la información con jerarquía visual más útil
 * - mostrar acciones por fila
 *
 * No contiene lógica de negocio ni llamadas a API.
 * =========================================================
 */
const ClientesTable: React.FC<ClientesTableProps> = ({
  clientes,
  deletingId,
  currentView,
  searchTerm,
  currentPage,
  totalPages,
  totalResults,
  pageSize,
  onChangeView,
  onSearchTermChange,
  onPreviousPage,
  onNextPage,
  onGoToPage,
  onEdit,
  onToggleStatus,
}) => {
  const showingActive = currentView === 'active';

  /**
   * Genera un conjunto compacto de páginas visibles.
   */
  const getVisiblePages = (): number[] => {
    if (totalPages <= 1) return [1];

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);

    if (currentPage - 1 >= 1) pages.add(currentPage - 1);
    pages.add(currentPage);
    if (currentPage + 1 <= totalPages) pages.add(currentPage + 1);

    return Array.from(pages).sort((a, b) => a - b);
  };

  /**
   * Resume el campo email como red social/contacto alterno en UI.
   * El backend puede seguir manejándolo como email internamente.
   */
  const getSocialSummary = (value?: string | null) => {
    const normalized = (value ?? '').trim();
    return normalized || 'Sin red social';
  };

  /**
   * Acorta textos largos para evitar que una celda rompa la jerarquía visual.
   */
  const truncateText = (value?: string | null, maxLength = 42) => {
    const normalized = (value ?? '').trim();

    if (!normalized) return '-';
    if (normalized.length <= maxLength) return normalized;

    return `${normalized.slice(0, maxLength)}...`;
  };

  const visiblePages = getVisiblePages();

  return (
    <div style={cardStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h3 style={sectionTitleStyle}>Listado de clientes</h3>
          <p style={metaTextStyle}>
            Mostrando: <strong>{showingActive ? 'Activos' : 'Inactivos'}</strong> ·
            Resultados: <strong>{totalResults}</strong> · Página{' '}
            <strong>{totalPages === 0 ? 0 : currentPage}</strong> de{' '}
            <strong>{totalPages}</strong>
          </p>
        </div>
      </div>

      {/* Barra de control del listado */}
      <div
        style={{
          ...formGridStyle,
          marginBottom: 10,
        }}
      >
        <div style={fieldGroupStyle}>
          <label htmlFor="clientes-search" style={labelStyle}>
            Buscar cliente
          </label>
          <input
            id="clientes-search"
            type="text"
            placeholder="Buscar por nombre, teléfono o zona"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div
          style={{
            ...fieldGroupStyle,
            justifyContent: 'flex-end',
          }}
        >
          <label style={labelStyle}>Vista</label>
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => onChangeView('active')}
              style={showingActive ? primaryButtonStyle : secondaryButtonStyle}
            >
              Activos
            </button>

            <button
              type="button"
              onClick={() => onChangeView('inactive')}
              style={!showingActive ? primaryButtonStyle : secondaryButtonStyle}
            >
              Inactivos
            </button>
          </div>
        </div>
      </div>

      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Resumen comercial</th>
              <th style={thStyle}>Ubicación</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={5} style={emptyStateStyle}>
                  {searchTerm.trim()
                    ? 'No hay clientes que coincidan con tu búsqueda.'
                    : showingActive
                      ? 'No hay clientes activos registrados.'
                      : 'No hay clientes inactivos registrados.'}
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id}>
                  {/* Bloque principal: nombre + teléfono + red social */}
                  <td style={tdStyle}>
                    <div>
                      <div style={namePrimaryStyle}>{getCustomerFullName(cliente)}</div>
                      <div style={nameSecondaryStyle}>
                        Teléfono: {cliente.phone || 'Sin teléfono'}
                      </div>
                      <div style={nameSecondaryStyle}>
                        Red social: {getSocialSummary(cliente.email)}
                      </div>
                    </div>
                  </td>

                  {/* Bloque secundario: zona + crédito */}
                  <td style={tdStyle}>
                    <div
                      style={{
                        ...softCardStyle,
                        padding: 8,
                      }}
                    >
                      <p style={{ ...summaryLabelStyle, margin: 0 }}>Zona</p>
                      <div style={{ ...namePrimaryStyle, fontSize: 11, marginBottom: 6 }}>
                        {cliente.zone || 'Sin zona'}
                      </div>

                      <p style={{ ...summaryLabelStyle, margin: 0 }}>Límite de crédito</p>
                      <div style={{ ...namePrimaryStyle, fontSize: 11 }}>
                        {formatCreditLimit(cliente.credit_limit)}
                      </div>
                    </div>
                  </td>

                  {/* Contexto: ubicación compacta y apilada */}
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        minWidth: 0,
                      }}
                    >
                      <div style={nameSecondaryStyle}>
                        <strong style={{ color: '#334155' }}>Zona:</strong>{' '}
                        {truncateText(cliente.zone, 28)}
                      </div>

                      <div style={nameSecondaryStyle}>
                        <strong style={{ color: '#334155' }}>Dir:</strong>{' '}
                        {truncateText(cliente.address_line, 34)}
                      </div>

                      <div style={nameSecondaryStyle}>
                        <strong style={{ color: '#334155' }}>Ref:</strong>{' '}
                        {truncateText(cliente.address_reference, 34)}
                      </div>

                      {cliente.notes ? (
                        <div style={nameSecondaryStyle}>
                          <strong style={{ color: '#334155' }}>Nota:</strong>{' '}
                          {truncateText(cliente.notes, 38)}
                        </div>
                      ) : null}
                    </div>
                  </td>

                  {/* Estado */}
                  <td style={tdStyle}>
                    <span
                      style={cliente.is_active ? badgeActiveStyle : badgeInactiveStyle}
                    >
                      {cliente.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td style={tdStyle}>
                    <div style={rowActionsStyle}>
                      <button
                        type="button"
                        style={editButtonStyle}
                        onClick={() => onEdit(cliente)}
                      >
                        Editar datos
                      </button>

                      <button
                        type="button"
                        style={dangerButtonStyle}
                        onClick={() => onToggleStatus(cliente)}
                        disabled={deletingId === cliente.id}
                      >
                        {deletingId === cliente.id
                          ? cliente.is_active
                            ? 'Desactivando...'
                            : 'Activando...'
                          : cliente.is_active
                            ? 'Desactivar'
                            : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalResults > 0 ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginTop: 10,
          }}
        >
          <p style={metaTextStyle}>
            Mostrando hasta <strong>{pageSize}</strong> registros por página.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={onPreviousPage}
              disabled={currentPage <= 1}
              style={secondaryButtonStyle}
            >
              Anterior
            </button>

            {visiblePages.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => onGoToPage(page)}
                style={page === currentPage ? primaryButtonStyle : secondaryButtonStyle}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={onNextPage}
              disabled={currentPage >= totalPages}
              style={secondaryButtonStyle}
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ClientesTable;