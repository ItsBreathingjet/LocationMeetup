import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  locations: { lat: number; lon: number; name: string }[];
  midpoint?: { latitude: number; longitude: number };
  pois?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    category: string;
  }>;
}

export function MapView({ locations, midpoint, pois }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([35.5, -80], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      mapRef.current
    );

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        layer.remove();
      }
    });

    const bounds = new L.LatLngBounds([]);

    locations.forEach((loc) => {
      L.marker([loc.lat, loc.lon])
        .bindPopup(loc.name)
        .addTo(mapRef.current!);
      bounds.extend([loc.lat, loc.lon]);
    });

    if (midpoint) {
      L.circle([midpoint.latitude, midpoint.longitude], {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 5000,
      }).addTo(mapRef.current);
      bounds.extend([midpoint.latitude, midpoint.longitude]);
    }

    if (pois) {
      pois.forEach((poi) => {
        L.marker([poi.latitude, poi.longitude], {
          icon: L.divIcon({
            className: "bg-primary text-white p-2 rounded-full",
            html: "📍",
          }),
        })
          .bindPopup(`${poi.name} (${poi.category})`)
          .addTo(mapRef.current!);
      });
    }

    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, midpoint, pois]);

  return <div ref={mapContainerRef} className="w-full h-[600px] rounded-lg" />;
}
