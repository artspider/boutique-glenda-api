import { Button, Card, Input, Select, Textarea } from '../../ui';
import type { InventoryMovementFormProps } from './types';

export default function InventoryMovementForm({
  modeLabel,
  items,
  formData,
  errors,
  submitting,
  onChange,
  onSubmit,
  onCancel,
}: InventoryMovementFormProps) {
  const quantityLabel =
    formData.movement_type === 'adjustment' ? 'Nuevo stock' : 'Cantidad';

  const quantityPlaceholder =
    formData.movement_type === 'adjustment'
      ? 'Ej. 25'
      : 'Ej. 5';

  return (
    <Card variant="outlined">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-lg)' }}>{modeLabel}</h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Registra una operación manual y conserva la trazabilidad del inventario.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <Select
            id="inventory-form-product"
            label="Producto"
            value={formData.product_id}
            onChange={(event) => onChange('product_id', event.target.value)}
            error={errors.product_id}
          >
            <option value="">Selecciona un producto</option>
            {items.map((item) => (
              <option key={item.product_id} value={String(item.product_id)}>
                {item.name} ({item.sku || 'Sin SKU'})
              </option>
            ))}
          </Select>

          <Select
            id="inventory-form-type"
            label="Tipo de movimiento"
            value={formData.movement_type}
            onChange={(event) => onChange('movement_type', event.target.value)}
            error={errors.movement_type}
          >
            <option value="in">Entrada</option>
            <option value="out">Salida</option>
            <option value="adjustment">Ajuste</option>
          </Select>

          <Input
            id="inventory-form-quantity"
            label={quantityLabel}
            type="number"
            min="0"
            step="1"
            value={formData.quantity}
            onChange={(event) => onChange('quantity', event.target.value)}
            placeholder={quantityPlaceholder}
            error={errors.quantity}
            helperText={
              formData.movement_type === 'adjustment'
                ? 'Para ajuste, indica el stock final deseado del producto.'
                : 'Usa cantidades enteras mayores a cero.'
            }
          />

          <Input
            id="inventory-form-reference"
            label="Referencia"
            value={formData.reference}
            onChange={(event) => onChange('reference', event.target.value)}
            placeholder="Factura, conteo físico, proveedor..."
            error={errors.reference}
          />
        </div>

        <Textarea
          id="inventory-form-notes"
          label="Notas"
          value={formData.notes}
          onChange={(event) => onChange('notes', event.target.value)}
          placeholder="Describe el motivo del movimiento"
          rows={3}
          error={errors.notes}
        />

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Button onClick={onSubmit} loading={submitting}>
            Guardar movimiento
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        </div>
      </div>
    </Card>
  );
}
