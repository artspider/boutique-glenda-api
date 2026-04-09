import React, { useEffect, useState } from 'react';
import { getCustomers } from '../../services/clientService';
import type { Customer } from '../../services/clientService';
import { getProducts } from '../../services/productService';
import type { Product } from '../../services/productService';
import { createSale, getSales } from '../../services/saleService';
import type { Sale } from '../../services/saleService';

type SaleItemForm = {
  product_id: number | '';
  quantity: number;
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

  type SaleType = 'immediate' | 'installments';

  const [formErrors, setFormErrors] = useState({
    customer_id: '',
    product_id: '',
    quantity: '',
    credit: '',
  });

  const [sales, setSales] = useState<Sale[]>([]);

  const fetchData = async () => {
    try {
      const [customersData, productsData, salesData] = await Promise.all([
        getCustomers(),
        getProducts(),
        getSales(),
      ]);

      setCustomers(customersData);
      setProducts(productsData.filter((p) => p.is_active !== false));
      setSales(salesData);
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

    return !errors.customer_id && !errors.product_id && !errors.quantity;
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
    <div>
      <h2>Ventas</h2>

      {loading && <p>Cargando datos...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <div>
          <div>
            <label>Cliente</label>
            <select
              value={formData.customer_id}
              onChange={(e) => {
                setFormData({ ...formData, customer_id: e.target.value });
                setFormErrors({ ...formErrors, customer_id: '' });
              }}
            >
              <option value="">Selecciona un cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name}
                </option>
              ))}
            </select>
            {formErrors.customer_id && <p>{formErrors.customer_id}</p>}
          </div>

          <div>
            <label>Productos</label>

            {saleItems.map((item, index) => {
              const selectedProduct = getProductById(item.product_id);

              return (
                <div
                  key={index}
                  style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                  }}
                >
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
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>

                  {selectedProduct && (
                    <div>
                      <p>Precio: ${selectedProduct.sale_price}</p>
                      <p>Stock disponible: {selectedProduct.stock}</p>
                    </div>
                  )}

                  {saleItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSaleItemRow(index)}
                    >
                      Quitar producto
                    </button>
                  )}
                </div>
              );
            })}

            <button type="button" onClick={addSaleItemRow}>
              Agregar producto
            </button>

            {formErrors.product_id && <p>{formErrors.product_id}</p>}
          </div>

          <div>
            <label>Cantidades y subtotales</label>

            {saleItems.map((item, index) => {
              const selectedProduct = getProductById(item.product_id);
              const subtotal = getItemSubtotal(item);

              return (
                <div key={index} style={{ marginBottom: '1rem' }}>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      updateSaleItem(index, 'quantity', Number(e.target.value));
                      setFormErrors({ ...formErrors, quantity: '' });
                    }}
                    placeholder="Cantidad"
                  />

                  <p>Subtotal: ${subtotal}</p>

                  {selectedProduct &&
                    Number(item.quantity) > selectedProduct.stock && (
                      <p>No hay suficiente stock disponible</p>
                    )}
                </div>
              );
            })}

            {formErrors.quantity && <p>{formErrors.quantity}</p>}
          </div>

          <p>Total estimado de la venta: ${saleTotal}</p>

          {formData.sale_type === 'installments' && (
            <div>
              <div>
                <label>Enganche</label>
                <input
                  type="number"
                  min="0"
                  value={formData.down_payment}
                  onChange={(e) =>
                    setFormData({ ...formData, down_payment: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Número de pagos</label>
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
                />
              </div>

              <div>
                <label>Frecuencia de pago</label>
                <select
                  value={formData.payment_frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_frequency: e.target.value,
                    })
                  }
                >
                  <option value="none">Selecciona una frecuencia</option>
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
              {formErrors.credit && <p>{formErrors.credit}</p>}
              <p>
  Saldo financiado estimado: $
  {Math.max(saleTotal - Number(formData.down_payment), 0)}
</p>
              <p>
  Monto estimado por pago: $
  {Number(formData.number_of_payments) > 0
    ? Math.max(saleTotal - Number(formData.down_payment), 0) /
      Number(formData.number_of_payments)
    : 0}
</p>
            </div>
          )}

          <div>
  <label>Tipo de venta</label>
  <select
    value={formData.sale_type}
    onChange={(e) => {
      const nextSaleType = e.target.value as SaleType;

      setFormData({
        ...formData,
        sale_type: nextSaleType,
        down_payment: nextSaleType === 'installments' ? formData.down_payment : '0',
        number_of_payments:
          nextSaleType === 'installments' ? formData.number_of_payments : '0',
        payment_frequency:
          nextSaleType === 'installments' ? formData.payment_frequency : 'none',
      });
    }}
  >
    <option value="immediate">Pago inmediato</option>
    <option value="installments">Venta a plazos</option>
  </select>
</div>

          <button onClick={handleCreateSale}>Registrar venta</button>

          <h3>Ventas registradas</h3>

          <table style={{ width: '100%', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Producto(s)</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>
                    {sale.customer
                      ? `${sale.customer.first_name} ${sale.customer.last_name ?? ''}`.trim()
                      : '-'}
                  </td>
                  <td>
                    {sale.items.length > 0
                      ? sale.items.map((item) => item.product.name).join(', ')
                      : '-'}
                  </td>
                  <td>{sale.total_amount}</td>
                  <td>{sale.status}</td>
                  <td>{sale.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VentasModule;