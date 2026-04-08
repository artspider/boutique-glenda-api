from decimal import Decimal
from fastapi import HTTPException, status
from datetime import date, timedelta
from typing import Any

from sqlalchemy.orm import Session

from app.schemas.sale_create import SaleCreate

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.product import Product
from app.models.inventory_movement import InventoryMovement
from app.models.credit import Credit
from app.models.payment_schedule import PaymentSchedule


class SaleService:
    def __init__(self, db: Session):
        self.db = db

    def create_sale(self, sale_data: SaleCreate):
        """
        Flujo general:
        1. Validar stock
        2. Calcular totales
        3. Crear sale
        4. Crear sale_items
        5. Registrar inventory_movements
        6. Si es crédito, crear credit
        7. Si es crédito, generar payment_schedules
        8. Confirmar transacción
        """
        try:
            self._validate_stock(items=sale_data.items)
            totals = self._calculate_totals(items=sale_data.items)
            self._validate_credit_data(sale_data=sale_data, totals=totals)
            sale = self._create_sale_header(sale_data=sale_data, totals=totals)
            self._create_sale_items(sale=sale, items=sale_data.items)
            self._create_inventory_movements(sale=sale, items=sale_data.items)

            if sale_data.is_credit:
                credit = self._create_credit(sale=sale, sale_data=sale_data, totals=totals)
                self._generate_payment_schedule(credit=credit, sale_data=sale_data)

            self.db.commit()
            self.db.refresh(sale)

            return sale

        except Exception:
            self.db.rollback()
            raise

    def _validate_stock(self, items: list[Any]) -> None:
    #def _validate_stock(self, items):
        for item in items:
            product = self.db.get(Product, item.product_id)

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id {item.product_id} no encontrado."
                )

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Stock insuficiente para el producto '{product.name}'. "
                        f"Disponible: {product.stock}, solicitado: {item.quantity}."
                    )
                )

    def _calculate_totals(self, items: list[Any]) -> dict[str, Decimal]:
    #def _calculate_totals(self, items):
        subtotal = Decimal("0.00")

        for item in items:
            line_total = Decimal(item.quantity) * item.unit_price
            subtotal += line_total

        total = subtotal

        return {
            "subtotal": subtotal,
            "total": total,
        }

    def _create_sale_header(self, sale_data: SaleCreate, totals: dict[str, Decimal]) -> Sale:
        sale = Sale(
            customer_id=sale_data.customer_id,
            user_id=sale_data.user_id,
            total_amount=totals["total"],
            status="completed",
        )

        self.db.add(sale)
        self.db.flush()

        return sale

    def _create_sale_items(self, sale: Sale, items: list[Any]) -> None:
        for item in items:
            line_total = Decimal(item.quantity) * item.unit_price

            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=line_total,
            )

            self.db.add(sale_item)

    def _create_inventory_movements(self, sale: Sale, items: list[Any]) -> None:
    #def _create_inventory_movements(self, sale, items):
        for item in items:
            product = self.db.get(Product, item.product_id)

            movement = InventoryMovement(
                product_id=item.product_id,
                user_id=sale.user_id,
                movement_type="out",
                quantity=item.quantity,
                reference=f"sale:{sale.id}",
            )

            self.db.add(movement)

            product.stock -= item.quantity

    def _create_credit(self, sale: Sale, sale_data: SaleCreate, totals: dict[str, Decimal]) -> Credit:
        down_payment = sale_data.down_payment or Decimal("0.00")
        financed_amount = totals["total"] - down_payment
        balance = financed_amount

        credit = Credit(
            sale_id=sale.id,
            customer_id=sale.customer_id,
            total_amount=totals["total"],
            down_payment=down_payment,
            financed_amount=financed_amount,
            balance=balance,
            status="active",
        )

        self.db.add(credit)
        self.db.flush()

        return credit

    def _generate_payment_schedule(self, credit: Credit, sale_data: SaleCreate) -> None:
        if not sale_data.number_of_payments or sale_data.number_of_payments <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El número de pagos debe ser mayor que cero para ventas a crédito."
            )

        installment_amount = credit.balance / sale_data.number_of_payments
        due_date = date.today()

        for installment_number in range(1, sale_data.number_of_payments + 1):
            if sale_data.payment_frequency == "weekly":
                due_date += timedelta(days=7)
            elif sale_data.payment_frequency == "biweekly":
                due_date += timedelta(days=15)
            else:
                due_date += timedelta(days=30)

            schedule = PaymentSchedule(
                credit_id=credit.id,
                installment_number=installment_number,
                due_date=due_date,
                amount_due=installment_amount,
                status="pending",
            )

            self.db.add(schedule)

    def _validate_credit_data(self, sale_data: SaleCreate, totals: dict[str, Decimal]) -> None:
    #def _validate_credit_data(self, sale_data, totals):
        if not sale_data.is_credit:
            return

        if sale_data.down_payment is not None and sale_data.down_payment < Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El enganche no puede ser negativo."
            )

        down_payment = sale_data.down_payment or Decimal("0.00")

        if down_payment >= totals["total"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El enganche debe ser menor al total de la venta."
            )

        if not sale_data.number_of_payments or sale_data.number_of_payments <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe indicar un número de pagos mayor que cero."
            )

        if sale_data.payment_frequency not in {"weekly", "biweekly", "monthly"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La frecuencia de pago debe ser: weekly, biweekly o monthly."
            )

    def get_sales(self):
        return self.db.query(Sale).order_by(Sale.created_at.desc()).all()