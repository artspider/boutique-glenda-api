import type { Product } from '../../../services/productService';

/**
 * Estado local del formulario de productos.
 */
export type ProductFormData = {
  name: string;
  sku: string;
  description: string;
  cost_price: string;
  sale_price: string;
  stock: string;
  minimum_stock: string;
  category_id: string;
};

/**
 * Estado local del formulario rápido de categorías.
 */
export type CategoryQuickFormData = {
  name: string;
  description: string;
};

/**
 * Catálogo local de categorías para el select.
 */
export type ProductCategoryOption = {
  value: string;
  label: string;
};

/**
 * Errores por campo del formulario de productos.
 */
export type FormErrors = Partial<Record<keyof ProductFormData, string>>;

/**
 * Errores por campo del alta rápida de categoría.
 */
export type CategoryQuickFormErrors = Partial<Record<keyof CategoryQuickFormData, string>>;

/**
 * Props para el resumen superior.
 */
export type ProductosResumenProps = {
  totalActivos: number;
  totalInactivos: number;
  totalStockBajo: number;
};

/**
 * Props del formulario principal de productos.
 *
 * Incluye también el bloque de alta rápida de categoría para no sacar
 * al usuario del flujo de captura del producto.
 */
export type ProductoFormProps = {
  formData: ProductFormData;
  formErrors: FormErrors;
  editingProductId: number | null;
  submitting: boolean;
  categoryOptions: ProductCategoryOption[];

  showQuickCategoryForm: boolean;
  categorySubmitting: boolean;
  categoryQuickFormData: CategoryQuickFormData;
  categoryQuickFormErrors: CategoryQuickFormErrors;

  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onCancel: () => void;
  onSave: () => void;

  onToggleQuickCategoryForm: () => void;
  onQuickCategoryInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onQuickCategoryCancel: () => void;
  onQuickCategorySave: () => void;
};

/**
 * Props de la tabla.
 */
export type ProductosTableProps = {
  productos: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
};

/**
 * Formulario inicial de producto.
 */
export const initialFormData: ProductFormData = {
  name: '',
  sku: '',
  description: '',
  cost_price: '',
  sale_price: '',
  stock: '',
  minimum_stock: '',
  category_id: '',
};

/**
 * Formulario inicial de alta rápida de categoría.
 */
export const initialCategoryQuickFormData: CategoryQuickFormData = {
  name: '',
  description: '',
};