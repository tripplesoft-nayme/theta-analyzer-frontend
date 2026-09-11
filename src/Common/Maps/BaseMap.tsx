import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet marker icon issue
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface BaseMapProps {
  center: [number, number];
  zoom?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  markerPosition?: [number, number];
  height?: string;
  children?: React.ReactNode;
}

const MapEvents = ({ 
  onSelect 
}: { 
  onSelect?: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      if (onSelect) {
        onSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const BaseMap = ({ 
  center, 
  zoom = 13, 
  onLocationSelect, 
  markerPosition,
  height = "100%",
  children
}: BaseMapProps) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents onSelect={onLocationSelect} />
      {markerPosition && markerPosition[0] !== 0 && (
        <Marker position={markerPosition} />
      )}
      {children}
    </MapContainer>
  );
};

export default BaseMap;
