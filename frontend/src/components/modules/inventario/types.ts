import type {
  CreateInventoryMovementPayload,
  InventoryItem,
  InventoryMovement,
  InventoryMovementType,
  InventoryStatus,
} from '../../../services/inventoryService';

export type { InventoryItem, InventoryMovement, InventoryMovementType, InventoryStatus };

export type InventoryFilter = 'all' | 'healthy' | 'low_stock' | 'out_of_stock';

export type InventorySummaryProps = {
  monitoredProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  recentMovements: number;
};

export type InventoryTableProps = {
  items: InventoryItem[];
  searchTerm: string;
  statusFilter: InventoryFilter;
  includeInactive: boolean;
  selectedProductId: number | null;
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: InventoryFilter) => void;
  onIncludeInactiveChange: (value: boolean) => void;
  onViewHistory: (productId: number) => void;
  onCreateEntry: (productId: number) => void;
  onAdjustStock: (productId: number) => void;
  onManualOut: (productId: number) => void;
};

export type InventoryMovementsPanelProps = {
  movements: InventoryMovement[];
  loading: boolean;
  selectedProductName: string | null;
  onClearSelection: () => void;
};

export type InventoryMovementFormData = {
  product_id: string;
  movement_type: InventoryMovementType;
  quantity: string;
  reference: string;
  notes: string;
};

export type InventoryMovementFormErrors = Partial<Record<keyof InventoryMovementFormData, string>>;

export type InventoryMovementFormProps = {
  modeLabel: string;
  items: InventoryItem[];
  formData: InventoryMovementFormData;
  errors: InventoryMovementFormErrors;
  submitting: boolean;
  onChange: (field: keyof InventoryMovementFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export const INITIAL_INVENTORY_MOVEMENT_FORM: InventoryMovementFormData = {
  product_id: '',
  movement_type: 'in',
  quantity: '',
  reference: '',
  notes: '',
};

export const toMovementPayload = (
  formData: InventoryMovementFormData
): CreateInventoryMovementPayload => ({
  product_id: Number(formData.product_id),
  movement_type: formData.movement_type,
  quantity: Number(formData.quantity),
  reference: formData.reference.trim() || null,
  notes: formData.notes.trim() || null,
});
