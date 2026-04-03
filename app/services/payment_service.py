from sqlalchemy.orm import Session

from app.schemas.payment_create import PaymentCreate
from fastapi import HTTPException, status

from app.models.credit import Credit
from app.models.payment import Payment
from app.models.payment_schedule import PaymentSchedule


class PaymentService:
    def __init__(self, db: Session):
        self.db = db

    def register_payment(self, payment_data: PaymentCreate):
        """
        Flujo general:
        1. Validar crédito
        2. Crear payment
        3. Actualizar balance del crédito
        4. Actualizar estado del crédito
        5. Aplicar pago al calendario
        6. Confirmar transacción
        """
        try:
            self._validate_credit(payment_data=payment_data)
            payment = self._create_payment(payment_data=payment_data)
            self._apply_payment_to_credit(payment=payment)
            self._update_credit_status(payment=payment)
            self._apply_payment_to_schedule(payment=payment)

            self.db.commit()
            self.db.refresh(payment)

            return payment

        except Exception:
            self.db.rollback()
            raise

    def _validate_credit(self, payment_data: PaymentCreate):
        credit = self.db.get(Credit, payment_data.credit_id)

        if not credit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crédito con id {payment_data.credit_id} no encontrado."
            )

        if credit.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Solo se pueden registrar pagos sobre créditos activos."
            )

        if credit.balance <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El crédito ya no tiene saldo pendiente."
            )

    def _create_payment(self, payment_data: PaymentCreate):
        credit = self.db.get(Credit, payment_data.credit_id)

        payment = Payment(
            credit_id=credit.id,
            user_id=payment_data.user_id,
            amount=payment_data.amount,
            payment_method="cash",
            reference=None,
        )

        self.db.add(payment)
        self.db.flush()

        return payment

    def _apply_payment_to_credit(self, payment):
        credit = self.db.get(Credit, payment.credit_id)

        new_balance = credit.balance - payment.amount

        if new_balance < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El monto del pago no puede ser mayor al saldo pendiente del crédito."
            )

        credit.balance = new_balance

    def _update_credit_status(self, payment):
        credit = self.db.get(Credit, payment.credit_id)

        if credit.balance == 0:
            credit.status = "paid"

    def _apply_payment_to_schedule(self, payment):
        remaining_amount = payment.amount

        schedules = (
            self.db.query(PaymentSchedule)
            .filter(
                PaymentSchedule.credit_id == payment.credit_id,
                PaymentSchedule.status == "pending",
            )
            .order_by(PaymentSchedule.installment_number.asc())
            .all()
        )

        for schedule in schedules:
            if remaining_amount <= 0:
                break

            if remaining_amount >= schedule.amount_due:
                remaining_amount -= schedule.amount_due
                schedule.status = "paid"
            else:
                break