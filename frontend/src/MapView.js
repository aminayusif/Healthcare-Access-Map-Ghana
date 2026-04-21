import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from "react-leaflet";
import { useState } from "react";
import axios from "axios";

function ClickHandler({ setResult, setPosition }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      axios.get(`http://127.0.0.1:8000/access?lat=${lat}&lon=${lng}`)
        .then(res => {
          setResult(res.data);
        });
        
    }
  });
  return null;
}

export default function MapView() {
  const [result, setResult] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <MapContainer center={[10.8, -0.85]} zoom={8} style={{ height: "500px" }}>
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler setResult={setResult} setPosition={setPosition} />

        {position && (
          <Marker position={position}>
            <Popup>
              {result ? (
                <>
                  <p><b>Distance:</b> {result.distance_km} km</p>
                  <p>
  <b>Access:</b>{" "}
  <span style={{
    color:
      result.access_level === "good" ? "green" :
      result.access_level === "moderate" ? "orange" : "red"
  }}>
    {result.access_level}
  </span>
</p>
                </>
              ) : "Loading..."}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}