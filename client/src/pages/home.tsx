import { useState } from "react";
import { LocationSearch } from "@/components/location-search";
import { MapView } from "@/components/map-view";
import { PoiList } from "@/components/poi-list";
import { CarCollision } from "@/components/car-collision";
import { calculateMidpoint, calculateDistance, fetchRoutes } from "@/lib/map-utils";
import type { PointOfInterest } from "@shared/schema";

export default function Home() {
  const [locations, setLocations] = useState<Array<{ lat: number; lon: number; name: string }>>([]);
  const [midpoint, setMidpoint] = useState<{ latitude: number; longitude: number }>();
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [routes, setRoutes] = useState<Array<{
    path: [number, number][];
    duration: number;
    distance: number;
    isAlternative: boolean;
  }> | null>(null);

  const handleLocationSelect = async (location: { lat: number; lon: number; name: string }, index?: number) => {
    const locationIndex = typeof index === 'number' ? index : (locations.length === 2 ? 1 : locations.length);
    const newLocations = [...locations];
    newLocations[locationIndex] = location;
    if (newLocations.length > 2) newLocations.length = 2;

    setLocations(newLocations);

    if (newLocations.length === 2) {
      const mid = calculateMidpoint(
        newLocations[0].lat,
        newLocations[0].lon,
        newLocations[1].lat,
        newLocations[1].lon
      );
      setMidpoint(mid);
      fetchPOIs(mid.latitude, mid.longitude);

      // Fetch routes between the two locations
      const routeData = await fetchRoutes(
        [newLocations[0].lat, newLocations[0].lon],
        [newLocations[1].lat, newLocations[1].lon]
      );
      setRoutes(routeData);
    }
  };

  const handleMapClick = async (lat: number, lon: number) => {
    // Pin mode functionality removed
  };

  const fetchPOIs = async (lat: number, lon: number) => {
    try {
      // Fetch POIs using Overpass API
      const radius = 5000; // 5km radius
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"](around:${radius},${lat},${lon});
          node["leisure"](around:${radius},${lat},${lon});
          node["tourism"](around:${radius},${lat},${lon});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await fetch(
        `https://overpass-api.de/api/interpreter`,
        {
          method: 'POST',
          body: `data=${encodeURIComponent(query)}`,
        }
      );

      const data = await response.json();

      const processedPois: PointOfInterest[] = data.elements
        .filter((element: any) => element.tags && (element.tags.name || element.tags.amenity))
        .map((element: any) => {
          const category = getCategoryFromTags(element.tags);
          return {
            id: element.id.toString(),
            name: element.tags.name || capitalize(element.tags.amenity || element.tags.leisure || element.tags.tourism),
            category,
            latitude: element.lat,
            longitude: element.lon,
            distance: calculateDistance(lat, lon, element.lat, element.lon)
          };
        })
        .sort((a: PointOfInterest, b: PointOfInterest) => a.distance - b.distance)
        .slice(0, 15); // Limit to 15 closest POIs

      setPois(processedPois);
    } catch (error) {
      console.error("Failed to fetch POIs:", error);
    }
  };

  function getCategoryFromTags(tags: any): string {
    if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food') return 'Restaurant';
    if (tags.amenity === 'cafe') return 'Cafe';
    if (tags.leisure === 'park' || tags.leisure === 'garden') return 'Park';
    if (tags.shop) return 'Shopping';
    if (tags.amenity === 'theatre' || tags.amenity === 'cinema') return 'Entertainment';
    if (tags.tourism === 'hotel') return 'Hotel';
    if (tags.amenity === 'bar' || tags.amenity === 'pub') return 'Bar';
    if (tags.tourism === 'museum') return 'Museum';
    return 'Other';
  }

  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <div 
        className="absolute inset-0 bg-grid-primary/5 bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,white,transparent)]"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='20' height='20' fill='none' stroke='currentColor' stroke-width='0.5'/%3E%3C/svg%3E")` 
        }}
      />
      <div className="container mx-auto p-4 space-y-6 relative">
        <header className="text-center py-12 relative">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-xl"></div>
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
              Meet In The Middle
            </h1>
            <CarCollision />
            <p className="text-lg text-muted-foreground">
              Find the perfect meeting spot between two locations
            </p>
          </div>
        </header>

        <div className="space-y-6">
          {/* Map View */}
          <div className="bg-card rounded-lg shadow-2xl overflow-hidden border border-border/50 backdrop-blur-sm">
            <MapView
              locations={locations}
              midpoint={midpoint}
              pois={pois}
              routes={routes ?? undefined}
            />
          </div>

          {/* Location Search Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocationSearch
              label="Location 1"
              onLocationSelect={(loc) => handleLocationSelect(loc, 0)}
              selectedLocation={locations[0]}
            />
            <LocationSearch
              label="Location 2"
              onLocationSelect={(loc) => handleLocationSelect(loc, 1)}
              selectedLocation={locations[1]}
            />
          </div>

          {/* Points of Interest */}
          {pois.length > 0 && (
            <PoiList
              pois={pois}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          )}
        </div>
      </div>
    </div>
  );
}