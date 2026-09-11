import React from "react";
import BaseMap from "./BaseMap";
import { LocationMarker, MapUpdater } from "./MapComponents";

interface ProjectLocationPickerProps {
  latitude: string;
  longitude: string;
  onLocationSelect: (lat: number, lng: number, placeName?: string) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const ProjectLocationPicker = ({
  latitude,
  longitude,
  onLocationSelect,
  center = { lat: 24.12, lng: 55.15 },
  zoom = 8
}: ProjectLocationPickerProps) => {
  const position = React.useMemo(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  }, [latitude, longitude]);

  return (
    <BaseMap
      center={[center.lat, center.lng]}
      zoom={zoom}
      height="100%"
    >
      <MapUpdater lat={latitude} lng={longitude} />
      <LocationMarker
        position={position}
        setLocation={onLocationSelect}
      />
    </BaseMap>
  );
};

export default ProjectLocationPicker;
