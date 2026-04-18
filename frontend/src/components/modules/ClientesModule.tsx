import React, { useEffect, useMemo, useState } from 'react';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
} from '../../services/clientService';

import ClienteForm from './clientes/components/ClienteForm';
import ClientesSummary from './clientes/components/ClientesSummary';
import ClientesTable from './clientes/components/ClientesTable';
import ClienteStatusConfirmDialog from './clientes/components/ClienteStatusConfirmDialog';

import type {
  Customer,
  CustomerFormData,
  CustomerFormErrors,
  FeedbackState,
  CustomersViewFilter,
} from './clientes/types';

import {
  INITIAL_FORM_DATA,
  INITIAL_FORM_ERRORS,
  sanitizePhone,
  sanitizeCreditLimit,
} from './clientes/utils';

import {
  moduleContainerStyle,
} from './clientes/styles';
import { Alert, Button, Card, SectionHeader } from '../ui';

/**
 * =========================================================
 * ClientesModule
 * ---------------------------------------------------------
 * Contenedor principal del módulo de clientes.
 *
 * Responsabilidades:
 * - cargar clientes desde la API
 * - mantener estado global del módulo
 * - coordinar subcomponentes visuales
 * - manejar flujos de crear, editar y activar/desactivar
 * - administrar feedback visual, búsqueda y paginación
 * =========================================================
 */
const ClientesModule: React.FC = () => {
  /**
   * Configuración de paginación.
   * Se deja centralizada para facilitar ajustes futuros.
   */
  const PAGE_SIZE = 8;

  /**
   * Estado principal de clientes.
   */
  const [clientes, setClientes] = useState<Customer[]>([]);

  /**
   * Estados generales de operación.
   */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Control del formulario y edición.
   */
  const [showForm, setShowForm] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);

  /**
   * Estado controlado del formulario.
   */
  const [formData, setFormData] = useState<CustomerFormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<CustomerFormErrors>(INITIAL_FORM_ERRORS);

  /**
   * Microinteracciones.
   */
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /**
   * Cliente seleccionado para confirmar cambio de estado.
   */
  const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(null);

  /**
   * Mensajes visuales del módulo.
   */
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: null,
    message: '',
  });

  /**
   * Vista actual del listado.
   * Por defecto se muestran clientes activos.
   */
  const [currentView, setCurrentView] = useState<CustomersViewFilter>('active');

  /**
   * Estado de búsqueda del listado.
   */
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Página actual del listado.
   */
  const [currentPage, setCurrentPage] = useState(1);

  const isEditing = editingCustomerId !== null;

  /**
   * Métricas rápidas del módulo.
   */
  const totalClientes = useMemo(() => clientes.length, [clientes]);

  const activeClientes = useMemo(
    () => clientes.filter((cliente) => cliente.is_active).length,
    [clientes]
  );

  const inactiveClientes = useMemo(
    () => clientes.filter((cliente) => !cliente.is_active).length,
    [clientes]
  );

  /**
   * Aplica filtro base por estado activo/inactivo.
   */
  const clientesByView = useMemo(
    () =>
      clientes.filter((cliente) =>
        currentView === 'active' ? cliente.is_active : !cliente.is_active
      ),
    [clientes, currentView]
  );

  /**
   * Aplica búsqueda sobre la vista actual.
   * Se busca por nombre completo, teléfono y zona.
   */
  const filteredClientes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return clientesByView;
    }

    return clientesByView.filter((cliente) => {
      const fullName = `${cliente.first_name ?? ''} ${cliente.last_name ?? ''}`
        .trim()
        .toLowerCase();

      const phone = (cliente.phone ?? '').toLowerCase();
      const zone = (cliente.zone ?? '').toLowerCase();

      return (
        fullName.includes(normalizedSearch) ||
        phone.includes(normalizedSearch) ||
        zone.includes(normalizedSearch)
      );
    });
  }, [clientesByView, searchTerm]);

  /**
   * Total de resultados después de aplicar filtros.
   */
  const totalResults = filteredClientes.length;

  /**
   * Total de páginas del listado.
   * Cuando no hay resultados, se mantiene en 1 para evitar estados rotos.
   */
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));

  /**
   * Clientes visibles en la página actual.
   */
  const paginatedClientes = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    return filteredClientes.slice(startIndex, endIndex);
  }, [filteredClientes, currentPage]);

  /**
   * Mantiene la página actual válida cuando cambian filtros o resultados.
   */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /**
   * Validación visual del formulario.
   */
  const validateForm = (): boolean => {
    const errors: CustomerFormErrors = {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      credit_limit: '',
    };

    if (!formData.first_name.trim()) {
      errors.first_name = 'El nombre es obligatorio';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'El apellido es obligatorio';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'El teléfono es obligatorio';
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const socialRegex = /^(insta|face)@.+$/i;

      if (!emailRegex.test(formData.email.trim()) && !socialRegex.test(formData.email.trim())) {
        errors.email = 'Usa un correo válido o el formato insta@usuario / face@usuario';
      }
    }

    const creditLimitNumber = Number(formData.credit_limit || '0');
    if (Number.isNaN(creditLimitNumber) || creditLimitNumber < 0) {
      errors.credit_limit = 'El límite de crédito debe ser mayor o igual a 0';
    }

    setFormErrors(errors);

    return (
      !errors.first_name &&
      !errors.last_name &&
      !errors.phone &&
      !errors.email &&
      !errors.credit_limit
    );
  };

  /**
   * Reinicia el formulario.
   */
  const resetFormState = () => {
    setEditingCustomerId(null);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors(INITIAL_FORM_ERRORS);
  };

  /**
   * Carga clientes desde backend.
   */
  const fetchClientes = async () => {
    try {
      const data = await getCustomers();
      setClientes(data);
      setError(null);
    } catch {
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  /**
   * Muestra u oculta el formulario.
   */
  const handleToggleForm = () => {
    setShowForm((previousValue) => {
      const nextValue = !previousValue;

      if (!nextValue) {
        resetFormState();
      }

      return nextValue;
    });

    setFeedback({ type: null, message: '' });
  };

  /**
   * Cambios de formulario.
   */
  const handleFirstNameChange = (value: string) => {
    setFormData((previous) => ({ ...previous, first_name: value }));
    setFormErrors((previous) => ({ ...previous, first_name: '' }));
  };

  const handleLastNameChange = (value: string) => {
    setFormData((previous) => ({ ...previous, last_name: value }));
    setFormErrors((previous) => ({ ...previous, last_name: '' }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((previous) => ({ ...previous, phone: sanitizePhone(value) }));
    setFormErrors((previous) => ({ ...previous, phone: '' }));
  };

  const handleEmailChange = (value: string) => {
    setFormData((previous) => ({ ...previous, email: value }));
    setFormErrors((previous) => ({ ...previous, email: '' }));
  };

  const handleZoneChange = (value: string) => {
    setFormData((previous) => ({ ...previous, zone: value }));
  };

  const handleAddressLineChange = (value: string) => {
    setFormData((previous) => ({ ...previous, address_line: value }));
  };

  const handleAddressReferenceChange = (value: string) => {
    setFormData((previous) => ({ ...previous, address_reference: value }));
  };

  const handleCreditLimitChange = (value: string) => {
    setFormData((previous) => ({
      ...previous,
      credit_limit: sanitizeCreditLimit(value),
    }));
    setFormErrors((previous) => ({ ...previous, credit_limit: '' }));
  };

  const handleNotesChange = (value: string) => {
    setFormData((previous) => ({ ...previous, notes: value }));
  };

  /**
   * Actualiza vista Activos/Inactivos y reinicia paginación.
   */
  const handleChangeView = (view: CustomersViewFilter) => {
    setCurrentView(view);
    setCurrentPage(1);
  };

  /**
   * Actualiza búsqueda y reinicia paginación.
   */
  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  /**
   * Navegación de paginación.
   */
  const handlePreviousPage = () => {
    setCurrentPage((previous) => Math.max(1, previous - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((previous) => Math.min(totalPages, previous + 1));
  };

  const handleGoToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  /**
   * Crea o actualiza cliente.
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setFeedback({ type: null, message: '' });

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      address_line: formData.address_line.trim() || null,
      address_reference: formData.address_reference.trim() || null,
      zone: formData.zone.trim() || null,
      notes: formData.notes.trim() || null,
      credit_limit: Number(formData.credit_limit || '0'),
    };

    try {
      if (editingCustomerId !== null) {
        await updateCustomer(editingCustomerId, payload);
      } else {
        await createCustomer(payload);
      }

      setShowForm(false);
      resetFormState();
      await fetchClientes();

      setFeedback({
        type: 'success',
        message:
          editingCustomerId !== null
            ? 'Cliente actualizado correctamente.'
            : 'Cliente creado correctamente.',
      });
    } catch {
      setFeedback({
        type: 'error',
        message:
          editingCustomerId !== null
            ? 'No fue posible actualizar el cliente.'
            : 'No fue posible crear el cliente.',
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Carga cliente en formulario para edición.
   */
  const handleEdit = (cliente: Customer) => {
    setEditingCustomerId(cliente.id);
    setShowForm(true);
    setFeedback({ type: null, message: '' });

    setFormData({
      first_name: cliente.first_name ?? '',
      last_name: cliente.last_name ?? '',
      phone: cliente.phone ?? '',
      email: cliente.email ?? '',
      zone: cliente.zone ?? '',
      address_line: cliente.address_line ?? '',
      address_reference: cliente.address_reference ?? '',
      credit_limit:
        cliente.credit_limit !== null && cliente.credit_limit !== undefined
          ? String(cliente.credit_limit)
          : '0',
      notes: cliente.notes ?? '',
    });

    setFormErrors(INITIAL_FORM_ERRORS);
  };

  /**
   * Abre el diálogo visual de confirmación para activar o desactivar
   * un cliente. Aquí todavía no se ejecuta la acción real.
   */
  const handleToggleStatus = (cliente: Customer) => {
    setCustomerToToggle(cliente);
  };

  /**
   * Ejecuta realmente el cambio de estado del cliente
   * después de que el usuario confirma la acción.
   */
  const handleConfirmToggleStatus = async () => {
    if (!customerToToggle) return;

    const cliente = customerToToggle;

    setDeletingId(cliente.id);
    setFeedback({ type: null, message: '' });

    try {
      await updateCustomer(cliente.id, {
        first_name: cliente.first_name ?? '',
        last_name: cliente.last_name ?? '',
        phone: cliente.phone ?? '',
        email: cliente.email ?? null,
        address_line: cliente.address_line ?? null,
        address_reference: cliente.address_reference ?? null,
        zone: cliente.zone ?? null,
        notes: cliente.notes ?? null,
        credit_limit: cliente.credit_limit ?? 0,
        is_active: !cliente.is_active,
      });

      await fetchClientes();

      setFeedback({
        type: 'success',
        message: cliente.is_active
          ? 'Cliente desactivado y movido a vista de inactivos.'
          : 'Cliente activado y movido a vista de activos.',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: cliente.is_active
          ? 'No fue posible desactivar el cliente.'
          : 'No fue posible activar el cliente.',
      });
    } finally {
      setDeletingId(null);
      setCustomerToToggle(null);
    }
  };

  /**
   * Cierra el diálogo sin ejecutar cambios.
   */
  const handleCancelToggleStatus = () => {
    setCustomerToToggle(null);
  };

  return (
    <div style={moduleContainerStyle}>
      {/* Encabezado principal del módulo */}
      <SectionHeader
        title="Clientes"
        subtitle="Administra clientes, consulta su estado y registra cambios rápidamente."
        actions={
          <Button
            variant={showForm ? 'secondary' : 'primary'}
            onClick={handleToggleForm}
          >
            {showForm ? 'Cancelar' : 'Nuevo cliente'}
          </Button>
        }
      />

      {/* Feedback visual */}
      {feedback.type === 'success' ? (
        <Alert tone="success">{feedback.message}</Alert>
      ) : null}

      {feedback.type === 'error' ? (
        <Alert tone="danger">{feedback.message}</Alert>
      ) : null}

      {error ? <Alert tone="danger">{error}</Alert> : null}

      {/* Resumen */}
      <ClientesSummary
        totalClientes={totalClientes}
        activeClientes={activeClientes}
        inactiveClientes={inactiveClientes}
      />

      {/* Formulario */}
      {showForm ? (
        <ClienteForm
          formData={formData}
          formErrors={formErrors}
          isEditing={isEditing}
          saving={saving}
          onFirstNameChange={handleFirstNameChange}
          onLastNameChange={handleLastNameChange}
          onPhoneChange={handlePhoneChange}
          onEmailChange={handleEmailChange}
          onZoneChange={handleZoneChange}
          onAddressLineChange={handleAddressLineChange}
          onAddressReferenceChange={handleAddressReferenceChange}
          onCreditLimitChange={handleCreditLimitChange}
          onNotesChange={handleNotesChange}
          onSubmit={handleSubmit}
          onCancel={handleToggleForm}
        />
      ) : null}

      {/* Tabla */}
      {loading ? (
        <Card>
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            Cargando clientes...
          </p>
        </Card>
      ) : (
        <ClientesTable
          clientes={paginatedClientes}
          deletingId={deletingId}
          currentView={currentView}
          searchTerm={searchTerm}
          currentPage={totalResults === 0 ? 0 : currentPage}
          totalPages={totalResults === 0 ? 0 : totalPages}
          totalResults={totalResults}
          pageSize={PAGE_SIZE}
          onChangeView={handleChangeView}
          onSearchTermChange={handleSearchTermChange}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onGoToPage={handleGoToPage}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Diálogo visual de confirmación para activar/desactivar */}
      {customerToToggle && (
        <ClienteStatusConfirmDialog
          customer={customerToToggle}
          loading={deletingId === customerToToggle.id}
          onConfirm={handleConfirmToggleStatus}
          onCancel={handleCancelToggleStatus}
        />
      )}
    </div>
  );
};

export default ClientesModule;
