import React, { useEffect, useMemo, useState } from 'react';
import { getCustomers } from '../../services/clientService';
import type { Customer } from '../../services/clientService';
import { getProducts } from '../../services/productService';
import type { Product } from '../../services/productService';
import { createSale } from '../../services/saleService';
import SalesSectionCard from './sales/SalesSectionCard';

type SaleItemForm = {
  product_id: number | '';
  quantity: number;
};

type SaleType = 'immediate' | 'installments';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
};

const VentasModule: React.FC = () => {
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

  const addSaleItemRow = () => {
    setSaleItems((prev) => [...prev, { product_id: '', quantity: 1 }]);
  };

  const removeSaleItemRow = (index: number) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

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

  const getProductById = (productId: number | '') => {
    if (productId === '') return null;
    return products.find((product) => product.id === productId) ?? null;
  };

  const getItemSubtotal = (item: SaleItemForm) => {
    const product = getProductById(item.product_id);

    if (!product) return 0;

    return product.sale_price * item.quantity;
  };

  const saleTotal = saleItems.reduce((total, item) => {
    return total + getItemSubtotal(item);
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

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: '#0f172a' }}>Ventas</h2>
            <p style={{ margin: '0.4rem 0 0 0', color: '#64748b' }}>
              Registra una venta con pago inmediato o en plazos de forma clara y ordenada.
            </p>
          </div>

          <button
            onClick={handleCreateSale}
            style={{
              border: 'none',
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '0.85rem 1.2rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Registrar venta
          </button>
        </div>
      </div>

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

      {!loading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

            <SalesSectionCard
              title="Selección de producto"
              subtitle="Selecciona el producto que deseas agregar al carrito."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {saleItems.map((item, index) => {
                  const selectedProduct = getProductById(item.product_id);

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
                          gridTemplateColumns: 'minmax(0, 2fr) minmax(120px, 1fr)',
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

                      {selectedProduct && (
                        <div
                          style={{
                            marginTop: '1rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                              {formatCurrency(selectedProduct.sale_price)}
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
                            <strong style={{ color: '#0f172a' }}>{selectedProduct.stock}</strong>
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
                              {formatCurrency(getItemSubtotal(item))}
                            </strong>
                          </div>
                        </div>
                      )}

                      {saleItems.length > 1 && (
                        <div style={{ marginTop: '1rem' }}>
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
                            }}
                          >
                            Quitar producto
                          </button>
                        </div>
                      )}

                      {selectedProduct && Number(item.quantity) > selectedProduct.stock && (
                        <p style={{ marginTop: '0.75rem', color: '#dc2626' }}>
                          No hay suficiente stock disponible
                        </p>
                      )}
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

            <SalesSectionCard
              title="Carrito de venta"
              subtitle="Revisa el detalle de los productos capturados."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {saleItems.map((item, index) => {
                  const selectedProduct = getProductById(item.product_id);

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
                        }}
                      >
                        <div>
                          <strong style={{ color: '#0f172a' }}>
                            {selectedProduct ? selectedProduct.name : 'Producto no seleccionado'}
                          </strong>
                          <p style={{ margin: '0.4rem 0 0 0', color: '#64748b' }}>
                            Cantidad: {item.quantity}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, color: '#64748b' }}>Subtotal</p>
                          <strong style={{ color: '#0f172a' }}>
                            {formatCurrency(getItemSubtotal(item))}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SalesSectionCard>

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
          </div>

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
            </SalesSectionCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasModule;