import React, { useEffect, useMemo, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/productService';
import type { Product } from '../../services/productService';

import {
  getProductCategories,
  createProductCategory,
  type ProductCategory,
} from '../../services/productCategoryService';

import ProductoForm from './productos/ProductoForm';
import ProductosResumen from './productos/ProductosResumen';
import ProductosTable from './productos/ProductosTable';

import {
  cardStyle,
  colors,
  primaryButtonStyle,
  secondaryButtonStyle,
} from './productos/styles';

import {
  initialFormData,
  initialCategoryQuickFormData,
} from './productos/types';

import type {
  CategoryQuickFormData,
  CategoryQuickFormErrors,
  FormErrors,
  ProductCategoryOption,
  ProductFormData,
} from './productos/types';

import { toNumber } from './productos/utils';

/**
 * =========================================================
 * ProductosModule
 * ---------------------------------------------------------
 * Contenedor principal del módulo de productos
 * =========================================================
 */
const ProductosModule: React.FC = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [showQuickCategoryForm, setShowQuickCategoryForm] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryQuickFormData, setCategoryQuickFormData] =
    useState<CategoryQuickFormData>(initialCategoryQuickFormData);
  const [categoryQuickFormErrors, setCategoryQuickFormErrors] =
    useState<CategoryQuickFormErrors>({});

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  /**
   * Opciones para el select de categorías.
   */
  const categoryOptions: ProductCategoryOption[] = useMemo(() => {
    return categories.map((category) => ({
      value: String(category.id),
      label: category.name,
    }));
  }, [categories]);

  /**
   * Carga productos.
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

  /**
   * Carga categorías reales desde backend.
   */
  const fetchCategories = async (): Promise<ProductCategory[]> => {
    try {
      setCategoriesLoading(true);
      const data = await getProductCategories();
      setCategories(data);
      setCategoriesError(null);
      return data;
    } catch {
      setCategoriesError('No se pudieron cargar las categorías.');
      return [];
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchCategories();
  }, []);

  /**
   * Reinicia formulario principal.
   */
  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setEditingProductId(null);
    setShowForm(false);
    setSaveErrorMessage(null);
    setShowQuickCategoryForm(false);
    setCategoryQuickFormData(initialCategoryQuickFormData);
    setCategoryQuickFormErrors({});
  };

  /**
   * Reinicia formulario rápido de categoría.
   */
  const resetQuickCategoryForm = () => {
    setCategoryQuickFormData(initialCategoryQuickFormData);
    setCategoryQuickFormErrors({});
    setShowQuickCategoryForm(false);
  };

  /**
   * Cambio de campos del producto.
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
   * Cambio de campos del alta rápida de categoría.
   */
  const handleQuickCategoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setCategoryQuickFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setCategoryQuickFormErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    setSaveErrorMessage(null);
  };

  /**
   * Validación local del formulario principal.
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
   * Validación local del alta rápida de categoría.
   */
  const validateQuickCategoryForm = (): CategoryQuickFormErrors => {
    const errors: CategoryQuickFormErrors = {};

    if (!categoryQuickFormData.name.trim()) {
      errors.name = 'Requerido';
    }

    return errors;
  };

  /**
   * Extrae un mensaje legible desde distintos formatos de error.
   */
  const getReadableErrorMessage = (errorValue: any): string => {
    const detail = errorValue?.response?.data?.detail;
    const message = errorValue?.response?.data?.message;
    const fallback = errorValue?.message;

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

      return 'Ocurrió un error al guardar. Intenta nuevamente.';
    }

    return 'No se pudo completar la operación. Verifica los datos e intenta de nuevo.';
  };

  /**
   * Guarda alta o edición de producto.
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
    } catch (errorValue: any) {
      console.error('Error al guardar producto:', errorValue);
      setSaveErrorMessage(getReadableErrorMessage(errorValue));
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Guarda una nueva categoría desde el alta rápida.
   * Después de crearla:
   * - recarga categorías
   * - selecciona la nueva automáticamente en el producto
   */
  const handleQuickCategorySave = async () => {
    const errors = validateQuickCategoryForm();
    setCategoryQuickFormErrors(errors);
    setSuccessMessage(null);
    setSaveErrorMessage(null);

    if (Object.keys(errors).length > 0) {
      setSaveErrorMessage('Completa el nombre de la categoría antes de guardar.');
      return;
    }

    try {
      setCategorySubmitting(true);

      const createdCategory = await createProductCategory({
        name: categoryQuickFormData.name.trim(),
        description: categoryQuickFormData.description.trim() || null,
      });

      await fetchCategories();

      setFormData((prev) => ({
        ...prev,
        category_id: String(createdCategory.id),
      }));

      setSuccessMessage('Categoría creada correctamente.');
      setSaveErrorMessage(null);
      resetQuickCategoryForm();
    } catch (errorValue: any) {
      console.error('Error al crear categoría:', errorValue);
      setSaveErrorMessage(getReadableErrorMessage(errorValue));
    } finally {
      setCategorySubmitting(false);
    }
  };

  /**
   * Prepara edición de producto.
   */
  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setShowForm(true);
    setFormErrors({});
    setSaveErrorMessage(null);
    setSuccessMessage(null);
    setShowQuickCategoryForm(false);
    setCategoryQuickFormData(initialCategoryQuickFormData);
    setCategoryQuickFormErrors({});

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
   * Desactiva producto.
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
   * Productos visibles.
   */
  const productosVisibles = useMemo(() => {
    return productos.filter((p) => p.is_active === !showInactive);
  }, [productos, showInactive]);

  /**
   * Resumen superior.
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
                setShowQuickCategoryForm(false);
                setCategoryQuickFormData(initialCategoryQuickFormData);
                setCategoryQuickFormErrors({});
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

      {/* Mensaje de error de categorías */}
      {categoriesError && (
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
            {categoriesError}
          </p>
        </div>
      )}

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

      {/* Mensaje de error global */}
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
          submitting={submitting || categoriesLoading}
          categoryOptions={categoryOptions}
          showQuickCategoryForm={showQuickCategoryForm}
          categorySubmitting={categorySubmitting}
          categoryQuickFormData={categoryQuickFormData}
          categoryQuickFormErrors={categoryQuickFormErrors}
          onChange={handleInputChange}
          onCancel={resetForm}
          onSave={handleSave}
          onToggleQuickCategoryForm={() => {
            setShowQuickCategoryForm((prev) => !prev);
            setCategoryQuickFormErrors({});
            setSaveErrorMessage(null);
          }}
          onQuickCategoryInputChange={handleQuickCategoryInputChange}
          onQuickCategoryCancel={() => {
            resetQuickCategoryForm();
            setSaveErrorMessage(null);
          }}
          onQuickCategorySave={handleQuickCategorySave}
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