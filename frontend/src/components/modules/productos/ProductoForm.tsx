import React, { useMemo, useState } from 'react';
import type { ProductoFormProps } from './types';
import {
  cardStyle,
  colors,
  errorTextStyle,
  helperTextStyle,
  inputErrorStyle,
  inputFocusStyle,
  inputStyle,
  labelStyle,
  pillBase,
  primaryButtonStyle,
  secondaryButtonStyle,
  softCardStyle,
} from './styles';
import { getMarginBadgeStyle, getStockBadgeStyle, money, toNumber } from './utils';

/**
 * Formulario de alta / edición de productos.
 *
 * Incluye:
 * - formulario principal del producto
 * - métricas de rentabilidad en tiempo real
 * - alta rápida de categoría dentro del mismo flujo
 */
const ProductoForm: React.FC<ProductoFormProps> = ({
  formData,
  formErrors,
  editingProductId,
  submitting,
  categoryOptions,

  showQuickCategoryForm,
  categorySubmitting,
  categoryQuickFormData,
  categoryQuickFormErrors,

  onChange,
  onCancel,
  onSave,

  onToggleQuickCategoryForm,
  onQuickCategoryInputChange,
  onQuickCategoryCancel,
  onQuickCategorySave,
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Métricas del producto en tiempo real
  const costo = toNumber(formData.cost_price);
  const precio = toNumber(formData.sale_price);
  const utilidad = precio - costo;
  const margen = precio > 0 ? (utilidad / precio) * 100 : 0;

  // Estado rápido de stock
  const stock = toNumber(formData.stock);
  const minimumStock = toNumber(formData.minimum_stock);

  // Etiqueta breve del margen
  const marginLabel = useMemo(() => {
    if (margen < 20) return 'Margen bajo';
    if (margen < 40) return 'Margen medio';
    return 'Margen sano';
  }, [margen]);

  /**
   * Devuelve estilo visual de un campo del formulario principal.
   */
  const getFieldStyle = (fieldName: keyof typeof formData): React.CSSProperties => {
    const isFocused = focusedField === fieldName;
    const hasError = Boolean(formErrors[fieldName]);

    return {
      ...inputStyle,
      ...(isFocused ? inputFocusStyle : {}),
      ...(hasError ? inputErrorStyle : {}),
    };
  };

  /**
   * Devuelve estilo visual de un campo del alta rápida de categoría.
   */
  const getQuickCategoryFieldStyle = (
    fieldName: keyof typeof categoryQuickFormData
  ): React.CSSProperties => {
    const isFocused = focusedField === `category-${fieldName}`;
    const hasError = Boolean(categoryQuickFormErrors[fieldName]);

    return {
      ...inputStyle,
      ...(isFocused ? inputFocusStyle : {}),
      ...(hasError ? inputErrorStyle : {}),
    };
  };

  return (
    <div style={{ ...cardStyle, padding: 10 }}>
      {/* Encabezado del formulario */}
      <div
        style={{
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 14, color: colors.text }}>
            {editingProductId !== null ? 'Editar producto' : 'Nuevo producto'}
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: 11, color: colors.textMuted }}>
            Captura rápida del catálogo.
          </p>
        </div>

        {editingProductId !== null && (
          <span style={{ ...pillBase, background: colors.infoBg, color: colors.infoText }}>
            Modo edición
          </span>
        )}
      </div>

      {/* Grid principal */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 8,
        }}
      >
        {/* Información */}
        <div style={{ ...cardStyle, padding: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: colors.text }}>
            Información
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input
                name="name"
                value={formData.name}
                onChange={onChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="Nombre"
                style={getFieldStyle('name')}
              />
              {formErrors.name ? (
                <div style={errorTextStyle}>{formErrors.name}</div>
              ) : (
                <div style={helperTextStyle}>Nombre visible en catálogo.</div>
              )}
            </div>

            <div>
              <label style={labelStyle}>SKU *</label>
              <input
                name="sku"
                value={formData.sku}
                onChange={onChange}
                onFocus={() => setFocusedField('sku')}
                onBlur={() => setFocusedField(null)}
                placeholder="SKU"
                style={getFieldStyle('sku')}
              />
              {formErrors.sku ? (
                <div style={errorTextStyle}>{formErrors.sku}</div>
              ) : (
                <div style={helperTextStyle}>Clave corta del producto.</div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onChange}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                placeholder="Descripción"
                rows={3}
                style={{
                  ...getFieldStyle('description'),
                  resize: 'vertical',
                  minHeight: 72,
                }}
              />
              <div style={helperTextStyle}>Dato opcional.</div>
            </div>

            {/* Categoría + alta rápida */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginBottom: 4,
                  flexWrap: 'wrap',
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 0 }}>Categoría *</label>

                <button
                  type="button"
                  onClick={onToggleQuickCategoryForm}
                  style={{
                    ...secondaryButtonStyle,
                    padding: '5px 8px',
                    fontSize: 11,
                  }}
                  disabled={submitting || categorySubmitting}
                >
                  {showQuickCategoryForm ? 'Ocultar' : 'Nueva'}
                </button>
              </div>

              <select
                name="category_id"
                value={formData.category_id}
                onChange={onChange}
                onFocus={() => setFocusedField('category_id')}
                onBlur={() => setFocusedField(null)}
                style={getFieldStyle('category_id')}
                disabled={categorySubmitting}
              >
                <option value="">Selecciona una categoría</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {formErrors.category_id ? (
                <div style={errorTextStyle}>{formErrors.category_id}</div>
              ) : (
                <div style={helperTextStyle}>Selecciona una categoría válida.</div>
              )}

              {/* Alta rápida de categoría */}
              {showQuickCategoryForm && (
                <div
                  style={{
                    ...softCardStyle,
                    marginTop: 8,
                    display: 'grid',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: colors.text }}>
                      Nueva categoría
                    </div>

                    <span
                      style={{
                        ...pillBase,
                        background: colors.primarySoft,
                        color: colors.textSoft,
                      }}
                    >
                      Alta rápida
                    </span>
                  </div>

                  <div>
                    <label style={labelStyle}>Nombre *</label>
                    <input
                      name="name"
                      value={categoryQuickFormData.name}
                      onChange={onQuickCategoryInputChange}
                      onFocus={() => setFocusedField('category-name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Nombre de la categoría"
                      style={getQuickCategoryFieldStyle('name')}
                    />
                    {categoryQuickFormErrors.name ? (
                      <div style={errorTextStyle}>{categoryQuickFormErrors.name}</div>
                    ) : (
                      <div style={helperTextStyle}>Ejemplo: Ropa, Calzado, Accesorios.</div>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>Descripción</label>
                    <textarea
                      name="description"
                      value={categoryQuickFormData.description}
                      onChange={onQuickCategoryInputChange}
                      onFocus={() => setFocusedField('category-description')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Descripción breve"
                      rows={2}
                      style={{
                        ...getQuickCategoryFieldStyle('description'),
                        resize: 'vertical',
                        minHeight: 60,
                      }}
                    />
                    {categoryQuickFormErrors.description ? (
                      <div style={errorTextStyle}>{categoryQuickFormErrors.description}</div>
                    ) : (
                      <div style={helperTextStyle}>Dato opcional.</div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        ...secondaryButtonStyle,
                        padding: '6px 10px',
                        fontSize: 11,
                      }}
                      onClick={onQuickCategoryCancel}
                      disabled={categorySubmitting}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      style={{
                        ...primaryButtonStyle,
                        padding: '6px 10px',
                        fontSize: 11,
                        opacity: categorySubmitting ? 0.7 : 1,
                      }}
                      onClick={onQuickCategorySave}
                      disabled={categorySubmitting}
                    >
                      {categorySubmitting ? 'Guardando...' : 'Guardar categoría'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Venta y rentabilidad */}
        <div style={{ ...cardStyle, padding: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: colors.text }}>
            Venta y rentabilidad
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              <label style={labelStyle}>Costo *</label>
              <input
                name="cost_price"
                value={formData.cost_price}
                onChange={onChange}
                onFocus={() => setFocusedField('cost_price')}
                onBlur={() => setFocusedField(null)}
                placeholder="0.00"
                style={getFieldStyle('cost_price')}
              />
              {formErrors.cost_price ? (
                <div style={errorTextStyle}>{formErrors.cost_price}</div>
              ) : (
                <div style={helperTextStyle}>Costo unitario.</div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Precio venta *</label>
              <input
                name="sale_price"
                value={formData.sale_price}
                onChange={onChange}
                onFocus={() => setFocusedField('sale_price')}
                onBlur={() => setFocusedField(null)}
                placeholder="0.00"
                style={getFieldStyle('sale_price')}
              />
              {formErrors.sale_price ? (
                <div style={errorTextStyle}>{formErrors.sale_price}</div>
              ) : (
                <div style={helperTextStyle}>Precio al cliente.</div>
              )}
            </div>

            {/* Métricas */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 8,
                marginTop: 2,
              }}
            >
              <div style={softCardStyle}>
                <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 700 }}>
                  Costo
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, color: colors.text }}>
                  {money(costo)}
                </div>
              </div>

              <div style={softCardStyle}>
                <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 700 }}>
                  Precio
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, color: colors.text }}>
                  {money(precio)}
                </div>
              </div>

              <div style={softCardStyle}>
                <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 700 }}>
                  Utilidad
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    marginTop: 4,
                    color: utilidad < 0 ? colors.dangerText : colors.text,
                  }}
                >
                  {money(utilidad)}
                </div>
              </div>

              <div style={softCardStyle}>
                <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 700 }}>
                  Margen
                </div>
                <div
                  style={{
                    marginTop: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={getMarginBadgeStyle(margen)}>{margen.toFixed(1)}%</span>
                  <span style={{ fontSize: 10, color: colors.textMuted }}>{marginLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventario */}
        <div style={{ ...cardStyle, padding: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: colors.text }}>
            Inventario básico
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              <label style={labelStyle}>Stock *</label>
              <input
                name="stock"
                value={formData.stock}
                onChange={onChange}
                onFocus={() => setFocusedField('stock')}
                onBlur={() => setFocusedField(null)}
                placeholder="0"
                style={getFieldStyle('stock')}
              />
              {formErrors.stock ? (
                <div style={errorTextStyle}>{formErrors.stock}</div>
              ) : (
                <div style={helperTextStyle}>Existencia actual.</div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Stock mínimo *</label>
              <input
                name="minimum_stock"
                value={formData.minimum_stock}
                onChange={onChange}
                onFocus={() => setFocusedField('minimum_stock')}
                onBlur={() => setFocusedField(null)}
                placeholder="0"
                style={getFieldStyle('minimum_stock')}
              />
              {formErrors.minimum_stock ? (
                <div style={errorTextStyle}>{formErrors.minimum_stock}</div>
              ) : (
                <div style={helperTextStyle}>Nivel de alerta.</div>
              )}
            </div>

            <div style={softCardStyle}>
              <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 700 }}>
                Estado stock
              </div>
              <div
                style={{
                  marginTop: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'wrap',
                }}
              >
                <span style={getStockBadgeStyle(stock, minimumStock)}>
                  {stock <= 0
                    ? 'Sin stock'
                    : stock <= minimumStock
                    ? 'Stock bajo'
                    : 'Stock normal'}
                </span>
                <span style={{ fontSize: 10, color: colors.textMuted }}>
                  Min {minimumStock}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          marginTop: 10,
          flexWrap: 'wrap',
        }}
      >
        <button type="button" style={secondaryButtonStyle} onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>

        <button
          type="button"
          style={{ ...primaryButtonStyle, opacity: submitting ? 0.7 : 1 }}
          onClick={onSave}
          disabled={submitting}
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};

export default ProductoForm;