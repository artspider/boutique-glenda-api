import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import type { Product } from '../../services/productService';

const ProductosModule: React.FC = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      sku: '',
      description: '',
      cost_price: '',
      sale_price: '',
      stock: '',
      minimum_stock: '',
      category_id: '1',
  });
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const fetchProductos = async () => {
    try {
      const data = await getProducts();
      setProductos(data);
      setError(null);
    } catch {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
  try {
    const payload = {
      name: formData.name,
      sku: formData.sku,
      description: formData.description || null,
      cost_price: Number(formData.cost_price),
      sale_price: Number(formData.sale_price),
      stock: Number(formData.stock),
      minimum_stock: Number(formData.minimum_stock),
      category_id: Number(formData.category_id),
    };

    if (editingProductId !== null) {
      await updateProduct(editingProductId, payload);
    } else {
      await createProduct(payload);
    }

    setShowForm(false);
    setEditingProductId(null);
    setFormData({
      name: '',
      sku: '',
      description: '',
      cost_price: '',
      sale_price: '',
      stock: '',
      minimum_stock: '',
      category_id: '1',
    });
    fetchProductos();
  } catch {
    alert(
      editingProductId !== null
        ? 'Error al actualizar producto'
        : 'Error al crear producto'
    );
  }
};

  const handleEditClick = (product: Product) => {
  setEditingProductId(product.id);
  setShowForm(true);
  setFormData({
    name: product.name,
    sku: product.sku,
    description: product.description || '',
    cost_price: String(product.cost_price),
    sale_price: String(product.sale_price),
    stock: String(product.stock),
    minimum_stock: String(product.minimum_stock),
    category_id: String(product.category_id),
  });
};

  const handleDeleteClick = async (productId: number) => {
  const confirmed = window.confirm('¿Deseas eliminar este producto?');

  if (!confirmed) return;

  try {
    await deleteProduct(productId);
    fetchProductos();
  } catch {
    alert('Error al eliminar producto');
  }
};

  useEffect(() => {
    fetchProductos();
  }, []);

  return (
    <div>
  <h2>Productos</h2>

  <div style={{ marginBottom: '1rem' }}>
    <button onClick={() => setShowForm(!showForm)}>
      {showForm ? 'Cancelar' : 'Nuevo producto'}
    </button>
    <button onClick={() => setShowInactive(!showInactive)}>
      {showInactive ? 'Ver activos' : 'Ver inactivos'}
    </button>
  </div>

  {showForm && (
    <div style={{ marginBottom: '1rem' }}>
        <label>Nombre</label>
      <input
        placeholder="Nombre"
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
      />
        <label>SKU</label>
      <input
        placeholder="SKU"
        value={formData.sku}
        onChange={(e) =>
          setFormData({ ...formData, sku: e.target.value })
        }
      />
        <label>Descripción</label>
      <input
        placeholder="Descripción"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />
        <label>Costo</label>
      <input
        placeholder="Costo"
        value={formData.cost_price}
        onChange={(e) =>
          setFormData({ ...formData, cost_price: e.target.value })
        }
      />
        <label>Venta</label>
      <input
        placeholder="Precio venta"
        value={formData.sale_price}
        onChange={(e) =>
          setFormData({ ...formData, sale_price: e.target.value })
        }
      />
        <label>Existencia</label>
      <input
        placeholder="Stock"
        value={formData.stock}
        onChange={(e) =>
          setFormData({ ...formData, stock: e.target.value })
        }
      />
        <label>Minino</label>
      <input
        placeholder="Stock mínimo"
        value={formData.minimum_stock}
        onChange={(e) =>
          setFormData({ ...formData, minimum_stock: e.target.value })
        }
      />
        <label>Categoria</label>
      <input
        placeholder="Categoría"
        value={formData.category_id}
        onChange={(e) =>
          setFormData({ ...formData, category_id: e.target.value })
        }
      />
      <button onClick={handleCreate}>Guardar</button>
    </div>
  )}

  {loading && <p>Cargando productos...</p>}
  {error && <p>{error}</p>}

  {!loading && !error && (
    <table style={{ width: '100%' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>SKU</th>
          <th>Descripción</th>
          <th>Costo</th>
          <th>Precio venta</th>
          <th>Stock</th>
          <th>Stock mínimo</th>
          <th>Categoría</th>
            <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.filter((p) => p.is_active === !showInactive).map((p) => (

          <tr key={p.id}>
            <td>{p.id}</td>
            <td>{p.name}</td>
            <td>{p.sku}</td>
            <td>{p.description || '-'}</td>
            <td>{p.cost_price}</td>
            <td>{p.sale_price}</td>
            <td>{p.stock}</td>
            <td>{p.minimum_stock}</td>
            <td>{p.category_id}</td>
              <td>
                <button onClick={() => handleEditClick(p)}>Editar</button>
                  <button onClick={() => handleDeleteClick(p.id)}>Desactivar</button>
              </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
  );
};

export default ProductosModule;