from fastapi import FastAPI
from .model_utils import get_access_info
from fastapi.middleware.cors import CORSMiddleware
from .model_utils import get_summary_stats

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AccessMap Ghana API is running"}


@app.get("/access")
def access(lat: float, lon: float):
    result = get_access_info(lat, lon)
    return result

@app.get("/summary")
def summary():
    return get_summary_stats()