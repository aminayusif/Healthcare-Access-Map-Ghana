import geopandas as gpd
import numpy as np
from sklearn.neighbors import BallTree

# Load data once
facilities = gpd.read_file("backend/data/upper_east_facilities.geojson")

facilities["lat"] = facilities.geometry.y
facilities["lon"] = facilities.geometry.x

coords = facilities[["lat", "lon"]].values
coords_rad = np.radians(coords)

tree = BallTree(coords_rad, metric="haversine")


def get_access_info(lat, lon):
    point = np.array([[lat, lon]])
    point_rad = np.radians(point)

    dist, ind = tree.query(point_rad, k=1)
    distance_km = dist[0][0] * 6371

    if distance_km <= 5:
        level = "good"
    elif distance_km <= 10:
        level = "moderate"
    else:
        level = "poor"

    nearest_index = ind[0][0]
    nearest_facility = facilities.iloc[nearest_index]

    return {
        "distance_km": round(distance_km, 2),
        "access_level": level,
        "nearest_facility": nearest_facility.get("name", "Unknown"),
        "facility_type": nearest_facility.get("amenity", "Unknown")
    }