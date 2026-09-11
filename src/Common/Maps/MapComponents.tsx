import { useEffect } from "react";
import { useMap, useMapEvents, Marker } from "react-leaflet";

export const LocationMarker = ({
  position,
  setLocation,
}: {
  position: any;
  setLocation: (lat: number, lng: number, placeName?: string) => void;
}) => {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setLocation(lat, lng);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        );
        const data = await res.json();
        if (data && data.display_name) {
          setLocation(lat, lng, data.display_name);
        }
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
      }
    },
  });

  if (
    !position ||
    isNaN(parseFloat(position.lat)) ||
    isNaN(parseFloat(position.lng))
  ) {
    return null;
  }

  return <Marker position={position} />;
};

export const MapUpdater = ({ lat, lng }: { lat: string; lng: string }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        map.flyTo([parsedLat, parsedLng], 13);
      }
    }
  }, [lat, lng, map]);
  return null;
};
