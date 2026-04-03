from fastapi import FastAPI
from app.db import base

from app.api.sales import router as sales_router
from app.api.payments import router as payments_router
from app.api.credits import router as credits_router
from app.api.customers import router as customers_router
from app.api.products import router as products_router

app = FastAPI(
    title="Boutique Glenda API",
    version="0.1.0",
)

app.include_router(sales_router)
app.include_router(payments_router)
app.include_router(credits_router)
app.include_router(customers_router)
app.include_router(products_router)


@app.get("/")
def read_root():
    return {"message": "Boutique Glenda API is running"}