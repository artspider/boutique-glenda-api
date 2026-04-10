"""
Endpoints FastAPI para la entidad ProductCategory.

Responsabilidad:
exponer el CRUD de categorías de producto a través de la API.

Este archivo delega la lógica de negocio al servicio y mantiene
los endpoints limpios y enfocados en:
- recibir requests
- inyectar dependencias
- devolver respuestas tipadas
"""

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.product_category import (
    ProductCategoryCreate,
    ProductCategoryResponse,
    ProductCategoryUpdate,
)
from app.services.product_category_service import ProductCategoryService

router = APIRouter(prefix="/product-categories", tags=["Product Categories"])


def get_product_category_service(db: Session = Depends(get_db)) -> ProductCategoryService:
    """
    Dependencia para obtener una instancia del servicio de categorías.

    Args:
        db:
            sesión activa de base de datos inyectada por FastAPI.

    Returns:
        instancia de ProductCategoryService.
    """
    return ProductCategoryService(db)


@router.get(
    "",
    response_model=list[ProductCategoryResponse],
    status_code=status.HTTP_200_OK,
)
def list_product_categories(
    service: ProductCategoryService = Depends(get_product_category_service),
) -> list[ProductCategoryResponse]:
    """
    Lista todas las categorías registradas.

    Acción:
    devuelve todas las categorías ordenadas por id ascendente.

    Returns:
        lista de categorías.
    """
    return service.list_categories()


@router.get(
    "/{category_id}",
    response_model=ProductCategoryResponse,
    status_code=status.HTTP_200_OK,
)
def get_product_category(
    category_id: int,
    service: ProductCategoryService = Depends(get_product_category_service),
) -> ProductCategoryResponse:
    """
    Obtiene una categoría específica por id.

    Args:
        category_id:
            identificador de la categoría.

    Returns:
        categoría encontrada.

    Raises:
        HTTPException 404:
            si la categoría no existe.
    """
    return service.get_category(category_id)


@router.post(
    "",
    response_model=ProductCategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product_category(
    category_in: ProductCategoryCreate,
    service: ProductCategoryService = Depends(get_product_category_service),
) -> ProductCategoryResponse:
    """
    Crea una nueva categoría de producto.

    Args:
        category_in:
            payload validado con name y description.

    Returns:
        categoría creada.

    Raises:
        HTTPException 400:
            si ya existe una categoría con el mismo nombre.
    """
    return service.create_category(category_in)


@router.put(
    "/{category_id}",
    response_model=ProductCategoryResponse,
    status_code=status.HTTP_200_OK,
)
def update_product_category(
    category_id: int,
    category_in: ProductCategoryUpdate,
    service: ProductCategoryService = Depends(get_product_category_service),
) -> ProductCategoryResponse:
    """
    Actualiza una categoría existente.

    Args:
        category_id:
            id de la categoría a actualizar.
        category_in:
            payload con los cambios a aplicar.

    Returns:
        categoría actualizada.

    Raises:
        HTTPException 404:
            si la categoría no existe.
        HTTPException 400:
            si el nuevo nombre duplica otra categoría.
    """
    return service.update_category(category_id, category_in)


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_product_category(
    category_id: int,
    service: ProductCategoryService = Depends(get_product_category_service),
) -> Response:
    """
    Elimina una categoría existente.

    Acción importante:
    antes de eliminar, el servicio valida que la categoría
    no esté asociada a productos.

    Args:
        category_id:
            id de la categoría a eliminar.

    Returns:
        respuesta vacía con código 204.

    Raises:
        HTTPException 404:
            si la categoría no existe.
        HTTPException 400:
            si la categoría está siendo usada por productos.
    """
    service.delete_category(category_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)