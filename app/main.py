from fastapi import FastAPI
from app.db import base
from app.api.sales import router as sales_router

app = FastAPI(
    title="Boutique Glenda API",
    version="0.1.0",
)

app.include_router(sales_router)


@app.get("/")
def read_root():
    return {"message": "Boutique Glenda API is running"}