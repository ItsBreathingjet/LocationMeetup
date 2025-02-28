import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lon: number; name: string }) => void;
  label: string;
}

export function LocationSearch({ onLocationSelect, label }: LocationSearchProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const searchLocation = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to search location:", error);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">{label}</h3>
      <div className="flex gap-2">
        <Input
          placeholder="Enter location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && searchLocation()}
        />
        <Button onClick={searchLocation}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {results.length > 0 && (
        <div className="mt-2 space-y-1">
          {results.map((result) => (
            <Button
              key={result.place_id}
              variant="ghost"
              className="w-full justify-start text-left"
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
              {result.display_name}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}
