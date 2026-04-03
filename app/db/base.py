from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from app.models.user import User
from app.models.customer import Customer
from app.models.product_category import ProductCategory
from app.models.product import Product