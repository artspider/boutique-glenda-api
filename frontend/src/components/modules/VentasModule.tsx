import React, { useEffect, useState } from 'react';
import { getCustomers } from '../../services/clientService';
import type { Customer } from '../../services/clientService';
import { getProducts } from '../../services/productService';
import type { Product } from '../../services/productService';
import { createSale, getSales } from '../../services/saleService';
import type { Sale } from '../../services/saleService';

const VentasModule: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    quantity: '1',
    payment_type: 'cash',
  });

  const [formErrors, setFormErrors] = useState({
  customer_id: '',
  product_id: '',
  quantity: '',
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

  const validateForm = () => {
  const errors = {
    customer_id: '',
    product_id: '',
    quantity: '',
  };

  if (!formData.customer_id) {
    errors.customer_id = 'El cliente es obligatorio';
  }

  if (!formData.product_id) {
    errors.product_id = 'El producto es obligatorio';
  }

  if (!formData.quantity || Number(formData.quantity) <= 0) {
    errors.quantity = 'La cantidad debe ser mayor a 0';
  }

  const selectedProduct = products.find(
  (p) => p.id === Number(formData.product_id)
);

if (selectedProduct && Number(formData.quantity) > selectedProduct.stock) {
  errors.quantity = 'No hay suficiente stock disponible';
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
      const selectedProduct = products.find(
        (p) => p.id === Number(formData.product_id)
      );

      if (!selectedProduct) {
        alert('Selecciona un producto válido');
        return;
      }

      await createSale({
        customer_id: Number(formData.customer_id),
        user_id: 1,
        payment_type: formData.payment_type,
        items: [
          {
            product_id: selectedProduct.id,
            quantity: Number(formData.quantity),
            unit_price: selectedProduct.sale_price,
          },
        ],
        is_credit: false,
        down_payment: 0,
        number_of_payments: 0,
        payment_frequency: 'none',
      });

      setFormData({
        customer_id: '',
        product_id: '',
        quantity: '1',
        payment_type: 'cash',
      });

      alert('Venta registrada correctamente');
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
            <label>Producto</label>
            <select
              value={formData.product_id}
              onChange={(e) => {
                setFormData({ ...formData, product_id: e.target.value });
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
              {formData.product_id && (() => {
  const selectedProduct = products.find(
    (p) => p.id === Number(formData.product_id)
  );

  if (!selectedProduct) return null;

  return (
    <div>
      <p>Precio: ${selectedProduct.sale_price}</p>
      <p>Stock disponible: {selectedProduct.stock}</p>
    </div>
  );
})()}

              {formErrors.product_id && <p>{formErrors.product_id}</p>}
          </div>

          <div>
            <label>Cantidad</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => {
                setFormData({ ...formData, quantity: e.target.value });
                setFormErrors({ ...formErrors, quantity: '' });
              }}
            />
              {formErrors.quantity && <p>{formErrors.quantity}</p>}
          </div>
          {formData.product_id && Number(formData.quantity) > 0 && (() => {
  const selectedProduct = products.find(
    (p) => p.id === Number(formData.product_id)
  );

  if (!selectedProduct) return null;

  const total = selectedProduct.sale_price * Number(formData.quantity);

  return <p>Total estimado: ${total}</p>;
})()}

          <div>
            <label>Tipo de pago</label>
            <select
              value={formData.payment_type}
              onChange={(e) =>
                setFormData({ ...formData, payment_type: e.target.value })
              }
            >
              <option value="cash">Contado</option>
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