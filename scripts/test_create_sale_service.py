from app.db.base import Base
from app.db.session import SessionLocal
from app.schemas.sale_create import SaleCreate, SaleItemCreate
from app.services.sale_service import SaleService


def main():
    db = SessionLocal()

    try:
        service = SaleService(db=db)

        sale_data = SaleCreate(
            customer_id=1,
            user_id=1,
            payment_type="credit",
            is_credit=True,
            down_payment=20.00,
            number_of_payments=4,
            payment_frequency="weekly",
            items=[
                SaleItemCreate(
                    product_id=2,
                    quantity=1,
                    unit_price=100.00,
                )
            ],
        )

        sale = service.create_sale(sale_data=sale_data)
        print(f"Venta creada correctamente. ID: {sale.id}")

    finally:
        db.close()


if __name__ == "__main__":
    main()