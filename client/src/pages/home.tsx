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

  const handleLocationSelect = (location: { lat: number; lon: number; name: string }) => {
    const newLocations = locations.length < 2 
      ? [...locations, location]
      : [locations[1], location];
    
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
    }
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
          name: "Central Park",
          category: "Parks",
          latitude: lat + 0.01,
          longitude: lon + 0.01,
          distance: calculateDistance(lat, lon, lat + 0.01, lon + 0.01)
        },
        {
          id: "2",
          name: "Downtown Cafe",
          category: "Restaurants",
          latitude: lat - 0.01,
          longitude: lon - 0.01,
          distance: calculateDistance(lat, lon, lat - 0.01, lon - 0.01)
        },
        {
          id: "3",
          name: "Shopping Mall",
          category: "Shopping",
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Meet In The Middle
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <LocationSearch
              label="Starting Location"
              onLocationSelect={handleLocationSelect}
            />
            <LocationSearch
              label="Destination"
              onLocationSelect={handleLocationSelect}
            />
            {pois.length > 0 && (
              <PoiList
                pois={pois}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            )}
          </div>
          
          <div className="md:col-span-2">
            <MapView
              locations={locations}
              midpoint={midpoint}
              pois={pois}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
