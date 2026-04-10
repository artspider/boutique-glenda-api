"""
Servicio de categorías de producto.

Responsabilidad:
contener la lógica de negocio del CRUD de product_categories.

Esta capa se ubica entre:
- los endpoints (API)
- el repositorio (acceso a datos)

Aquí validamos reglas importantes como:
- evitar categorías duplicadas por nombre
- verificar existencia antes de actualizar o eliminar
- impedir eliminar una categoría si está siendo usada por productos

Beneficios:
- mantiene los endpoints limpios
- centraliza reglas del dominio
- facilita pruebas y mantenimiento
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.product_category import ProductCategory
from app.repositories.product_category_repository import ProductCategoryRepository
from app.schemas.product_category import (
    ProductCategoryCreate,
    ProductCategoryUpdate,
)


class ProductCategoryService:
    """
    Servicio de negocio para categorías de producto.

    Casos de uso cubiertos:
    - listar categorías
    - obtener una categoría por id
    - crear categoría
    - actualizar categoría
    - eliminar categoría
    """

    def __init__(self, db: Session) -> None:
        """
        Inicializa el servicio.

        Args:
            db:
                sesión activa de SQLAlchemy.
        """
        self.db = db
        self.repository = ProductCategoryRepository(db)

    def list_categories(self) -> list[ProductCategory]:
        """
        Devuelve todas las categorías registradas.

        Returns:
            lista de categorías ordenadas por id.
        """
        return self.repository.get_all()

    def get_category(self, category_id: int) -> ProductCategory:
        """
        Obtiene una categoría por id.

        Args:
            category_id:
                identificador de la categoría.

        Returns:
            la categoría encontrada.

        Raises:
            HTTPException 404:
                si la categoría no existe.
        """
        category = self.repository.get_by_id(category_id)
        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La categoría no existe.",
            )
        return category

    def create_category(self, category_in: ProductCategoryCreate) -> ProductCategory:
        """
        Crea una nueva categoría.

        Reglas importantes:
        - no permitir nombres duplicados exactos
        - normalizar espacios laterales en name y description

        Args:
            category_in:
                datos validados de entrada.

        Returns:
            categoría creada.

        Raises:
            HTTPException 400:
                si ya existe una categoría con el mismo nombre.
        """
        normalized_name = category_in.name.strip()
        normalized_description = (
            category_in.description.strip()
            if category_in.description is not None
            else None
        )

        existing_category = self.repository.get_by_name(normalized_name)
        if existing_category is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una categoría con ese nombre.",
            )

        category_data = ProductCategoryCreate(
            name=normalized_name,
            description=normalized_description,
        )

        return self.repository.create(category_data)

    def update_category(
        self,
        category_id: int,
        category_in: ProductCategoryUpdate,
    ) -> ProductCategory:
        """
        Actualiza una categoría existente.

        Reglas importantes:
        - la categoría debe existir
        - si se cambia el nombre, no debe duplicar otra categoría
        - solo se actualizan los campos enviados

        Args:
            category_id:
                id de la categoría a actualizar.
            category_in:
                datos nuevos.

        Returns:
            categoría actualizada.

        Raises:
            HTTPException 404:
                si la categoría no existe.
            HTTPException 400:
                si el nuevo nombre ya pertenece a otra categoría.
        """
        category = self.get_category(category_id)

        update_data = category_in.model_dump(exclude_unset=True)

        if "name" in update_data and update_data["name"] is not None:
            normalized_name = update_data["name"].strip()
            existing_category = self.repository.get_by_name(normalized_name)

            if existing_category is not None and existing_category.id != category_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ya existe una categoría con ese nombre.",
                )

            update_data["name"] = normalized_name

        if "description" in update_data and update_data["description"] is not None:
            update_data["description"] = update_data["description"].strip()

        category_update = ProductCategoryUpdate(**update_data)

        return self.repository.update(category, category_update)

    def delete_category(self, category_id: int) -> None:
        """
        Elimina una categoría existente.

        Regla crítica:
        no se permite eliminar si existen productos asociados
        a esta categoría, para proteger la integridad del negocio.

        Args:
            category_id:
                id de la categoría a eliminar.

        Raises:
            HTTPException 404:
                si la categoría no existe.
            HTTPException 400:
                si la categoría está siendo utilizada por productos.
        """
        category = self.get_category(category_id)

        products_using_category = (
            self.db.query(Product)
            .filter(Product.category_id == category_id)
            .first()
        )

        if products_using_category is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No se puede eliminar la categoría porque está asociada "
                    "a uno o más productos."
                ),
            )

        self.repository.delete(category)