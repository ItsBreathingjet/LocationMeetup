import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lon: number; name: string }) => void;
  onPinMode: () => void;
  label: string;
  isPinMode?: boolean;
}

export function LocationSearch({ onLocationSelect, onPinMode, label, isPinMode }: LocationSearchProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const searchLocation = async () => {
    if (!search.trim()) return;
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
    <Card className="p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-2 text-primary">{label}</h3>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search or tap map to drop pin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchLocation()}
            className="w-full"
          />
        </div>
        <div className="flex gap-1">
          <Button onClick={searchLocation} variant="outline" size="icon" className="shrink-0">
            <Search className="h-4 w-4" />
          </Button>
          <Button 
            onClick={onPinMode} 
            variant={isPinMode ? "default" : "outline"} 
            size="icon"
            className="shrink-0"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {results.length > 0 && (
        <div className="mt-2 space-y-1 max-h-[200px] overflow-y-auto">
          {results.map((result) => (
            <Button
              key={result.place_id}
              variant="ghost"
              className="w-full justify-start text-left text-sm py-2"
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
              <span className="truncate">{result.display_name}</span>
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}