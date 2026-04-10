import React from 'react';
import type { Customer } from '../types';
import {
  cardStyle,
  sectionTitleStyle,
  metaTextStyle,
  formActionsStyle,
  secondaryButtonStyle,
  dangerButtonStyle,
} from '../styles';
import { getCustomerFullName } from '../utils';

/**
 * =========================================================
 * ClienteStatusConfirmDialog
 * ---------------------------------------------------------
 * Confirmación visual integrada para activar o desactivar
 * clientes desde el módulo de Clientes.
 *
 * Responsabilidades:
 * - mostrar una confirmación clara y contextual
 * - indicar qué acción se realizará
 * - delegar confirmar/cancelar al contenedor principal
 *
 * No contiene lógica de negocio ni llamadas a API.
 * =========================================================
 */
type ClienteStatusConfirmDialogProps = {
  customer: Customer;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ClienteStatusConfirmDialog: React.FC<ClienteStatusConfirmDialogProps> = ({
  customer,
  loading,
  onConfirm,
  onCancel,
}) => {
  const isActive = customer.is_active;
  const actionLabel = isActive ? 'desactivar' : 'activar';
  const actionButtonLabel = loading
    ? isActive
      ? 'Desactivando...'
      : 'Activando...'
    : isActive
      ? 'Confirmar desactivación'
      : 'Confirmar activación';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          ...cardStyle,
          width: '100%',
          maxWidth: 480,
          padding: 16,
          boxShadow: '0 12px 40px rgba(15, 23, 42, 0.18)',
        }}
      >
        <h3 style={{ ...sectionTitleStyle, fontSize: 14, marginBottom: 8 }}>
          Confirmar acción
        </h3>

        <p style={{ ...metaTextStyle, marginBottom: 8 }}>
          Vas a <strong>{actionLabel}</strong> al cliente{' '}
          <strong>{getCustomerFullName(customer)}</strong>.
        </p>

        <p style={{ ...metaTextStyle, marginBottom: 0 }}>
          Esta acción cambiará su estado y el cliente se moverá a la vista de{' '}
          <strong>{isActive ? 'inactivos' : 'activos'}</strong>.
        </p>

        <div style={{ ...formActionsStyle, marginTop: 16 }}>
          <button
            type="button"
            onClick={onCancel}
            style={secondaryButtonStyle}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={dangerButtonStyle}
            disabled={loading}
          >
            {actionButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteStatusConfirmDialog;