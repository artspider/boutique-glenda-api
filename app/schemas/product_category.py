"""
Schemas Pydantic para la entidad ProductCategory.

Este archivo define los contratos de datos que usará la API para:
- crear categorías
- actualizar categorías
- devolver categorías al cliente

Objetivo:
mantener validación clara, reusable y consistente entre capas.
"""

from pydantic import BaseModel, Field


class ProductCategoryBase(BaseModel):
    """
    Schema base de categoría.

    Propósito:
    centralizar los campos comunes compartidos por los schemas
    de creación y respuesta.

    Campos:
    - name:
      nombre de la categoría. Es obligatorio, no debe venir vacío
      y se limita a 100 caracteres.
    - description:
      descripción opcional de apoyo. Se limita a 255 caracteres.

    Nota:
    este schema no se usa directamente como entrada final de todos
    los endpoints, sino como base para evitar duplicación.
    """

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Nombre de la categoría."
    )
    description: str | None = Field(
        default=None,
        max_length=255,
        description="Descripción opcional de la categoría."
    )


class ProductCategoryCreate(ProductCategoryBase):
    """
    Schema para crear una categoría.

    Propósito:
    validar el payload recibido en el endpoint POST de categorías.

    Comportamiento:
    hereda todos los campos del schema base porque para crear
    una categoría solo necesitamos:
    - name
    - description

    Nota:
    se deja como clase explícita aunque no agregue campos nuevos,
    porque arquitectónicamente separa el caso de uso de creación
    del resto de operaciones.
    """

    pass


class ProductCategoryUpdate(BaseModel):
    """
    Schema para actualizar una categoría.

    Propósito:
    permitir actualizaciones parciales o completas desde el endpoint PUT.

    Comportamiento:
    - todos los campos son opcionales
    - si un campo no se envía, no tiene por qué actualizarse
    - si se envía, debe respetar las validaciones definidas

    Campos:
    - name:
      nombre nuevo de la categoría
    - description:
      nueva descripción o null si se desea vaciar
    """

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Nuevo nombre de la categoría."
    )
    description: str | None = Field(
        default=None,
        max_length=255,
        description="Nueva descripción de la categoría."
    )


class ProductCategoryResponse(ProductCategoryBase):
    """
    Schema de salida para devolver categorías al cliente.

    Propósito:
    estandarizar la forma en que la API responde cuando una categoría
    se consulta, se crea o se actualiza.

    Campos:
    - id:
      identificador único de la categoría en base de datos
    - name:
      nombre de la categoría
    - description:
      descripción opcional

    Configuración importante:
    model_config = {"from_attributes": True}
    permite construir este schema directamente a partir de objetos ORM
    de SQLAlchemy, sin convertirlos manualmente a diccionarios.
    """

    id: int

    model_config = {"from_attributes": True}