from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer_create import CustomerCreate
from app.schemas.customer_update import CustomerUpdate


class CustomerRepository:
    """
    Repositorio de acceso a datos para la entidad Customer.

    Responsabilidades:
    - leer clientes desde la base de datos
    - crear registros
    - actualizar registros
    - eliminar registros

    Esta capa no contiene reglas de negocio.
    Solo encapsula operaciones CRUD sobre SQLAlchemy.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Customer]:
        """
        Obtiene todos los clientes ordenados por id descendente.
        """
        return (
            self.db.query(Customer)
            .order_by(Customer.id.desc())
            .all()
        )

    def get_by_id(self, customer_id: int) -> Customer | None:
        """
        Busca un cliente por su identificador.
        """
        return (
            self.db.query(Customer)
            .filter(Customer.id == customer_id)
            .first()
        )

    def create(self, customer_data: CustomerCreate) -> Customer:
        """
        Crea un nuevo cliente en base de datos.
        """
        customer = Customer(
            first_name=customer_data.first_name,
            last_name=customer_data.last_name,
            phone=customer_data.phone,
            email=customer_data.email,
            address_line=customer_data.address_line,
            address_reference=customer_data.address_reference,
            zone=customer_data.zone,
            notes=customer_data.notes,
            credit_limit=customer_data.credit_limit,
            is_active=customer_data.is_active if customer_data.is_active is not None else True,
        )

        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)

        return customer

    def update(self, customer: Customer, customer_data: CustomerUpdate) -> Customer:
        """
        Actualiza los campos del cliente recibido.
        """
        customer.first_name = customer_data.first_name
        customer.last_name = customer_data.last_name
        customer.phone = customer_data.phone
        customer.address_line = customer_data.address_line
        customer.address_reference = customer_data.address_reference
        customer.zone = customer_data.zone
        customer.notes = customer_data.notes
        customer.email = customer_data.email
        customer.credit_limit = customer_data.credit_limit

        if customer_data.is_active is not None:
            customer.is_active = customer_data.is_active

        self.db.commit()
        self.db.refresh(customer)

        return customer

    def delete(self, customer: Customer) -> None:
        """
        Elimina físicamente un cliente de la base de datos.
        """
        self.db.delete(customer)
        self.db.commit()