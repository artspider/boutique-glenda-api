import type { Customer } from '../../../services/clientService';

/**
 * Datos controlados por el formulario de clientes.
 * Incluye información operativa útil para ventas, cobranza y seguimiento.
 */
export type CustomerFormData = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  zone: string;
  address_line: string;
  address_reference: string;
  credit_limit: string;
  notes: string;
};

/**
 * Errores visuales asociados a cada campo del formulario.
 * No reemplaza la validación de backend; solo estructura el feedback en UI.
 */
export type CustomerFormErrors = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  credit_limit: string;
};

/**
 * Estado de retroalimentación visual del módulo.
 */
export type FeedbackState = {
  type: 'success' | 'error' | null;
  message: string;
};

/**
 * Vista activa del listado.
 * Define si se muestran clientes activos o inactivos.
 */
export type CustomersViewFilter = 'active' | 'inactive';

/**
 * Props del componente de resumen.
 */
export type ClientesSummaryProps = {
  totalClientes: number;
  activeClientes: number;
  inactiveClientes: number;
};

/**
 * Props del formulario de clientes.
 * El componente renderiza y delega todos los cambios al contenedor principal.
 */
export type ClienteFormProps = {
  formData: CustomerFormData;
  formErrors: CustomerFormErrors;
  isEditing: boolean;
  saving: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onZoneChange: (value: string) => void;
  onAddressLineChange: (value: string) => void;
  onAddressReferenceChange: (value: string) => void;
  onCreditLimitChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

/**
 * Props de la tabla de clientes.
 * Ahora incluye búsqueda y paginación controladas por el contenedor.
 */
export type ClientesTableProps = {
  clientes: Customer[];
  deletingId: number | null;
  currentView: CustomersViewFilter;
  searchTerm: string;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onChangeView: (view: CustomersViewFilter) => void;
  onSearchTermChange: (value: string) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
  onEdit: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
};

/**
 * Reexport del tipo Customer del servicio.
 */
export type { Customer };