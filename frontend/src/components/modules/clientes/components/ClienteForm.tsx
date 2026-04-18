import React from 'react';
import type { ClienteFormProps } from '../types';
import {
  sectionTitleStyle,
  formGridStyle,
  fieldGroupStyle,
  formActionsStyle,
} from '../styles';
import { Button, Card, Input, SectionHeader, Textarea } from '../../../ui';

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
    <Card>
      <SectionHeader
        title={isEditing ? 'Editar cliente' : 'Registrar nuevo cliente'}
        subtitle="Captura información útil para ventas, cobranza y seguimiento del cliente."
      />

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
          <Input
            id="cliente-first-name"
            label="Nombre *"
            type="text"
            placeholder="Ej. Maria"
            value={formData.first_name}
            onChange={(e) => onFirstNameChange(e.target.value)}
            error={formErrors.first_name}
            containerStyle={fieldGroupStyle}
          />

          <Input
            id="cliente-last-name"
            label="Apellido"
            type="text"
            placeholder="Ej. Lopez"
            value={formData.last_name}
            onChange={(e) => onLastNameChange(e.target.value)}
            error={formErrors.last_name}
            containerStyle={fieldGroupStyle}
          />

          <Input
            id="cliente-phone"
            label="Telefono *"
            type="text"
            inputMode="numeric"
            placeholder="Ej. 7331234567"
            value={formData.phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            error={formErrors.phone}
            helperText="Solo numeros."
            containerStyle={fieldGroupStyle}
          />

          <Input
            id="cliente-email"
            label="Red social / contacto alterno"
            type="text"
            placeholder="Ej. Facebook, Instagram o usuario"
            value={formData.email}
            onChange={(e) => onEmailChange(e.target.value)}
            error={formErrors.email}
            helperText="Opcional. Usa el formato: insta@usuario o face@usuario."
            containerStyle={fieldGroupStyle}
          />
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
          <Input
            id="cliente-zone"
            label="Zona"
            type="text"
            placeholder="Ej. Centro"
            value={formData.zone}
            onChange={(e) => onZoneChange(e.target.value)}
            helperText="Util para organizar rutas y cobranza."
            containerStyle={fieldGroupStyle}
          />

          <Input
            id="cliente-address-line"
            label="Direccion"
            type="text"
            placeholder="Ej. Calle Juarez 24"
            value={formData.address_line}
            onChange={(e) => onAddressLineChange(e.target.value)}
            helperText="Opcional, pero util para entregas."
            containerStyle={fieldGroupStyle}
          />

          <Input
            id="cliente-address-reference"
            label="Referencia"
            type="text"
            placeholder="Ej. Casa azul junto a la tienda"
            value={formData.address_reference}
            onChange={(e) => onAddressReferenceChange(e.target.value)}
            helperText="Ayuda a ubicar al cliente mas rapido."
            containerStyle={{
              ...fieldGroupStyle,
              gridColumn: '1 / -1',
            }}
          />
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
          <Input
            id="cliente-credit-limit"
            label="Limite de credito"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={formData.credit_limit}
            onChange={(e) => onCreditLimitChange(e.target.value)}
            error={formErrors.credit_limit}
            helperText="Por defecto puede iniciar en 0."
            containerStyle={fieldGroupStyle}
          />
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

        <Textarea
          id="cliente-notes"
          label="Notas"
          placeholder="Ej. Prefiere pago los viernes, trabaja cerca del mercado..."
          value={formData.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          helperText="Espacio para referencias comerciales o de cobranza."
          rows={4}
          containerStyle={fieldGroupStyle}
        />
      </div>

      <div style={formActionsStyle}>
        <Button type="button" onClick={onCancel} variant="secondary" disabled={saving}>
          Cancelar
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          variant="primary"
          loading={saving}
          disabled={saving}
        >
          {isEditing ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </Card>
  );
};

export default ClienteForm;
