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

type SaleType = 'immediate' | 'installments';

type ProductSelectionForm = {
  product_id: number | '';
  quantity: number;
};

type CartItem = {
  product_id: number;
  quantity: number;
};

/* =========================================================
   HELPERS / UTILIDADES
========================================================= */

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
};

/* =========================================================
   ESTILOS COMPACTOS BASE
========================================================= */

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  infoBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
    gap: '1rem',
    alignItems: 'start' as const,
  },
  column: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.35rem',
    fontWeight: 600,
    color: '#334155',
    fontSize: '0.88rem',
  },
  input: {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '0.65rem 0.8rem',
    backgroundColor: '#ffffff',
    fontSize: '0.9rem',
    boxSizing: 'border-box' as const,
  },
  miniCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.75rem 0.85rem',
  },
  miniCardLabel: {
    margin: 0,
    marginBottom: '0.25rem',
    color: '#64748b',
    fontSize: '0.8rem',
  },
  miniCardValue: {
    color: '#0f172a',
    fontSize: '0.92rem',
    fontWeight: 700,
  },
  primaryButton: {
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '0.72rem 0.95rem',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  secondaryButton: {
    border: '1px solid #bfdbfe',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '10px',
    padding: '0.7rem 0.95rem',
    fontWeight: 600,
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  dangerButton: {
    border: '1px solid #fecaca',
    backgroundColor: '#ffffff',
    color: '#dc2626',
    borderRadius: '9px',
    padding: '0.5rem 0.8rem',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 600,
  },
  softPanel: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '0.85rem',
    backgroundColor: '#f8fafc',
  },
  chip: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1d4ed8',
    borderRadius: '999px',
    padding: '0.25rem 0.65rem',
    fontSize: '0.78rem',
    fontWeight: 600,
  },
  neutralChip: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '999px',
    padding: '0.2rem 0.55rem',
    fontSize: '0.78rem',
    color: '#475569',
  },
  errorText: {
    margin: 0,
    color: '#dc2626',
    fontSize: '0.82rem',
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.75rem 0.85rem',
  },
  summaryAccentBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '10px',
    padding: '0.75rem 0.85rem',
  },
  summaryWarmBox: {
    backgroundColor: '#fff7ed',
    border: '1px solid #fdba74',
    borderRadius: '10px',
    padding: '0.75rem 0.85rem',
  },
  summaryWarnBox: {
    backgroundColor: '#fefce8',
    border: '1px solid #fde68a',
    borderRadius: '10px',
    padding: '0.75rem 0.85rem',
  },
};

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

const VentasModule: React.FC = () => {
  /* =========================================================
     ESTADOS PRINCIPALES
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

  const [productForm, setProductForm] = useState<ProductSelectionForm>({
    product_id: '',
    quantity: 1,
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [formErrors, setFormErrors] = useState({
    customer_id: '',
    product: '',
    quantity: '',
    credit: '',
  });

  /* =========================================================
     CARGA DE DATOS
  ========================================================= */

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

  useEffect(() => {
    fetchData();
  }, []);

  /* =========================================================
     HELPERS DE PRODUCTOS Y CARRITO
  ========================================================= */

  const getProductById = (productId: number | '') => {
    if (productId === '') return null;
    return products.find((product) => product.id === productId) ?? null;
  };

  const selectedProduct = useMemo(() => {
    return getProductById(productForm.product_id);
  }, [productForm.product_id, products]);

  const getCartItemSubtotal = (item: CartItem) => {
    const product = getProductById(item.product_id);
    if (!product) return 0;
    return product.sale_price * item.quantity;
  };

  const saleTotal = cartItems.reduce((total, item) => {
    return total + getCartItemSubtotal(item);
  }, 0);

  const selectedCustomerName = useMemo(() => {
    const customer = customers.find((item) => item.id === Number(formData.customer_id));
    if (!customer) return 'Sin cliente seleccionado';
    return `${customer.first_name} ${customer.last_name ?? ''}`.trim();
  }, [customers, formData.customer_id]);

  const financedBalance = Math.max(saleTotal - Number(formData.down_payment), 0);

  const estimatedPaymentAmount =
    Number(formData.number_of_payments) > 0
      ? financedBalance / Number(formData.number_of_payments)
      : 0;

  /* =========================================================
     FUNCIONES IMPORTANTES DE CAPTURA Y CARRITO
  ========================================================= */

  const resetProductForm = () => {
    setProductForm({
      product_id: '',
      quantity: 1,
    });
  };

  const handleAddToCart = () => {
    const product = getProductById(productForm.product_id);

    setFormErrors((prev) => ({
      ...prev,
      product: '',
      quantity: '',
    }));

    if (!product) {
      setFormErrors((prev) => ({
        ...prev,
        product: 'Debes seleccionar un producto',
      }));
      return;
    }

    if (productForm.quantity <= 0) {
      setFormErrors((prev) => ({
        ...prev,
        quantity: 'La cantidad debe ser mayor a 0',
      }));
      return;
    }

    const existingItem = cartItems.find((item) => item.product_id === product.id);
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const requestedTotalQuantity = currentCartQuantity + productForm.quantity;

    if (requestedTotalQuantity > product.stock) {
      setFormErrors((prev) => ({
        ...prev,
        quantity: 'No hay suficiente stock disponible',
      }));
      return;
    }

    setCartItems((prev) => {
      const itemExists = prev.some((item) => item.product_id === product.id);

      if (itemExists) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + productForm.quantity }
            : item
        );
      }

      return [...prev, { product_id: product.id, quantity: productForm.quantity }];
    });

    resetProductForm();
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  /* =========================================================
     VALIDACIÓN GENERAL DE LA VENTA
  ========================================================= */

  const validateForm = () => {
    const errors = {
      customer_id: '',
      product: '',
      quantity: '',
      credit: '',
    };

    if (!formData.customer_id) {
      errors.customer_id = 'El cliente es obligatorio';
    }

    if (cartItems.length === 0) {
      errors.product = 'Debes agregar al menos un producto al carrito';
    }

    const hasInsufficientStock = cartItems.some((item) => {
      const selectedCartProduct = getProductById(item.product_id);
      if (!selectedCartProduct) return false;
      return item.quantity > selectedCartProduct.stock;
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

    return !errors.customer_id && !errors.product && !errors.quantity && !errors.credit;
  };

  /* =========================================================
     REGISTRO DE LA VENTA
  ========================================================= */

  const handleCreateSale = async () => {
    if (!validateForm()) return;

    try {
      const items = cartItems.map((item) => {
        const selectedCartProduct = getProductById(item.product_id);

        if (!selectedCartProduct) {
          throw new Error('Selecciona un producto válido');
        }

        return {
          product_id: selectedCartProduct.id,
          quantity: item.quantity,
          unit_price: selectedCartProduct.sale_price,
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

      setCartItems([]);
      resetProductForm();

      alert('Venta registrada correctamente');
      await fetchData();
    } catch {
      alert('Error al registrar venta');
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div style={styles.page}>
      {loading && (
        <div style={styles.infoBox}>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>Cargando datos...</p>
        </div>
      )}

      {error && (
        <div style={styles.errorBox}>
          <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.9rem' }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div style={styles.mainGrid}>
          {/* =========================================================
              COLUMNA IZQUIERDA
          ========================================================= */}
          <div style={styles.column}>
            {/* =========================================================
                DATOS DE VENTA
            ========================================================= */}
            <SalesSectionCard
              title="Datos de venta"
              subtitle="Selecciona el cliente y define cómo se liquidará la venta."
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                <div>
                  <label style={styles.label}>Cliente</label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => {
                      setFormData({ ...formData, customer_id: e.target.value });
                      setFormErrors({ ...formErrors, customer_id: '' });
                    }}
                    style={styles.input}
                  >
                    <option value="">Selecciona un cliente</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.customer_id && (
                    <p style={{ ...styles.errorText, marginTop: '0.4rem' }}>
                      {formErrors.customer_id}
                    </p>
                  )}
                </div>

                <div>
                  <label style={styles.label}>Tipo de venta</label>
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
                    style={styles.input}
                  >
                    <option value="immediate">Pago inmediato</option>
                    <option value="installments">Venta a plazos</option>
                  </select>
                </div>
              </div>
            </SalesSectionCard>

            {/* =========================================================
                SELECCIÓN DE PRODUCTO
            ========================================================= */}
            <SalesSectionCard
              title="Selección de producto"
              subtitle="Selecciona un producto y agrégalo al carrito."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={styles.softPanel}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 2fr) minmax(110px, 110px)',
                      gap: '0.85rem',
                    }}
                  >
                    <div>
                      <label style={styles.label}>Producto</label>
                      <select
                        value={productForm.product_id}
                        onChange={(e) => {
                          setProductForm({
                            ...productForm,
                            product_id: e.target.value ? Number(e.target.value) : '',
                          });
                          setFormErrors({ ...formErrors, product: '' });
                        }}
                        style={styles.input}
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
                      <label style={styles.label}>Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={productForm.quantity}
                        onChange={(e) => {
                          setProductForm({
                            ...productForm,
                            quantity: Number(e.target.value) || 1,
                          });
                          setFormErrors({ ...formErrors, quantity: '' });
                        }}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '0.85rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={styles.miniCard}>
                      <p style={styles.miniCardLabel}>Precio</p>
                      <strong style={styles.miniCardValue}>
                        {selectedProduct ? formatCurrency(selectedProduct.sale_price) : '--'}
                      </strong>
                    </div>

                    <div style={styles.miniCard}>
                      <p style={styles.miniCardLabel}>Stock disponible</p>
                      <strong style={styles.miniCardValue}>
                        {selectedProduct ? selectedProduct.stock : '--'}
                      </strong>
                    </div>

                    <div style={styles.miniCard}>
                      <p style={styles.miniCardLabel}>Subtotal estimado</p>
                      <strong style={styles.miniCardValue}>
                        {selectedProduct
                          ? formatCurrency(selectedProduct.sale_price * productForm.quantity)
                          : '--'}
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {formErrors.product && <p style={styles.errorText}>{formErrors.product}</p>}
                      {formErrors.quantity && (
                        <p style={styles.errorText}>{formErrors.quantity}</p>
                      )}
                    </div>

                    <button type="button" onClick={handleAddToCart} style={styles.primaryButton}>
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </div>
            </SalesSectionCard>

            {/* =========================================================
                CARRITO DE VENTA
            ========================================================= */}
            <SalesSectionCard
              title="Carrito de venta"
              subtitle="Revisa los productos agregados antes de registrar."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                    Productos listos para registrar en la venta.
                  </p>

                  <div style={styles.chip}>
                    {cartItems.length} producto{cartItems.length === 1 ? '' : 's'}
                  </div>
                </div>

                {cartItems.length === 0 ? (
                  <div
                    style={{
                      border: '1px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '0.95rem',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                      Aún no has agregado productos al carrito.
                    </p>
                  </div>
                ) : (
                  cartItems.map((item, index) => {
                    const product = getProductById(item.product_id);
                    if (!product) return null;

                    return (
                      <div
                        key={`${item.product_id}-${index}`}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '0.85rem',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '0.85rem',
                            flexWrap: 'wrap',
                            alignItems: 'flex-start',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <strong
                              style={{
                                color: '#0f172a',
                                display: 'block',
                                fontSize: '0.92rem',
                              }}
                            >
                              {product.name}
                            </strong>

                            <div
                              style={{
                                marginTop: '0.45rem',
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                              }}
                            >
                              <span style={styles.neutralChip}>Cantidad: {item.quantity}</span>
                              <span style={styles.neutralChip}>
                                Precio: {formatCurrency(product.sale_price)}
                              </span>
                            </div>
                          </div>

                          <div style={{ minWidth: '130px', textAlign: 'right' }}>
                            <p
                              style={{
                                margin: 0,
                                color: '#64748b',
                                fontSize: '0.8rem',
                              }}
                            >
                              Subtotal
                            </p>
                            <strong
                              style={{
                                color: '#0f172a',
                                fontSize: '0.92rem',
                              }}
                            >
                              {formatCurrency(getCartItemSubtotal(item))}
                            </strong>

                            <div style={{ marginTop: '0.6rem' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveCartItem(index)}
                                style={styles.dangerButton}
                              >
                                Quitar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </SalesSectionCard>

            {/* =========================================================
                CONFIGURACIÓN DE PLAZOS
            ========================================================= */}
            {formData.sale_type === 'installments' && (
              <SalesSectionCard
                title="Configuración de plazos"
                subtitle="Define el enganche y la estructura estimada de pagos."
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.85rem',
                  }}
                >
                  <div>
                    <label style={styles.label}>Enganche</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.down_payment}
                      onChange={(e) =>
                        setFormData({ ...formData, down_payment: e.target.value })
                      }
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Número de pagos</label>
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
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Frecuencia de pago</label>
                    <select
                      value={formData.payment_frequency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payment_frequency: e.target.value,
                        })
                      }
                      style={styles.input}
                    >
                      <option value="none">Selecciona una frecuencia</option>
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quincenal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>
                </div>

                {formErrors.credit && (
                  <p style={{ ...styles.errorText, marginTop: '0.75rem' }}>
                    {formErrors.credit}
                  </p>
                )}

                <div
                  style={{
                    marginTop: '0.85rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.65rem',
                  }}
                >
                  <div style={styles.summaryWarmBox}>
                    <p
                      style={{
                        margin: 0,
                        marginBottom: '0.25rem',
                        color: '#9a3412',
                        fontSize: '0.8rem',
                      }}
                    >
                      Saldo financiado estimado
                    </p>
                    <strong
                      style={{
                        color: '#7c2d12',
                        fontSize: '0.92rem',
                      }}
                    >
                      {formatCurrency(financedBalance)}
                    </strong>
                  </div>

                  <div style={styles.summaryWarnBox}>
                    <p
                      style={{
                        margin: 0,
                        marginBottom: '0.25rem',
                        color: '#854d0e',
                        fontSize: '0.8rem',
                      }}
                    >
                      Monto estimado por pago
                    </p>
                    <strong
                      style={{
                        color: '#713f12',
                        fontSize: '0.92rem',
                      }}
                    >
                      {formatCurrency(estimatedPaymentAmount)}
                    </strong>
                  </div>
                </div>
              </SalesSectionCard>
            )}
          </div>

          {/* =========================================================
              COLUMNA DERECHA / RESUMEN
          ========================================================= */}
          <div style={styles.column}>
            <SalesSectionCard
              title="Resumen de venta"
              subtitle="Validación rápida antes de registrar."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={styles.summaryBox}>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: '0.25rem',
                      color: '#64748b',
                      fontSize: '0.8rem',
                    }}
                  >
                    Cliente
                  </p>
                  <strong
                    style={{
                      color: '#0f172a',
                      fontSize: '0.9rem',
                    }}
                  >
                    {selectedCustomerName}
                  </strong>
                </div>

                <div style={styles.summaryBox}>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: '0.25rem',
                      color: '#64748b',
                      fontSize: '0.8rem',
                    }}
                  >
                    Tipo de venta
                  </p>
                  <strong
                    style={{
                      color: '#0f172a',
                      fontSize: '0.9rem',
                    }}
                  >
                    {formData.sale_type === 'installments'
                      ? 'Venta a plazos'
                      : 'Pago inmediato'}
                  </strong>
                </div>

                <div style={styles.summaryAccentBox}>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: '0.25rem',
                      color: '#1d4ed8',
                      fontSize: '0.8rem',
                    }}
                  >
                    Total estimado
                  </p>
                  <strong
                    style={{
                      color: '#1e3a8a',
                      fontSize: '1rem',
                    }}
                  >
                    {formatCurrency(saleTotal)}
                  </strong>
                </div>

                {formData.sale_type === 'installments' && (
                  <>
                    <div style={styles.summaryWarmBox}>
                      <p
                        style={{
                          margin: 0,
                          marginBottom: '0.25rem',
                          color: '#9a3412',
                          fontSize: '0.8rem',
                        }}
                      >
                        Enganche
                      </p>
                      <strong
                        style={{
                          color: '#7c2d12',
                          fontSize: '0.9rem',
                        }}
                      >
                        {formatCurrency(Number(formData.down_payment))}
                      </strong>
                    </div>

                    <div style={styles.summaryWarnBox}>
                      <p
                        style={{
                          margin: 0,
                          marginBottom: '0.25rem',
                          color: '#854d0e',
                          fontSize: '0.8rem',
                        }}
                      >
                        Saldo pendiente
                      </p>
                      <strong
                        style={{
                          color: '#713f12',
                          fontSize: '0.9rem',
                        }}
                      >
                        {formatCurrency(financedBalance)}
                      </strong>
                    </div>
                  </>
                )}

                <div style={{ marginTop: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={handleCreateSale}
                    style={{
                      ...styles.primaryButton,
                      width: '100%',
                    }}
                  >
                    Registrar venta
                  </button>
                </div>
              </div>
            </SalesSectionCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasModule;