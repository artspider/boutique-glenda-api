import type { Product } from '../../../services/productService';

/**
 * Estado local del formulario de productos
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
 * Catálogo local de categorías
 */
export type ProductCategoryOption = {
  value: string;
  label: string;
};

/**
 * Errores por campo
 */
export type FormErrors = Partial<Record<keyof ProductFormData, string>>;

/**
 * Props para el resumen superior
 */
export type ProductosResumenProps = {
  totalActivos: number;
  totalInactivos: number;
  totalStockBajo: number;
};

/**
 * Props del formulario
 */
export type ProductoFormProps = {
  formData: ProductFormData;
  formErrors: FormErrors;
  editingProductId: number | null;
  submitting: boolean;
  categoryOptions: ProductCategoryOption[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onCancel: () => void;
  onSave: () => void;
};

/**
 * Props de la tabla
 */
export type ProductosTableProps = {
  productos: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
};

/**
 * Formulario inicial
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