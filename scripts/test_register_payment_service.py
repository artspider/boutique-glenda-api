from app.db.base import Base
from app.db.session import SessionLocal
from app.schemas.payment_create import PaymentCreate
from app.services.payment_service import PaymentService


def main():
    db = SessionLocal()

    try:
        service = PaymentService(db=db)

        payment_data = PaymentCreate(
            credit_id=3,
            user_id=1,
            amount=20.00,
        )

        payment = service.register_payment(payment_data=payment_data)
        print(f"Pago registrado correctamente. ID: {payment.id}")

    finally:
        db.close()


if __name__ == "__main__":
    main()