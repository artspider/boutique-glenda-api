from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import base

from app.api.sales import router as sales_router
from app.api.payments import router as payments_router
from app.api.credits import router as credits_router
from app.api.customers import router as customers_router
from app.api.products import router as products_router
from app.api.inventory import router as inventory_router
from app.api.product_categories import router as product_categories_router
from app.api import auth

app = FastAPI(
    title="Boutique Glenda API",
    version="0.1.0",
)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sales_router)
app.include_router(payments_router)
app.include_router(credits_router)
app.include_router(customers_router)
app.include_router(products_router)
app.include_router(inventory_router)
app.include_router(product_categories_router)
app.include_router(auth.router)


@app.get("/")
def read_root():
    return {"message": "Boutique Glenda API is running"}