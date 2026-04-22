import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
  CircleMarker
} from "react-leaflet";
import { useState } from "react";
import axios from "axios";

function ClickHandler({ setResult, setPosition, setLoading }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      setPosition([lat, lng]);
      setLoading(true);

      axios
        .get(`http://127.0.0.1:8000/access?lat=${lat}&lon=${lng}`)
        .then((res) => {
          setResult(res.data);
        })
        .catch(() => {
          setResult({ error: "Failed to fetch data" });
        })
        .finally(() => setLoading(false));
    },
  });

  return null;
}

export default function MapView() {
  const [result, setResult] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const getAccessColor = (level) => {
    if (level === "good") return "green";
    if (level === "moderate") return "orange";
    return "red";
  };

  const fetchRecommendations = () => {
    axios
      .get("http://127.0.0.1:8000/recommendations")
      .then((res) => {
        setRecommendations(res.data.locations || []);
        setShowRecommendations(true);
      })
      .catch(() => {
        alert("Failed to load recommendations");
      });
  };

  return (
    <div>
      {/* Buttons */}
      <div style={{ marginBottom: "10px", textAlign: "center" }}>
        <button onClick={fetchRecommendations}>
          Show Recommended Locations
        </button>

        {showRecommendations && (
          <button
            onClick={() => setShowRecommendations(false)}
            style={{ marginLeft: "10px" }}
          >
            Hide
          </button>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={[10.8, -0.85]}
        zoom={8}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler
          setResult={setResult}
          setPosition={setPosition}
          setLoading={setLoading}
        />

        {/* User Click Marker */}
        {position && (
          <Marker position={position}>
            <Popup>
              {loading ? (
                <p>Loading...</p>
              ) : result?.error ? (
                <p style={{ color: "red" }}>{result.error}</p>
              ) : result ? (
                <>
                  <p>
                    <b>Distance:</b> {result.distance_km} km
                  </p>

                  <p>
                    <b>Access:</b>{" "}
                    <span
                      style={{
                        color: getAccessColor(result.access_level),
                        fontWeight: "bold",
                      }}
                    >
                      {result.access_level}
                    </span>
                  </p>

                  <p>
                    <b>Nearest Facility:</b>{" "}
                    {result.nearest_facility || "Unknown"}
                  </p>

                  <p>
                    <b>Type:</b> {result.facility_type || "Unknown"}
                  </p>
                </>
              ) : null}
            </Popup>
          </Marker>
        )}

        {/* Recommendation Points (CircleMarkers) */}
        {showRecommendations &&
          recommendations.map((rec, index) => (
            <CircleMarker
              key={index}
              center={[rec.lat, rec.lon]}
              radius={6}
              pathOptions={{
                color: "blue",
                fillColor: "blue",
                fillOpacity: 0.7,
              }}
            >
              <Popup>
                <b>Recommended Site</b>
                <p>Distance gap: {rec.distance_km} km</p>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* Legend */}
      <div style={{ padding: "10px" }}>
        <b>Legend:</b>
        <div style={{ color: "green" }}>● Good (≤5 km)</div>
        <div style={{ color: "orange" }}>● Moderate (5–10 km)</div>
        <div style={{ color: "red" }}>● Poor (&gt;10 km)</div>
        <div style={{ color: "blue" }}>● Recommended Locations</div>
      </div>
    </div>
  );
}