import React from 'react';
import type { ClienteFormProps } from '../types';
import {
  cardStyle,
  sectionHeaderStyle,
  sectionTitleStyle,
  metaTextStyle,
  formGridStyle,
  fieldGroupStyle,
  labelStyle,
  inputStyle,
  inputErrorStyle,
  errorTextStyle,
  helperTextStyle,
  formActionsStyle,
  secondaryButtonStyle,
  successButtonStyle,
} from '../styles';

/**
 * =========================================================
 * ClienteForm
 * ---------------------------------------------------------
 * Componente visual del formulario de clientes.
 *
 * Responsabilidades:
 * - renderizar campos agrupados por intención de uso
 * - mostrar errores visuales
 * - mantener una experiencia compacta y clara
 * - delegar todos los cambios al contenedor principal
 *
 * No contiene lógica de negocio ni llamadas a API.
 * =========================================================
 */
const ClienteForm: React.FC<ClienteFormProps> = ({
  formData,
  formErrors,
  isEditing,
  saving,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onEmailChange,
  onZoneChange,
  onAddressLineChange,
  onAddressReferenceChange,
  onCreditLimitChange,
  onNotesChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <div style={cardStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h3 style={sectionTitleStyle}>
            {isEditing ? 'Editar cliente' : 'Registrar nuevo cliente'}
          </h3>
          <p style={metaTextStyle}>
            Captura información útil para ventas, cobranza y seguimiento del cliente.
          </p>
        </div>
      </div>

      {/* =====================================================
          Sección 1: Identidad básica
         ===================================================== */}
      <div style={{ marginBottom: 12 }}>
        <h4
          style={{
            ...sectionTitleStyle,
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          Identidad
        </h4>

        <div style={formGridStyle}>
          <div style={fieldGroupStyle}>
            <label htmlFor="cliente-first-name" style={labelStyle}>
              Nombre *
            </label>
            <input
              id="cliente-first-name"
              type="text"
              placeholder="Ej. María"
              value={formData.first_name}
              onChange={(e) => onFirstNameChange(e.target.value)}
              style={{
                ...inputStyle,
                ...(formErrors.first_name ? inputErrorStyle : {}),
              }}
            />
            {formErrors.first_name ? (
              <p style={errorTextStyle}>{formErrors.first_name}</p>
            ) : null}
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="cliente-last-name" style={labelStyle}>
              Apellido
            </label>
            <input
              id="cliente-last-name"
              type="text"
              placeholder="Ej. López"
              value={formData.last_name}
              onChange={(e) => onLastNameChange(e.target.value)}
              style={{
                ...inputStyle,
                ...(formErrors.last_name ? inputErrorStyle : {}),
              }}
            />
            {formErrors.last_name ? (
              <p style={errorTextStyle}>{formErrors.last_name}</p>
            ) : null}
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="cliente-phone" style={labelStyle}>
              Teléfono *
            </label>
            <input
              id="cliente-phone"
              type="text"
              inputMode="numeric"
              placeholder="Ej. 7331234567"
              value={formData.phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              style={{
                ...inputStyle,
                ...(formErrors.phone ? inputErrorStyle : {}),
              }}
            />
            {formErrors.phone ? (
              <p style={errorTextStyle}>{formErrors.phone}</p>
            ) : (
              <p style={helperTextStyle}>Solo números.</p>
            )}
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="cliente-email" style={labelStyle}>
              Red social / contacto alterno
            </label>
            <input
              id="cliente-email"
              type="text"
              placeholder="Ej. Facebook, Instagram o usuario"
              value={formData.email}
              onChange={(e) => onEmailChange(e.target.value)}
              style={{
                ...inputStyle,
                ...(formErrors.email ? inputErrorStyle : {}),
              }}
            />
            {formErrors.email ? (
              <p style={errorTextStyle}>{formErrors.email}</p>
            ) : (
              <p style={helperTextStyle}>
                Opcional. Usa el formato: insta@usuario o face@usuario.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          Sección 2: Ubicación
         ===================================================== */}
      <div style={{ marginBottom: 12 }}>
        <h4
          style={{
            ...sectionTitleStyle,
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          Ubicación
        </h4>

        <div style={formGridStyle}>
          <div style={fieldGroupStyle}>
            <label htmlFor="cliente-zone" style={labelStyle}>
              Zona
            </label>
            <input
              id="cliente-zone"
              type="text"
              placeholder="Ej. Centro"
              value={formData.zone}
              onChange={(e) => onZoneChange(e.target.value)}
              style={inputStyle}
            />
            <p style={helperTextStyle}>Útil para organizar rutas y cobranza.</p>
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="cliente-address-line" style={labelStyle}>
              Dirección
            </label>
            <input
              id="cliente-address-line"
              type="text"
              placeholder="Ej. Calle Juárez 24"
              value={formData.address_line}
              onChange={(e) => onAddressLineChange(e.target.value)}
              style={inputStyle}
            />
            <p style={helperTextStyle}>Opcional, pero útil para entregas.</p>
          </div>

          <div
            style={{
              ...fieldGroupStyle,
              gridColumn: '1 / -1',
            }}
          >
            <label htmlFor="cliente-address-reference" style={labelStyle}>
              Referencia
            </label>
            <input
              id="cliente-address-reference"
              type="text"
              placeholder="Ej. Casa azul junto a la tienda"
              value={formData.address_reference}
              onChange={(e) => onAddressReferenceChange(e.target.value)}
              style={inputStyle}
            />
            <p style={helperTextStyle}>
              Ayuda a ubicar al cliente más rápido.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          Sección 3: Crédito
         ===================================================== */}
      <div style={{ marginBottom: 12 }}>
        <h4
          style={{
            ...sectionTitleStyle,
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          Crédito
        </h4>

        <div style={formGridStyle}>
          <div style={fieldGroupStyle}>
            <label htmlFor="cliente-credit-limit" style={labelStyle}>
              Límite de crédito
            </label>
            <input
              id="cliente-credit-limit"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={formData.credit_limit}
              onChange={(e) => onCreditLimitChange(e.target.value)}
              style={{
                ...inputStyle,
                ...(formErrors.credit_limit ? inputErrorStyle : {}),
              }}
            />
            {formErrors.credit_limit ? (
              <p style={errorTextStyle}>{formErrors.credit_limit}</p>
            ) : (
              <p style={helperTextStyle}>Por defecto puede iniciar en 0.</p>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          Sección 4: Observaciones
         ===================================================== */}
      <div style={{ marginBottom: 4 }}>
        <h4
          style={{
            ...sectionTitleStyle,
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          Observaciones
        </h4>

        <div style={fieldGroupStyle}>
          <label htmlFor="cliente-notes" style={labelStyle}>
            Notas
          </label>
          <textarea
            id="cliente-notes"
            placeholder="Ej. Prefiere pago los viernes, trabaja cerca del mercado..."
            value={formData.notes}
            onChange={(e) => onNotesChange(e.target.value)}
            style={{
              ...inputStyle,
              minHeight: 82,
              resize: 'vertical',
            }}
          />
          <p style={helperTextStyle}>
            Espacio para referencias comerciales o de cobranza.
          </p>
        </div>
      </div>

      <div style={formActionsStyle}>
        <button
          type="button"
          onClick={onCancel}
          style={secondaryButtonStyle}
          disabled={saving}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={onSubmit}
          style={successButtonStyle}
          disabled={saving}
        >
          {saving
            ? isEditing
              ? 'Actualizando...'
              : 'Guardando...'
            : isEditing
              ? 'Actualizar'
              : 'Guardar'}
        </button>
      </div>
    </div>
  );
};

export default ClienteForm;