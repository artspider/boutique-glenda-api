import React, { useEffect, useState } from 'react';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../../services/clientService';
import type { Customer } from '../../services/clientService';

const ClientesModule: React.FC = () => {
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [formErrors, setFormErrors] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  const validateForm = () => {
    const errors = {
      first_name: '',
      last_name: '',
      phone: '',
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

    setFormErrors(errors);

    return !errors.first_name && !errors.last_name && !errors.phone;
  };

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

  const handleCreate = async () => {
  if (!validateForm()) return;

  try {
    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
    };

    if (editingCustomerId !== null) {
      await updateCustomer(editingCustomerId, payload);
    } else {
      await createCustomer(payload);
    }

    setShowForm(false);
    setEditingCustomerId(null);
    setFormData({ first_name: '', last_name: '', phone: '' });
    setFormErrors({ first_name: '', last_name: '', phone: '' });
    fetchClientes();
  } catch {
    alert(
      editingCustomerId !== null
        ? 'Error al actualizar cliente'
        : 'Error al crear cliente'
    );
  }
};

  const handleEditClick = (cliente: Customer) => {
    setEditingCustomerId(cliente.id);
    setShowForm(true);
    setFormData({
      first_name: cliente.first_name ?? '',
      last_name: cliente.last_name ?? '',
      phone: cliente.phone ?? '',
    });
    setFormErrors({ first_name: '', last_name: '', phone: '' });
  };

  const handleDeleteClick = async (customerId: number) => {
  const confirmed = window.confirm('¿Deseas eliminar este cliente?');

  if (!confirmed) return;

  try {
    await deleteCustomer(customerId);
    fetchClientes();
  } catch {
    alert('Error al eliminar cliente');
  }
};

  return (
    <div>
      <h2>Clientes</h2>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => {
            setShowForm(!showForm);

            if (showForm) {
              setEditingCustomerId(null);
              setFormData({ first_name: '', last_name: '', phone: '' });
              setFormErrors({ first_name: '', last_name: '', phone: '' });
            }
          }}
        >
          {showForm ? 'Cancelar' : 'Nuevo cliente'}
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '1rem' }}>
          <div>
            <input
              placeholder="Nombre"
              value={formData.first_name}
              onChange={(e) => {
                setFormData({ ...formData, first_name: e.target.value });
                setFormErrors({ ...formErrors, first_name: '' });
              }}
            />
            {formErrors.first_name && <p>{formErrors.first_name}</p>}
          </div>

          <div>
            <input
              placeholder="Apellido"
              value={formData.last_name}
              onChange={(e) => {
                setFormData({ ...formData, last_name: e.target.value });
                setFormErrors({ ...formErrors, last_name: '' });
              }}
            />
            {formErrors.last_name && <p>{formErrors.last_name}</p>}
          </div>

          <div>
            <input
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, phone: onlyNumbers });
                setFormErrors({ ...formErrors, phone: '' });
              }}
            />
            {formErrors.phone && <p>{formErrors.phone}</p>}
          </div>

          <button onClick={handleCreate}>
            {editingCustomerId !== null ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      )}

      {loading && <p>Cargando clientes...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Zona</th>
              <th>Límite crédito</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}>
                <td>{c.first_name} {c.last_name}</td>
                <td>{c.phone || '-'}</td>
                <td>{c.email || '-'}</td>
                <td>{c.zone || '-'}</td>
                <td>{c.credit_limit ?? '-'}</td>
                <td>{c.is_active ? 'Activo' : 'Inactivo'}</td>
                <td>
                  <button onClick={() => handleEditClick(c)}>Editar</button>
                  <button onClick={() => handleDeleteClick(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClientesModule;