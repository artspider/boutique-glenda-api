import React from 'react';
import type { ClientesTableProps } from '../types';
import { formatCreditLimit, getCustomerFullName } from '../utils';
import {
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
import { Button, Card, EmptyState, Input, SectionHeader } from '../../../ui';

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
    <Card>
      <SectionHeader
        title="Listado de clientes"
        subtitle={`Mostrando: ${showingActive ? 'Activos' : 'Inactivos'} - Resultados: ${totalResults} - Pagina ${totalPages === 0 ? 0 : currentPage} de ${totalPages}`}
        style={{ marginBottom: 10 }}
      />

      {/* Barra de control del listado */}
      <div
        style={{
          ...formGridStyle,
          marginBottom: 10,
        }}
      >
        <Input
          id="clientes-search"
          label="Buscar cliente"
          type="text"
          placeholder="Buscar por nombre, telefono o zona"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          containerStyle={fieldGroupStyle}
          style={inputStyle}
        />

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
            <Button
              type="button"
              onClick={() => onChangeView('active')}
              variant={showingActive ? 'primary' : 'secondary'}
              style={showingActive ? primaryButtonStyle : secondaryButtonStyle}
            >
              Activos
            </Button>

            <Button
              type="button"
              onClick={() => onChangeView('inactive')}
              variant={!showingActive ? 'primary' : 'secondary'}
              style={!showingActive ? primaryButtonStyle : secondaryButtonStyle}
            >
              Inactivos
            </Button>
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
                <td colSpan={5} style={emptyStateStyle as React.CSSProperties}>
                  <EmptyState
                    title="Sin resultados"
                    description={
                      searchTerm.trim()
                        ? 'No hay clientes que coincidan con tu busqueda.'
                        : showingActive
                          ? 'No hay clientes activos registrados.'
                          : 'No hay clientes inactivos registrados.'
                    }
                  />
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
                    <span style={cliente.is_active ? badgeActiveStyle : badgeInactiveStyle}>
                      {cliente.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td style={tdStyle}>
                    <div style={rowActionsStyle}>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        style={editButtonStyle}
                        onClick={() => onEdit(cliente)}
                      >
                        Editar datos
                      </Button>

                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        style={dangerButtonStyle}
                        onClick={() => onToggleStatus(cliente)}
                        loading={deletingId === cliente.id}
                        disabled={deletingId === cliente.id}
                      >
                        {cliente.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
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
            <Button
              type="button"
              onClick={onPreviousPage}
              disabled={currentPage <= 1}
              variant="secondary"
              style={secondaryButtonStyle}
            >
              Anterior
            </Button>

            {visiblePages.map((page) => (
              <Button
                key={page}
                type="button"
                onClick={() => onGoToPage(page)}
                variant={page === currentPage ? 'primary' : 'secondary'}
                style={page === currentPage ? primaryButtonStyle : secondaryButtonStyle}
              >
                {page}
              </Button>
            ))}

            <Button
              type="button"
              onClick={onNextPage}
              disabled={currentPage >= totalPages}
              variant="secondary"
              style={secondaryButtonStyle}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
};

export default ClientesTable;
