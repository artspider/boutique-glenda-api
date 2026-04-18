import React, { useEffect, useMemo, useState } from 'react';
import {
  createInventoryMovement,
  getInventoryItems,
  getInventoryMovements,
  getProductInventoryMovements,
} from '../../services/inventoryService';
import type { InventoryMovementType } from './inventario/types';
import { Alert, Button, Card, EmptyState, SectionHeader } from '../ui';
import InventoryMovementForm from './inventario/InventoryMovementForm';
import InventarioMovementsPanel from './inventario/InventarioMovementsPanel';
import InventarioSummary from './inventario/InventarioSummary';
import InventarioTable from './inventario/InventarioTable';
import {
  INITIAL_INVENTORY_MOVEMENT_FORM,
  toMovementPayload,
  type InventoryFilter,
  type InventoryItem,
  type InventoryMovement,
  type InventoryMovementFormData,
  type InventoryMovementFormErrors,
} from './inventario/types';
import { inventoryGridStyle } from './inventario/utils';

const InventarioModule: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InventoryFilter>('all');
  const [includeInactive, setIncludeInactive] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formModeLabel, setFormModeLabel] = useState('Registrar entrada');
  const [formData, setFormData] = useState<InventoryMovementFormData>(
    INITIAL_INVENTORY_MOVEMENT_FORM
  );
  const [formErrors, setFormErrors] = useState<InventoryMovementFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [itemsData, movementsData] = await Promise.all([
        getInventoryItems(true),
        getInventoryMovements(10),
      ]);
      setItems(itemsData);
      setMovements(movementsData);
      setError(null);
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'No se pudo cargar inventario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      if (!includeInactive && !item.is_active) {
        return false;
      }

      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        item.name.toLowerCase().includes(normalizedSearch) ||
        (item.sku || '').toLowerCase().includes(normalizedSearch)
      );
    });
  }, [items, searchTerm, statusFilter, includeInactive]);

  const alertItems = useMemo(
    () => items.filter((item) => item.is_active && item.status !== 'healthy').slice(0, 4),
    [items]
  );

  const selectedProduct = useMemo(
    () => items.find((item) => item.product_id === selectedProductId) ?? null,
    [items, selectedProductId]
  );

  const summary = useMemo(
    () => ({
      monitoredProducts: items.filter((item) => item.is_active).length,
      lowStockProducts: items.filter((item) => item.status === 'low_stock').length,
      outOfStockProducts: items.filter((item) => item.status === 'out_of_stock').length,
      recentMovements: movements.length,
    }),
    [items, movements]
  );

  const openForm = (movementType: InventoryMovementType, productId?: number) => {
    const labels: Record<InventoryMovementType, string> = {
      in: 'Registrar entrada',
      out: 'Registrar salida',
      adjustment: 'Ajustar stock',
    };

    setFormModeLabel(labels[movementType]);
    setShowForm(true);
    setFormErrors({});
    setFeedback({ type: null, message: '' });
    setFormData({
      ...INITIAL_INVENTORY_MOVEMENT_FORM,
      movement_type: movementType,
      product_id: productId ? String(productId) : '',
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setFormErrors({});
    setFormData(INITIAL_INVENTORY_MOVEMENT_FORM);
  };

  const handleFormChange = (field: keyof InventoryMovementFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
    setFormErrors((previous) => ({
      ...previous,
      [field]: '',
    }));
  };

  const validateForm = (): InventoryMovementFormErrors => {
    const errors: InventoryMovementFormErrors = {};

    if (!formData.product_id) {
      errors.product_id = 'Selecciona un producto.';
    }

    if (formData.quantity.trim() === '') {
      errors.quantity = 'Ingresa una cantidad.';
    } else {
      const quantity = Number(formData.quantity);
      if (!Number.isInteger(quantity) || quantity < 0) {
        errors.quantity = 'Usa un valor entero válido.';
      }
      if (formData.movement_type !== 'adjustment' && quantity <= 0) {
        errors.quantity = 'La cantidad debe ser mayor a cero.';
      }
    }

    return errors;
  };

  const loadMovementsForProduct = async (productId: number | null) => {
    try {
      setMovementsLoading(true);
      const data = productId
        ? await getProductInventoryMovements(productId, 20)
        : await getInventoryMovements(10);
      setMovements(data);
    } catch (errorValue) {
      setFeedback({
        type: 'error',
        message:
          errorValue instanceof Error
            ? errorValue.message
            : 'No se pudo cargar el historial de movimientos.',
      });
    } finally {
      setMovementsLoading(false);
    }
  };

  const handleViewHistory = async (productId: number) => {
    setSelectedProductId(productId);
    await loadMovementsForProduct(productId);
  };

  const handleClearSelection = async () => {
    setSelectedProductId(null);
    await loadMovementsForProduct(null);
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm();
    setFormErrors(nextErrors);
    setFeedback({ type: null, message: '' });

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);
      await createInventoryMovement(toMovementPayload(formData));
      await fetchInventoryData();

      if (selectedProductId) {
        await loadMovementsForProduct(selectedProductId);
      }

      setFeedback({
        type: 'success',
        message:
          formData.movement_type === 'adjustment'
            ? 'Ajuste de inventario registrado correctamente.'
            : 'Movimiento de inventario registrado correctamente.',
      });
      resetForm();
    } catch (errorValue) {
      setFeedback({
        type: 'error',
        message:
          errorValue instanceof Error
            ? errorValue.message
            : 'No fue posible registrar el movimiento.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <SectionHeader
        title="Inventario"
        subtitle="Supervisa existencias, revisa alertas críticas y registra movimientos manuales con trazabilidad."
        actions={
          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
            <Button onClick={() => openForm('in')}>Registrar entrada</Button>
            <Button variant="secondary" onClick={() => openForm('adjustment')}>
              Ajustar stock
            </Button>
          </div>
        }
      />

      {feedback.type === 'success' ? <Alert tone="success">{feedback.message}</Alert> : null}
      {feedback.type === 'error' ? <Alert tone="danger">{feedback.message}</Alert> : null}
      {error ? <Alert tone="danger">{error}</Alert> : null}

      <InventarioSummary {...summary} />

      {alertItems.length > 0 ? (
        <Card variant="soft">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-lg)' }}>Alertas críticas</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Productos que requieren atención inmediata por agotamiento o stock bajo.
              </p>
            </div>
            <div style={inventoryGridStyle}>
              {alertItems.map((item) => (
                <Card key={item.product_id} variant="outlined" padding="sm">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <strong>{item.name}</strong>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {item.sku || 'Sin SKU'} · Stock actual {item.stock} / mínimo {item.minimum_stock}
                    </p>
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <Button size="sm" onClick={() => openForm('in', item.product_id)}>
                        Reponer
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleViewHistory(item.product_id)}>
                        Ver historial
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="Inventario bajo control"
          description="No hay productos agotados ni con stock bajo en este momento."
        />
      )}

      {showForm ? (
        <InventoryMovementForm
          modeLabel={formModeLabel}
          items={items}
          formData={formData}
          errors={formErrors}
          submitting={submitting}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      ) : null}

      {loading ? (
        <Alert tone="info">Cargando inventario...</Alert>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '0.85rem',
          }}
        >
          <InventarioTable
            items={filteredItems}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            includeInactive={includeInactive}
            selectedProductId={selectedProductId}
            onSearchTermChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onIncludeInactiveChange={setIncludeInactive}
            onViewHistory={handleViewHistory}
            onCreateEntry={(productId) => openForm('in', productId)}
            onAdjustStock={(productId) => openForm('adjustment', productId)}
            onManualOut={(productId) => openForm('out', productId)}
          />

          <InventarioMovementsPanel
            movements={movements}
            loading={movementsLoading}
            selectedProductName={selectedProduct?.name || null}
            onClearSelection={handleClearSelection}
          />
        </div>
      )}
    </div>
  );
};

export default InventarioModule;
