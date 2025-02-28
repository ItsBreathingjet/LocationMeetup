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
  routes?: Array<{
    path: [number, number][];
    duration: number;
    distance: number;
    isAlternative: boolean;
  }>;
}

export function MapView({ locations, midpoint, pois, routes }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeLayersRef = useRef<L.Polyline[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([35.5, -80], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      mapRef.current
    );

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers and routes
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Polyline) {
        layer.remove();
      }
    });
    routeLayersRef.current = [];

    const bounds = new L.LatLngBounds([]);

    // Add location markers
    locations.forEach((loc, index) => {
      const marker = L.marker([loc.lat, loc.lon], {
        icon: L.divIcon({
          className: 'bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-lg',
          html: `<div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white">${index + 1}</div>`,
          iconSize: [40, 40],
        }),
      })
        .bindPopup(loc.name)
        .addTo(mapRef.current!);

      bounds.extend([loc.lat, loc.lon]);
    });

    // Add midpoint marker
    if (midpoint) {
      const midpointIcon = L.divIcon({
        className: 'flex items-center justify-center',
        html: '<div class="w-12 h-12 bg-destructive rounded-full flex items-center justify-center text-white text-xl shadow-lg border-2 border-white animate-pulse">📍</div>',
        iconSize: [48, 48],
      });

      L.marker([midpoint.latitude, midpoint.longitude], { icon: midpointIcon })
        .bindPopup('<div class="text-center"><strong>Midpoint</strong><br>Perfect meeting spot!</div>')
        .addTo(mapRef.current);

      bounds.extend([midpoint.latitude, midpoint.longitude]);
    }

    // Add route layers
    if (routes) {
      routes.forEach((route, index) => {
        const routeLayer = L.polyline(route.path, {
          color: index === 0 ? '#2563eb' : '#64748b',
          weight: index === 0 ? 5 : 3,
          opacity: index === 0 ? 1 : 0.7,
          dashArray: index === 0 ? undefined : '5, 10',
        })
          .bindPopup(`
            <div class="p-2">
              <div class="font-medium">${index === 0 ? 'Recommended Route' : 'Alternative Route'}</div>
              <div class="text-sm text-muted-foreground">
                Distance: ${(route.distance / 1000).toFixed(1)} km<br>
                Duration: ${Math.round(route.duration / 60)} mins
              </div>
            </div>
          `)
          .addTo(mapRef.current);

        routeLayersRef.current.push(routeLayer);
        route.path.forEach(point => bounds.extend(point));
      });
    }

    // Add POI markers
    if (pois) {
      pois.forEach((poi) => {
        const poiIcon = L.divIcon({
          className: 'flex items-center justify-center',
          html: `<div class="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white hover:scale-110 transition-transform">
            ${getCategoryEmoji(poi.category)}
          </div>`,
          iconSize: [40, 40],
        });

        const popupContent = `
          <div class="p-2">
            <strong class="text-lg">${poi.name}</strong>
            <p class="text-sm text-muted-foreground">${poi.category}</p>
            <a href="https://www.google.com/maps/search/?api=1&query=${poi.latitude},${poi.longitude}" 
               target="_blank" 
               class="text-sm text-primary hover:underline">
              View on Google Maps
            </a>
          </div>
        `;

        L.marker([poi.latitude, poi.longitude], { icon: poiIcon })
          .bindPopup(popupContent)
          .addTo(mapRef.current!);
      });
    }

    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, midpoint, pois, routes]);

  function getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      'Restaurant': '🍽️',
      'Cafe': '☕',
      'Park': '🌳',
      'Shopping': '🛍️',
      'Entertainment': '🎭',
      'Hotel': '🏨',
      'Bar': '🍸',
      'Museum': '🏛️',
      'default': '📍'
    };

    return emojiMap[category] || emojiMap.default;
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-xl">
      <div ref={mapContainerRef} className="w-full h-[50vh] lg:h-[70vh]" />
    </div>
  );
}