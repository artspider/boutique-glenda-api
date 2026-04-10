"""
Repositorio de categorías de producto.

Responsabilidad:
centralizar el acceso a datos de la entidad ProductCategory.

Este repositorio encapsula operaciones CRUD básicas sobre la tabla
product_categories y evita que la lógica SQLAlchemy quede dispersa
en servicios o endpoints.

Beneficios:
- mantiene separación de capas
- facilita pruebas
- hace más simple reutilizar operaciones comunes
"""

from sqlalchemy.orm import Session

from app.models.product_category import ProductCategory
from app.schemas.product_category import (
    ProductCategoryCreate,
    ProductCategoryUpdate,
)


class ProductCategoryRepository:
    """
    Repositorio de acceso a datos para ProductCategory.

    Esta clase contiene métodos para:
    - listar categorías
    - buscar una categoría por id
    - buscar una categoría por nombre
    - crear una categoría
    - actualizar una categoría existente
    - eliminar una categoría

    Nota:
    esta capa no debe contener reglas complejas de negocio.
    Su trabajo es exclusivamente consultar y persistir datos.
    """

    def __init__(self, db: Session) -> None:
        """
        Inicializa el repositorio con una sesión activa de base de datos.

        Args:
            db:
                sesión SQLAlchemy inyectada desde la capa superior.
        """
        self.db = db

    def get_all(self) -> list[ProductCategory]:
        """
        Obtiene todas las categorías ordenadas por id ascendente.

        Returns:
            lista de objetos ProductCategory.
        """
        return (
            self.db.query(ProductCategory)
            .order_by(ProductCategory.id.asc())
            .all()
        )

    def get_by_id(self, category_id: int) -> ProductCategory | None:
        """
        Busca una categoría por su identificador.

        Args:
            category_id:
                id de la categoría a consultar.

        Returns:
            objeto ProductCategory si existe, en otro caso None.
        """
        return (
            self.db.query(ProductCategory)
            .filter(ProductCategory.id == category_id)
            .first()
        )

    def get_by_name(self, name: str) -> ProductCategory | None:
        """
        Busca una categoría por nombre exacto.

        Args:
            name:
                nombre de la categoría.

        Returns:
            objeto ProductCategory si existe, en otro caso None.

        Nota:
            esta búsqueda será útil para validar duplicados en la capa
            de servicio antes de crear o actualizar registros.
        """
        return (
            self.db.query(ProductCategory)
            .filter(ProductCategory.name == name)
            .first()
        )

    def create(self, category_in: ProductCategoryCreate) -> ProductCategory:
        """
        Crea una nueva categoría en base de datos.

        Args:
            category_in:
                datos validados desde el schema de creación.

        Returns:
            objeto ProductCategory persistido y refrescado.
        """
        category = ProductCategory(
            name=category_in.name,
            description=category_in.description,
        )

        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)

        return category

    def update(
        self,
        category: ProductCategory,
        category_in: ProductCategoryUpdate,
    ) -> ProductCategory:
        """
        Actualiza una categoría existente con los campos enviados.

        Args:
            category:
                instancia ORM ya consultada y existente.
            category_in:
                datos de actualización validados por Pydantic.

        Returns:
            objeto ProductCategory actualizado y refrescado.

        Acción importante:
            se usan únicamente los campos realmente enviados
            por el cliente mediante exclude_unset=True, para evitar
            sobrescribir valores no incluidos en la petición.
        """
        update_data = category_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(category, field, value)

        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)

        return category

    def delete(self, category: ProductCategory) -> None:
        """
        Elimina una categoría existente de la base de datos.

        Args:
            category:
                instancia ORM de la categoría a eliminar.

        Nota:
            la validación de si puede eliminarse o no debe hacerse
            en la capa de servicio antes de invocar este método.
        """
        self.db.delete(category)
        self.db.commit()