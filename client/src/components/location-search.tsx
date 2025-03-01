import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { PointOfInterest } from "@shared/schema";

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lon: number; name: string }) => void;
  label: string;
  selectedLocation?: { lat: number; lon: number; name: string };
}

export function LocationSearch({ onLocationSelect, label, selectedLocation }: LocationSearchProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchLocation = async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Failed to search location:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchLocation, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <Card className="p-4 shadow-lg backdrop-blur-sm bg-white/90 dark:bg-gray-950/90">
      <h3 className="text-lg font-semibold mb-2 text-primary">{label}</h3>
      <div className="space-y-2">
        {selectedLocation ? (
          <div className="p-3 bg-accent/10 rounded-lg flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm truncate">{selectedLocation.name}</span>
          </div>
        ) : null}
        <div className="flex-1 relative">
          <Input
            placeholder="Search for a location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-8"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>
      {results.length > 0 && (
        <div className="mt-2 space-y-1 max-h-[200px] overflow-y-auto rounded-lg border bg-card shadow-sm">
          {results.map((result) => (
            <button
              key={result.place_id}
              className="w-full text-left px-3 py-2 hover:bg-accent/5 transition-colors flex items-center gap-2"
              onClick={() => {
                onLocationSelect({
                  lat: parseFloat(result.lat),
                  lon: parseFloat(result.lon),
                  name: result.display_name,
                });
                setResults([]);
                setSearch("");
              }}
            >
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-sm">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}