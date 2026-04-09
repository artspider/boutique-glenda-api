import React, { useEffect, useMemo, useState } from 'react';
import { getCustomers } from '../../services/clientService';
import type { Customer } from '../../services/clientService';
import { getProducts } from '../../services/productService';
import type { Product } from '../../services/productService';
import { createSale } from '../../services/saleService';
import SalesSectionCard from './sales/SalesSectionCard';

/* =========================================================
   TIPOS DEL MÓDULO
========================================================= */

type SaleItemForm = {
  product_id: number | '';
  quantity: number;
};

type SaleType = 'immediate' | 'installments';

/* =========================================================
   HELPERS / UTILIDADES
========================================================= */

/**
 * Formatea números como moneda MXN para mostrar importes
 * de forma consistente en toda la interfaz.
 */
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
};

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

const VentasModule: React.FC = () => {
  /* =========================================================
     ESTADOS PRINCIPALES DEL MÓDULO
  ========================================================= */

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    sale_type: 'immediate' as SaleType,
    down_payment: '0',
    number_of_payments: '0',
    payment_frequency: 'none',
  });

  const [saleItems, setSaleItems] = useState<SaleItemForm[]>([
    { product_id: '', quantity: 1 },
  ]);

  const [formErrors, setFormErrors] = useState({
    customer_id: '',
    product_id: '',
    quantity: '',
    credit: '',
  });

  /* =========================================================
     FUNCIONES DE CARGA DE DATOS
  ========================================================= */

  /**
   * Carga clientes y productos necesarios para construir la venta.
   * Mantiene el módulo aislado del historial de ventas, ya que este
   * flujo ahora se enfoca únicamente en registrar una venta.
   */
  const fetchData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([
        getCustomers(),
        getProducts(),
      ]);

      setCustomers(customersData);
      setProducts(productsData.filter((p) => p.is_active !== false));
      setError(null);
    } catch {
      setError('Error al cargar datos para ventas');
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FUNCIONES DE MANEJO DEL CARRITO / ITEMS DE VENTA
  ========================================================= */

  /**
   * Agrega una nueva fila vacía de producto al formulario de venta.
   */
  const addSaleItemRow = () => {
    setSaleItems((prev) => [...prev, { product_id: '', quantity: 1 }]);
  };

  /**
   * Elimina una fila de producto por índice.
   */
  const removeSaleItemRow = (index: number) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Actualiza una propiedad específica de una fila de producto.
   * Se usa para cambiar producto o cantidad sin romper el resto del item.
   */
  const updateSaleItem = (
    index: number,
    field: keyof SaleItemForm,
    value: number | ''
  ) => {
    setSaleItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === 'quantity' ? Number(value) || 0 : value,
            }
          : item
      )
    );
  };

  /**
   * Recupera el producto completo a partir de su id.
   */
  const getProductById = (productId: number | '') => {
    if (productId === '') return null;
    return products.find((product) => product.id === productId) ?? null;
  };

  /**
   * Calcula el subtotal de una fila del carrito.
   */
  const getItemSubtotal = (item: SaleItemForm) => {
    const product = getProductById(item.product_id);

    if (!product) return 0;

    return product.sale_price * item.quantity;
  };

  /* =========================================================
     CÁLCULOS DERIVADOS IMPORTANTES
  ========================================================= */

  /**
   * Total estimado de la venta.
   */
  const saleTotal = saleItems.reduce((total, item) => {
    return total + getItemSubtotal(item);
  }, 0);

  /**
   * Nombre del cliente seleccionado para mostrarlo en el resumen.
   */
  const selectedCustomerName = useMemo(() => {
    const customer = customers.find((item) => item.id === Number(formData.customer_id));
    if (!customer) return 'Sin cliente seleccionado';
    return `${customer.first_name} ${customer.last_name ?? ''}`.trim();
  }, [customers, formData.customer_id]);

  /**
   * Saldo financiado cuando la venta es a plazos.
   */
  const financedBalance = Math.max(saleTotal - Number(formData.down_payment), 0);

  /**
   * Monto estimado por pago para ventas a plazos.
   */
  const estimatedPaymentAmount =
    Number(formData.number_of_payments) > 0
      ? financedBalance / Number(formData.number_of_payments)
      : 0;

  /**
   * Cuenta solo los productos válidos seleccionados en el carrito.
   */
  const validItemsCount = saleItems.filter((item) => item.product_id !== '').length;

  /* =========================================================
     VALIDACIONES IMPORTANTES DEL MÓDULO
  ========================================================= */

  /**
   * Valida el formulario completo antes de registrar la venta.
   * Incluye validación de cliente, productos, cantidades, stock
   * y reglas específicas cuando la venta es a plazos.
   */
  const validateForm = () => {
    const errors = {
      customer_id: '',
      product_id: '',
      quantity: '',
      credit: '',
    };

    if (!formData.customer_id) {
      errors.customer_id = 'El cliente es obligatorio';
    }

    if (saleItems.length === 0) {
      errors.product_id = 'Debes agregar al menos un producto';
    }

    const hasEmptyProduct = saleItems.some((item) => !item.product_id);
    if (hasEmptyProduct) {
      errors.product_id = 'El producto es obligatorio';
    }

    const hasInvalidQuantity = saleItems.some((item) => item.quantity <= 0);
    if (hasInvalidQuantity) {
      errors.quantity = 'La cantidad debe ser mayor a 0';
    }

    const hasInsufficientStock = saleItems.some((item) => {
      const selectedProduct = getProductById(item.product_id);
      if (!selectedProduct) return false;
      return item.quantity > selectedProduct.stock;
    });

    if (hasInsufficientStock) {
      errors.quantity = 'No hay suficiente stock disponible';
    }

    if (formData.sale_type === 'installments') {
      if (Number(formData.number_of_payments) <= 0) {
        errors.credit = 'El número de pagos debe ser mayor a 0';
      }

      if (!errors.credit && formData.payment_frequency === 'none') {
        errors.credit = 'Selecciona una frecuencia de pago';
      }

      if (!errors.credit && Number(formData.down_payment) < 0) {
        errors.credit = 'El enganche no puede ser negativo';
      }

      if (!errors.credit && Number(formData.down_payment) > saleTotal) {
        errors.credit = 'El enganche no puede ser mayor al total de la venta';
      }
    }

    setFormErrors(errors);

    return !errors.customer_id && !errors.product_id && !errors.quantity && !errors.credit;
  };

  /* =========================================================
     EFECTOS DEL COMPONENTE
  ========================================================= */

  /**
   * Carga inicial del módulo.
   */
  useEffect(() => {
    fetchData();
  }, []);

  /* =========================================================
     FUNCIÓN PRINCIPAL DE REGISTRO DE VENTA
  ========================================================= */

  /**
   * Construye el payload final y registra la venta contra el backend.
   * Aquí hacemos el mapeo entre la semántica del frontend:
   * - immediate / installments
   * y el contrato actual del backend:
   * - payment_type / is_credit
   */
  const handleCreateSale = async () => {
    if (!validateForm()) return;

    try {
      const items = saleItems.map((item) => {
        const selectedProduct = getProductById(item.product_id);

        if (!selectedProduct) {
          throw new Error('Selecciona un producto válido');
        }

        return {
          product_id: selectedProduct.id,
          quantity: item.quantity,
          unit_price: selectedProduct.sale_price,
        };
      });

      await createSale({
        customer_id: Number(formData.customer_id),
        user_id: 1,
        payment_type: formData.sale_type === 'installments' ? 'credit' : 'cash',
        items,
        is_credit: formData.sale_type === 'installments',
        down_payment: Number(formData.down_payment),
        number_of_payments: Number(formData.number_of_payments),
        payment_frequency: formData.payment_frequency,
      });

      setFormData({
        customer_id: '',
        sale_type: 'immediate',
        down_payment: '0',
        number_of_payments: '0',
        payment_frequency: 'none',
      });

      setSaleItems([{ product_id: '', quantity: 1 }]);

      alert('Venta registrada correctamente');
      await fetchData();
    } catch {
      alert('Error al registrar venta');
    }
  };

  /* =========================================================
     RENDER DEL MÓDULO
  ========================================================= */

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>


      {/* =========================================================
          INICIO — ESTADO DE CARGA
      ========================================================= */}
      {loading && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
          }}
        >
          <p style={{ margin: 0, color: '#475569' }}>Cargando datos...</p>
        </div>
      )}
      {/* =========================================================
          FIN — ESTADO DE CARGA
      ========================================================= */}

      {/* =========================================================
          INICIO — ESTADO DE ERROR
      ========================================================= */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
          }}
        >
          <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p>
        </div>
      )}
      {/* =========================================================
          FIN — ESTADO DE ERROR
      ========================================================= */}

      {/* =========================================================
          INICIO — CONTENIDO PRINCIPAL DEL MÓDULO
      ========================================================= */}
      {!loading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* =========================================================
              INICIO — COLUMNA IZQUIERDA
          ========================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* =========================================================
                INICIO — APARTADO DATOS DE VENTA
            ========================================================= */}
            <SalesSectionCard
              title="Datos de venta"
              subtitle="Selecciona el cliente y define cómo se liquidará la venta."
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 600,
                      color: '#334155',
                    }}
                  >
                    Cliente
                  </label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => {
                      setFormData({ ...formData, customer_id: e.target.value });
                      setFormErrors({ ...formErrors, customer_id: '' });
                    }}
                    style={{
                      width: '100%',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="">Selecciona un cliente</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.customer_id && (
                    <p style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.9rem' }}>
                      {formErrors.customer_id}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 600,
                      color: '#334155',
                    }}
                  >
                    Tipo de venta
                  </label>
                  <select
                    value={formData.sale_type}
                    onChange={(e) => {
                      const nextSaleType = e.target.value as SaleType;

                      setFormData({
                        ...formData,
                        sale_type: nextSaleType,
                        down_payment:
                          nextSaleType === 'installments' ? formData.down_payment : '0',
                        number_of_payments:
                          nextSaleType === 'installments'
                            ? formData.number_of_payments
                            : '0',
                        payment_frequency:
                          nextSaleType === 'installments'
                            ? formData.payment_frequency
                            : 'none',
                      });
                    }}
                    style={{
                      width: '100%',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="immediate">Pago inmediato</option>
                    <option value="installments">Venta a plazos</option>
                  </select>
                </div>
              </div>
            </SalesSectionCard>
            {/* =========================================================
                FIN — APARTADO DATOS DE VENTA
            ========================================================= */}

            {/* =========================================================
                INICIO — APARTADO SELECCIÓN DE PRODUCTO
            ========================================================= */}
            <SalesSectionCard
  title="Selección de producto"
  subtitle="Captura los productos que formarán parte de la venta."
>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {saleItems.map((item, index) => {
      const selectedProduct = getProductById(item.product_id);
      const subtotal = getItemSubtotal(item);

      return (
        <div
          key={index}
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1rem',
            backgroundColor: '#f8fafc',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(120px, 120px)',
              gap: '1rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                Producto
              </label>
              <select
                value={item.product_id}
                onChange={(e) => {
                  updateSaleItem(
                    index,
                    'product_id',
                    e.target.value ? Number(e.target.value) : ''
                  );
                  setFormErrors({ ...formErrors, product_id: '' });
                }}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="">Selecciona un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => {
                  updateSaleItem(index, 'quantity', Number(e.target.value));
                  setFormErrors({ ...formErrors, quantity: '' });
                }}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#ffffff',
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
              }}
            >
              <p style={{ margin: 0, marginBottom: '0.35rem', color: '#64748b' }}>
                Precio
              </p>
              <strong style={{ color: '#0f172a' }}>
                {selectedProduct ? formatCurrency(selectedProduct.sale_price) : '--'}
              </strong>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
              }}
            >
              <p style={{ margin: 0, marginBottom: '0.35rem', color: '#64748b' }}>
                Stock disponible
              </p>
              <strong style={{ color: '#0f172a' }}>
                {selectedProduct ? selectedProduct.stock : '--'}
              </strong>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
              }}
            >
              <p style={{ margin: 0, marginBottom: '0.35rem', color: '#64748b' }}>
                Subtotal
              </p>
              <strong style={{ color: '#0f172a' }}>
                {selectedProduct ? formatCurrency(subtotal) : '--'}
              </strong>
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {selectedProduct && Number(item.quantity) > selectedProduct.stock ? (
              <p style={{ margin: 0, color: '#dc2626', fontSize: '0.9rem' }}>
                No hay suficiente stock disponible
              </p>
            ) : (
              <div />
            )}

            {saleItems.length > 1 && (
              <button
                type="button"
                onClick={() => removeSaleItemRow(index)}
                style={{
                  border: '1px solid #fecaca',
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Quitar producto
              </button>
            )}
          </div>
        </div>
      );
    })}

    <div>
      <button
        type="button"
        onClick={addSaleItemRow}
        style={{
          border: '1px solid #bfdbfe',
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          borderRadius: '12px',
          padding: '0.8rem 1rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Agregar producto
      </button>
    </div>

    {formErrors.product_id && (
      <p style={{ margin: 0, color: '#dc2626', fontSize: '0.9rem' }}>
        {formErrors.product_id}
      </p>
    )}

    {formErrors.quantity && (
      <p style={{ margin: 0, color: '#dc2626', fontSize: '0.9rem' }}>
        {formErrors.quantity}
      </p>
    )}
  </div>
</SalesSectionCard>
            {/* =========================================================
                FIN — APARTADO SELECCIÓN DE PRODUCTO
            ========================================================= */}

            {/* =========================================================
                INICIO — APARTADO CARRITO DE VENTA
            ========================================================= */}
            <SalesSectionCard
              title="Carrito de venta"
              subtitle="Revisa el detalle de los productos capturados."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <p style={{ margin: 0, color: '#64748b' }}>
                    Productos listos para registrar en la venta.
                  </p>

                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      borderRadius: '999px',
                      padding: '0.35rem 0.8rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {validItemsCount} producto{validItemsCount === 1 ? '' : 's'}
                  </div>
                </div>

                {validItemsCount === 0 ? (
                  <div
                    style={{
                      border: '1px dashed #cbd5e1',
                      borderRadius: '14px',
                      padding: '1.2rem',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <p style={{ margin: 0, color: '#64748b' }}>
                      Aún no has seleccionado productos válidos para la venta.
                    </p>
                  </div>
                ) : (
                  saleItems.map((item, index) => {
                    const selectedProduct = getProductById(item.product_id);

                    if (!selectedProduct) return null;

                    return (
                      <div
                        key={index}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '1rem',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            flexWrap: 'wrap',
                            alignItems: 'flex-start',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <strong style={{ color: '#0f172a', display: 'block' }}>
                              {selectedProduct.name}
                            </strong>

                            <div
                              style={{
                                marginTop: '0.6rem',
                                display: 'flex',
                                gap: '0.75rem',
                                flexWrap: 'wrap',
                              }}
                            >
                              <span
                                style={{
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '999px',
                                  padding: '0.25rem 0.65rem',
                                  fontSize: '0.85rem',
                                  color: '#475569',
                                }}
                              >
                                Cantidad: {item.quantity}
                              </span>

                              <span
                                style={{
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '999px',
                                  padding: '0.25rem 0.65rem',
                                  fontSize: '0.85rem',
                                  color: '#475569',
                                }}
                              >
                                Precio: {formatCurrency(selectedProduct.sale_price)}
                              </span>
                            </div>
                          </div>

                          <div style={{ minWidth: '140px', textAlign: 'right' }}>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                              Subtotal
                            </p>
                            <strong style={{ color: '#0f172a', fontSize: '1rem' }}>
                              {formatCurrency(getItemSubtotal(item))}
                            </strong>

                            {saleItems.length > 1 && (
                              <div style={{ marginTop: '0.75rem' }}>
                                <button
                                  type="button"
                                  onClick={() => removeSaleItemRow(index)}
                                  style={{
                                    border: '1px solid #fecaca',
                                    backgroundColor: '#ffffff',
                                    color: '#dc2626',
                                    borderRadius: '10px',
                                    padding: '0.55rem 0.9rem',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  Quitar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </SalesSectionCard>
            {/* =========================================================
                FIN — APARTADO CARRITO DE VENTA
            ========================================================= */}

            {/* =========================================================
                INICIO — APARTADO CONFIGURACIÓN DE PLAZOS
            ========================================================= */}
            {formData.sale_type === 'installments' && (
              <SalesSectionCard
                title="Configuración de plazos"
                subtitle="Define el enganche y la estructura estimada de pagos."
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#334155',
                      }}
                    >
                      Enganche
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.down_payment}
                      onChange={(e) =>
                        setFormData({ ...formData, down_payment: e.target.value })
                      }
                      style={{
                        width: '100%',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#334155',
                      }}
                    >
                      Número de pagos
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.number_of_payments}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          number_of_payments: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#334155',
                      }}
                    >
                      Frecuencia de pago
                    </label>
                    <select
                      value={formData.payment_frequency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payment_frequency: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="none">Selecciona una frecuencia</option>
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quincenal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>
                </div>

                {formErrors.credit && (
                  <p style={{ marginTop: '1rem', color: '#dc2626', fontSize: '0.9rem' }}>
                    {formErrors.credit}
                  </p>
                )}

                <div
                  style={{
                    marginTop: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#fff7ed',
                      border: '1px solid #fdba74',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                    }}
                  >
                    <p style={{ margin: 0, marginBottom: '0.35rem', color: '#9a3412' }}>
                      Saldo financiado estimado
                    </p>
                    <strong style={{ color: '#7c2d12' }}>
                      {formatCurrency(financedBalance)}
                    </strong>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#fefce8',
                      border: '1px solid #fde68a',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                    }}
                  >
                    <p style={{ margin: 0, marginBottom: '0.35rem', color: '#854d0e' }}>
                      Monto estimado por pago
                    </p>
                    <strong style={{ color: '#713f12' }}>
                      {formatCurrency(estimatedPaymentAmount)}
                    </strong>
                  </div>
                </div>
              </SalesSectionCard>
            )}
            {/* =========================================================
                FIN — APARTADO CONFIGURACIÓN DE PLAZOS
            ========================================================= */}
          </div>
          {/* =========================================================
              FIN — COLUMNA IZQUIERDA
          ========================================================= */}

          {/* =========================================================
              INICIO — COLUMNA DERECHA / RESUMEN
          ========================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SalesSectionCard
              title="Resumen de venta"
              subtitle="Validación rápida antes de registrar."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.9rem 1rem',
                  }}
                >
                  <p style={{ margin: 0, marginBottom: '0.35rem', color: '#64748b' }}>
                    Cliente
                  </p>
                  <strong style={{ color: '#0f172a' }}>{selectedCustomerName}</strong>
                </div>

                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.9rem 1rem',
                  }}
                >
                  <p style={{ margin: 0, marginBottom: '0.35rem', color: '#64748b' }}>
                    Tipo de venta
                  </p>
                  <strong style={{ color: '#0f172a' }}>
                    {formData.sale_type === 'installments'
                      ? 'Venta a plazos'
                      : 'Pago inmediato'}
                  </strong>
                </div>

                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '0.9rem 1rem',
                  }}
                >
                  <p style={{ margin: 0, marginBottom: '0.35rem', color: '#1d4ed8' }}>
                    Total estimado
                  </p>
                  <strong style={{ color: '#1e3a8a', fontSize: '1.1rem' }}>
                    {formatCurrency(saleTotal)}
                  </strong>
                </div>

                {formData.sale_type === 'installments' && (
                  <>
                    <div
                      style={{
                        backgroundColor: '#fff7ed',
                        border: '1px solid #fdba74',
                        borderRadius: '12px',
                        padding: '0.9rem 1rem',
                      }}
                    >
                      <p style={{ margin: 0, marginBottom: '0.35rem', color: '#9a3412' }}>
                        Enganche
                      </p>
                      <strong style={{ color: '#7c2d12' }}>
                        {formatCurrency(Number(formData.down_payment))}
                      </strong>
                    </div>

                    <div
                      style={{
                        backgroundColor: '#fefce8',
                        border: '1px solid #fde68a',
                        borderRadius: '12px',
                        padding: '0.9rem 1rem',
                      }}
                    >
                      <p style={{ margin: 0, marginBottom: '0.35rem', color: '#854d0e' }}>
                        Saldo pendiente
                      </p>
                      <strong style={{ color: '#713f12' }}>
                        {formatCurrency(financedBalance)}
                      </strong>
                    </div>
                  </>
                )}
              </div>

            {/* ============================
            Botón para registro de venta
            ================================ */}
            <div style={{ marginTop: '1rem' }}>
              <button
                type="button"
                onClick={handleCreateSale}
                style={{
                  width: '100%',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '0.9rem 1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Registrar venta
              </button>
            </div>
            {/* ==================================
                FIN Botón para registro de venta
             ===================================== */}
          </SalesSectionCard>
          </div>
          {/* =========================================================
              FIN — COLUMNA DERECHA / RESUMEN
          ========================================================= */}
        </div>
      )}
      {/* =========================================================
          FIN — CONTENIDO PRINCIPAL DEL MÓDULO
      ========================================================= */}
    </div>
  );
};

export default VentasModule;