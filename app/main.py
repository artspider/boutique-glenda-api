from fastapi import FastAPI

app = FastAPI(
    title="Boutique Glenda API",
    version="0.1.0",
)


@app.get("/")
def read_root():
    return {"message": "Boutique Glenda API is running"}