import geopandas as gpd
import numpy as np
from sklearn.neighbors import BallTree
import pandas as pd

# -----------------------------
# LOAD DATA (runs once at startup)
# -----------------------------
try:
    facilities = gpd.read_file("backend/data/upper_east_facilities.geojson")
except Exception as e:
    raise RuntimeError(f"Error loading facilities data: {e}")

# Ensure valid geometry
facilities = facilities.dropna(subset=["geometry"]).reset_index(drop=True)

# Extract coordinates
facilities["lat"] = facilities.geometry.y
facilities["lon"] = facilities.geometry.x

# Prepare for BallTree
coords = facilities[["lat", "lon"]].values
coords_rad = np.radians(coords)

# Build spatial index
tree = BallTree(coords_rad, metric="haversine")


# -----------------------------
# CORE FUNCTION
# -----------------------------
def get_access_info(lat: float, lon: float) -> dict:
    """
    Returns healthcare access info for a given location.
    """

    try:
        # Convert input to array
        point = np.array([[lat, lon]])
        point_rad = np.radians(point)

        # Query nearest facility
        dist, ind = tree.query(point_rad, k=1)

        distance_km = float(dist[0][0] * 6371)
        nearest_index = int(ind[0][0])
        nearest_facility = facilities.iloc[nearest_index]

        # Access classification
        if distance_km <= 5:
            level = "good"
        elif distance_km <= 10:
            level = "moderate"
        else:
            level = "poor"

        return {
            "distance_km": round(distance_km, 2),
            "access_level": level,
            "nearest_facility": nearest_facility.get("name", "Unknown"),
            "facility_type": nearest_facility.get("amenity", "Unknown"),
            "coordinates": {
                "lat": lat,
                "lon": lon
            }
        }

    except Exception as e:
        return {"error": str(e)}


# -----------------------------
# SUMMARY FUNCTION (OPTIONAL)
# -----------------------------
def get_summary_stats() -> dict:
    """
    Returns basic statistics about facility distribution.
    """

    try:
        total_facilities = len(facilities)

        facility_counts = facilities["amenity"].value_counts().to_dict()

        return {
            "total_facilities": total_facilities,
            "facility_types": facility_counts
        }

    except Exception as e:
        return {"error": str(e)}
    



def get_recommendations(top_n: int = 20):
    """
    Returns top underserved locations for new facility placement.
    """

    try:
        grid_df = pd.read_csv("backend/data/upper_east_distance_grid.csv")

        # Sort by worst access (highest distance)
        worst_areas = grid_df.sort_values(
            by="distance_km", ascending=False
        ).head(top_n)

        recommendations = []

        for _, row in worst_areas.iterrows():
            recommendations.append({
                "lat": row["lat"],
                "lon": row["lon"],
                "distance_km": round(row["distance_km"], 2),
                "priority": "high"
            })

        return {
            "total_recommendations": len(recommendations),
            "locations": recommendations
        }

    except Exception as e:
        return {"error": str(e)}