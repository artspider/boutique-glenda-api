from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from app.models.user import User
from app.models.customer import Customer
from app.models.product_category import ProductCategory
from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.inventory_movement import InventoryMovement
from app.models.credit import Credit
from app.models.payment_schedule import PaymentSchedule
from app.models.payment import Payment