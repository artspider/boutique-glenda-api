import React, { useEffect, useMemo, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/productService';
import type { Product } from '../../services/productService';

import ProductoForm from './productos/ProductoForm';
import ProductosResumen from './productos/ProductosResumen';
import ProductosTable from './productos/ProductosTable';

import {
  cardStyle,
  colors,
  primaryButtonStyle,
  secondaryButtonStyle,
} from './productos/styles';

import { initialFormData } from './productos/types';
import type {
  FormErrors,
  ProductCategoryOption,
  ProductFormData,
} from './productos/types';

import { toNumber } from './productos/utils';

/**
 * Catálogo local temporal de categorías
 * Ajustar a ids reales del backend
 */
const categoryOptions: ProductCategoryOption[] = [
  { value: '1', label: 'Ropa' },
  { value: '2', label: 'Calzado' },
  { value: '3', label: 'Accesorios' },
  { value: '4', label: 'Belleza' },
];

/**
 * =========================================================
 * ProductosModule
 * ---------------------------------------------------------
 * Contenedor principal del módulo de productos
 * =========================================================
 */
const ProductosModule: React.FC = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  /**
   * Carga productos
   */
  const fetchProductos = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProductos(data);
      setError(null);
    } catch {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  /**
   * Reinicia formulario
   */
  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setEditingProductId(null);
    setShowForm(false);
    setSaveErrorMessage(null);
  };

  /**
   * Cambio de campos
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    setSaveErrorMessage(null);
  };

  /**
   * Validación local
   */
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) errors.name = 'Requerido';
    if (!formData.sku.trim()) errors.sku = 'Requerido';

    if (formData.cost_price.trim() === '') {
      errors.cost_price = 'Requerido';
    } else if (toNumber(formData.cost_price) < 0) {
      errors.cost_price = 'Inválido';
    }

    if (formData.sale_price.trim() === '') {
      errors.sale_price = 'Requerido';
    } else if (toNumber(formData.sale_price) < 0) {
      errors.sale_price = 'Inválido';
    }

    if (formData.stock.trim() === '') {
      errors.stock = 'Requerido';
    } else if (!Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) {
      errors.stock = 'Inválido';
    }

    if (formData.minimum_stock.trim() === '') {
      errors.minimum_stock = 'Requerido';
    } else if (
      !Number.isInteger(Number(formData.minimum_stock)) ||
      Number(formData.minimum_stock) < 0
    ) {
      errors.minimum_stock = 'Inválido';
    }

    if (formData.category_id.trim() === '') {
      errors.category_id = 'Selecciona una categoría';
    }

    return errors;
  };

  /**
   * Extrae un mensaje legible desde distintos formatos de error
   */
  const getReadableErrorMessage = (error: any): string => {
    const detail = error?.response?.data?.detail;
    const message = error?.response?.data?.message;
    const fallback = error?.message;

    if (typeof detail === 'string' && detail.trim() !== '') {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      const firstError = detail[0];

      if (typeof firstError === 'string') {
        return firstError;
      }

      if (typeof firstError === 'object' && firstError !== null) {
        const field =
          Array.isArray(firstError.loc) && firstError.loc.length > 0
            ? firstError.loc[firstError.loc.length - 1]
            : null;

        const msg = firstError.msg;

        const fieldMap: Record<string, string> = {
          name: 'Nombre',
          sku: 'SKU',
          description: 'Descripción',
          cost_price: 'Costo',
          sale_price: 'Precio de venta',
          stock: 'Stock',
          minimum_stock: 'Stock mínimo',
          category_id: 'Categoría',
        };

        if (field && msg) {
          return `${fieldMap[String(field)] || String(field)}: ${String(msg)}`;
        }

        if (msg) {
          return String(msg);
        }
      }
    }

    if (typeof message === 'string' && message.trim() !== '') {
      return message;
    }

    if (typeof fallback === 'string' && fallback.trim() !== '') {
      const lower = fallback.toLowerCase();

      if (lower.includes('failed to fetch')) {
        return 'No se pudo conectar con el servidor. Verifica que la API esté disponible.';
      }

      if (lower.includes('network error')) {
        return 'Ocurrió un problema de red. Revisa tu conexión e intenta de nuevo.';
      }

      return 'Ocurrió un error al guardar el producto. Intenta nuevamente.';
    }

    return 'No se pudo guardar el producto. Verifica los datos e intenta de nuevo.';
  };

  /**
   * Guarda alta o edición
   */
  const handleSave = async () => {
    const errors = validateForm();
    setFormErrors(errors);
    setSuccessMessage(null);
    setSaveErrorMessage(null);

    if (Object.keys(errors).length > 0) {
      setSaveErrorMessage('Revisa los campos marcados antes de guardar.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      description: formData.description.trim() || null,
      cost_price: Number(formData.cost_price),
      sale_price: Number(formData.sale_price),
      stock: Number(formData.stock),
      minimum_stock: Number(formData.minimum_stock),
      category_id: Number(formData.category_id),
    };

    try {
      setSubmitting(true);

      const isEditing = editingProductId !== null;

      if (isEditing) {
        await updateProduct(editingProductId, payload);
      } else {
        await createProduct(payload);
      }

      await fetchProductos();

      setSuccessMessage(
        isEditing
          ? 'Producto actualizado correctamente.'
          : 'Producto creado correctamente.'
      );

      setSaveErrorMessage(null);
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      setSaveErrorMessage(getReadableErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Prepara edición
   */
  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setShowForm(true);
    setFormErrors({});
    setSaveErrorMessage(null);
    setSuccessMessage(null);

    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      cost_price: String(product.cost_price),
      sale_price: String(product.sale_price),
      stock: String(product.stock),
      minimum_stock: String(product.minimum_stock),
      category_id: String(product.category_id ?? ''),
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Desactiva producto
   */
  const handleDeleteClick = async (productId: number) => {
    const confirmed = window.confirm('¿Deseas desactivar este producto?');
    if (!confirmed) return;

    try {
      await deleteProduct(productId);
      await fetchProductos();
    } catch {
      alert('Error al desactivar producto');
    }
  };

  /**
   * Productos visibles
   */
  const productosVisibles = useMemo(() => {
    return productos.filter((p) => p.is_active === !showInactive);
  }, [productos, showInactive]);

  /**
   * Resumen superior
   */
  const totalActivos = productos.filter((p) => p.is_active).length;
  const totalInactivos = productos.filter((p) => !p.is_active).length;
  const totalStockBajo = productos.filter(
    (p) => p.is_active && p.stock <= p.minimum_stock
  ).length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        fontSize: 12,
        color: colors.text,
      }}
    >
      {/* Encabezado */}
      <div
        style={{
          ...cardStyle,
          padding: 12,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          background: colors.cardBg,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.1,
              color: colors.text,
            }}
          >
            Productos
          </h2>

          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: 12,
              color: colors.textMuted,
            }}
          >
            Catálogo, precios y stock.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            style={primaryButtonStyle}
            onClick={() => {
              setSuccessMessage(null);

              if (showForm && editingProductId === null) {
                setShowForm(false);
                setSaveErrorMessage(null);
              } else {
                setShowForm(true);
                setEditingProductId(null);
                setFormData(initialFormData);
                setFormErrors({});
                setSaveErrorMessage(null);
              }
            }}
          >
            {showForm && editingProductId === null ? 'Cancelar' : 'Nuevo producto'}
          </button>

          <button
            style={secondaryButtonStyle}
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? 'Ver activos' : 'Ver inactivos'}
          </button>
        </div>
      </div>

      {/* Mensaje de éxito */}
      {successMessage && (
        <div
          style={{
            ...cardStyle,
            border: `1px solid ${colors.successBg}`,
            background: '#f0fdf4',
            padding: 10,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: colors.successText,
              fontWeight: 700,
            }}
          >
            {successMessage}
          </p>
        </div>
      )}

      {/* Mensaje de error al guardar */}
      {saveErrorMessage && (
        <div
          style={{
            ...cardStyle,
            border: `1px solid ${colors.dangerBorder}`,
            background: '#fffafa',
            padding: 10,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: colors.dangerText,
              fontWeight: 700,
            }}
          >
            {saveErrorMessage}
          </p>
        </div>
      )}

      {/* Resumen */}
      <ProductosResumen
        totalActivos={totalActivos}
        totalInactivos={totalInactivos}
        totalStockBajo={totalStockBajo}
      />

      {/* Formulario */}
      {showForm && (
        <ProductoForm
          formData={formData}
          formErrors={formErrors}
          editingProductId={editingProductId}
          submitting={submitting}
          categoryOptions={categoryOptions}
          onChange={handleInputChange}
          onCancel={resetForm}
          onSave={handleSave}
        />
      )}

      {/* Estado carga */}
      {loading && (
        <div style={cardStyle}>
          <p style={{ margin: 0, fontSize: 12, color: colors.textSoft }}>
            Cargando productos...
          </p>
        </div>
      )}

      {/* Estado error */}
      {error && !loading && (
        <div
          style={{
            ...cardStyle,
            border: `1px solid ${colors.dangerBorder}`,
            background: '#fffafa',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: colors.dangerText,
              fontWeight: 700,
            }}
          >
            {error}
          </p>
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <ProductosTable
          productos={productosVisibles}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}
    </div>
  );
};

export default ProductosModule;