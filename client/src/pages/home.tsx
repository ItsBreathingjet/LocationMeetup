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
  const [pinMode, setPinMode] = useState<number | null>(null); // null for no pin mode, 0 or 1 for which location

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

  const handleMapClick = (lat: number, lon: number) => {
    if (pinMode === null) return;

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(data => {
        handleLocationSelect({
          lat,
          lon,
          name: data.display_name || `Custom Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
        }, pinMode);
      })
      .catch(() => {
        handleLocationSelect({
          lat,
          lon,
          name: `Custom Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
        }, pinMode);
      });
  };

  const fetchPOIs = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`
      );
      const data = await response.json();

      // Simulate POI data since we're not using a real POI API
      const mockPois: PointOfInterest[] = [
        {
          id: "1",
          name: "Local Park",
          category: "Parks",
          latitude: lat + 0.01,
          longitude: lon + 0.01,
          distance: calculateDistance(lat, lon, lat + 0.01, lon + 0.01)
        },
        {
          id: "2",
          name: "Town Restaurant",
          category: "Restaurants",
          latitude: lat - 0.01,
          longitude: lon - 0.01,
          distance: calculateDistance(lat, lon, lat - 0.01, lon - 0.01)
        },
        {
          id: "3",
          name: "Community Center",
          category: "Entertainment",
          latitude: lat + 0.02,
          longitude: lon - 0.02,
          distance: calculateDistance(lat, lon, lat + 0.02, lon - 0.02)
        }
      ];

      setPois(mockPois);
    } catch (error) {
      console.error("Failed to fetch POIs:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        <header className="text-center py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Meet In The Middle
          </h1>
          <p className="text-muted-foreground mt-2">
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
            <div className="bg-card rounded-lg shadow-lg overflow-hidden">
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