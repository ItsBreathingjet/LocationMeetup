import { useState } from "react";
import { LocationSearch } from "@/components/location-search";
import { MapView } from "@/components/map-view";
import { PoiList } from "@/components/poi-list";
import { calculateMidpoint, calculateDistance } from "@/lib/map-utils";
import type { PointOfInterest } from "@shared/schema";

export default function Home() {
  const [locations, setLocations] = useState<Array<{ lat: number; lon: number; name: string }>>([]);
  const [midpoint, setMidpoint] = useState<{ latitude: number; longitude: number }>();
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pinMode, setPinMode] = useState<number | null>(null);

  const handleLocationSelect = (location: { lat: number; lon: number; name: string }, index?: number) => {
    const locationIndex = typeof index === 'number' ? index : (locations.length === 2 ? 1 : locations.length);
    const newLocations = [...locations];
    newLocations[locationIndex] = location;
    if (newLocations.length > 2) newLocations.length = 2;

    setLocations(newLocations);
    setPinMode(null);

    if (newLocations.length === 2) {
      const mid = calculateMidpoint(
        newLocations[0].lat,
        newLocations[0].lon,
        newLocations[1].lat,
        newLocations[1].lon
      );
      setMidpoint(mid);
      fetchPOIs(mid.latitude, mid.longitude);
    }
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

  const handleMapClick = async (lat: number, lon: number) => {
    if (pinMode === null) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();

      handleLocationSelect({
        lat,
        lon,
        name: data.display_name || `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
      }, pinMode);
    } catch (error) {
      console.error("Failed to reverse geocode:", error);
      handleLocationSelect({
        lat,
        lon,
        name: `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
      }, pinMode);
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
        <header className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-3">
            Meet In The Middle
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect meeting spot between two locations
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 lg:order-1">
            <LocationSearch
              label="Location 1"
              onLocationSelect={(loc) => handleLocationSelect(loc, 0)}
              onPinMode={() => setPinMode(0)}
              isPinMode={pinMode === 0}
            />
            <LocationSearch
              label="Location 2"
              onLocationSelect={(loc) => handleLocationSelect(loc, 1)}
              onPinMode={() => setPinMode(1)}
              isPinMode={pinMode === 1}
            />
            {pois.length > 0 && (
              <PoiList
                pois={pois}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            )}
          </div>

          <div className="lg:col-span-2 lg:order-2">
            <div className="bg-card rounded-lg shadow-2xl overflow-hidden border border-border/50 backdrop-blur-sm">
              <MapView
                locations={locations}
                midpoint={midpoint}
                pois={pois}
                onMapClick={handleMapClick}
                isPinMode={pinMode !== null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}