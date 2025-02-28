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
  onMapClick?: (lat: number, lon: number) => void;
  isPinMode?: boolean;
}

export function MapView({ locations, midpoint, pois, onMapClick, isPinMode }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([35.5, -80], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      mapRef.current
    );

    if (onMapClick) {
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        if (isPinMode) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.getContainer().style.cursor = isPinMode ? 'crosshair' : '';
  }, [isPinMode]);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        layer.remove();
      }
    });

    const bounds = new L.LatLngBounds([]);

    locations.forEach((loc, index) => {
      const marker = L.marker([loc.lat, loc.lon], {
        icon: L.divIcon({
          className: 'bg-primary text-white rounded-full flex items-center justify-center font-bold',
          html: `<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">${index + 1}</div>`,
          iconSize: [32, 32],
        }),
      })
        .bindPopup(loc.name)
        .addTo(mapRef.current!);
      bounds.extend([loc.lat, loc.lon]);
    });

    if (midpoint) {
      const midpointIcon = L.divIcon({
        className: 'bg-destructive text-white rounded-full flex items-center justify-center',
        html: '<div class="w-10 h-10 bg-destructive rounded-full flex items-center justify-center text-white shadow-lg">📍</div>',
        iconSize: [40, 40],
      });

      L.marker([midpoint.latitude, midpoint.longitude], { icon: midpointIcon })
        .bindPopup('Midpoint')
        .addTo(mapRef.current);
      bounds.extend([midpoint.latitude, midpoint.longitude]);
    }

    if (pois) {
      pois.forEach((poi) => {
        const poiIcon = L.divIcon({
          className: 'bg-accent text-white rounded-full flex items-center justify-center',
          html: '<div class="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white shadow-lg">🎯</div>',
          iconSize: [32, 32],
        });

        L.marker([poi.latitude, poi.longitude], { icon: poiIcon })
          .bindPopup(`${poi.name} (${poi.category})`)
          .addTo(mapRef.current!);
      });
    }

    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, midpoint, pois]);

  return (
    <div>
      <div ref={mapContainerRef} className="w-full h-[50vh] lg:h-[70vh] rounded-lg" />
      {isPinMode && (
        <div className="bg-muted/80 text-muted-foreground text-sm p-2 rounded-b-lg text-center">
          Click on the map to drop a pin for your location
        </div>
      )}
    </div>
  );
}