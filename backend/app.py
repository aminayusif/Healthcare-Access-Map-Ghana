from fastapi import FastAPI
from .model_utils import get_access_info

app = FastAPI()


@app.get("/")
def home():
    return {"message": "AccessMap Ghana API is running"}


@app.get("/access")
def access(lat: float, lon: float):
    result = get_access_info(lat, lon)
    return result