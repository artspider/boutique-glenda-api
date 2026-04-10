from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.customer_repository import CustomerRepository
from app.schemas.customer_create import CustomerCreate
from app.schemas.customer_update import CustomerUpdate
from app.models.customer import Customer


class CustomerService:
    """
    Servicio de negocio para la entidad Customer.

    Responsabilidades:
    - aplicar reglas de negocio del módulo de clientes
    - coordinar operaciones con el repositorio
    - validar existencia de registros
    - centralizar mensajes y errores operativos
    """

    def __init__(self, db: Session):
        self.db = db
        self.repository = CustomerRepository(db)

    def get_all_customers(self) -> list[Customer]:
        """
        Obtiene todos los clientes.
        """
        return self.repository.get_all()

    def get_customer_by_id(self, customer_id: int) -> Customer:
        """
        Obtiene un cliente por id o lanza 404 si no existe.
        """
        customer = self.repository.get_by_id(customer_id)

        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Cliente no encontrado'
            )

        return customer

    def create_customer(self, customer_data: CustomerCreate) -> Customer:
        """
        Crea un nuevo cliente aplicando normalización básica de datos.
        """
        normalized_data = customer_data.model_copy(
            update={
                'first_name': customer_data.first_name.strip(),
                'last_name': customer_data.last_name.strip() if customer_data.last_name else None,
                'phone': customer_data.phone.strip() if customer_data.phone else None,
                'email': customer_data.email.strip() if customer_data.email else None,
                'address_line': customer_data.address_line.strip() if customer_data.address_line else None,
                'address_reference': customer_data.address_reference.strip() if customer_data.address_reference else None,
                'zone': customer_data.zone.strip() if customer_data.zone else None,
                'notes': customer_data.notes.strip() if customer_data.notes else None,
            }
        )

        return self.repository.create(normalized_data)

    def update_customer(self, customer_id: int, customer_data: CustomerUpdate) -> Customer:
        """
        Actualiza un cliente existente.
        Si el cliente no existe, responde 404.
        """
        customer = self.get_customer_by_id(customer_id)

        normalized_data = customer_data.model_copy(
            update={
                'first_name': customer_data.first_name.strip(),
                'last_name': customer_data.last_name.strip() if customer_data.last_name else None,
                'phone': customer_data.phone.strip() if customer_data.phone else None,
                'email': customer_data.email.strip() if customer_data.email else None,
                'address_line': customer_data.address_line.strip() if customer_data.address_line else None,
                'address_reference': customer_data.address_reference.strip() if customer_data.address_reference else None,
                'zone': customer_data.zone.strip() if customer_data.zone else None,
                'notes': customer_data.notes.strip() if customer_data.notes else None,
            }
        )

        return self.repository.update(customer, normalized_data)

    def delete_customer(self, customer_id: int) -> None:
        """
        Elimina un cliente existente.
        Si no existe, responde 404.
        """
        customer = self.get_customer_by_id(customer_id)
        self.repository.delete(customer)