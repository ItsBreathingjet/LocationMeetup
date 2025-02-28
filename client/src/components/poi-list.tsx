import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PointOfInterest } from "@shared/schema";

interface PoiListProps {
  pois: PointOfInterest[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export function PoiList({ pois, selectedCategory, onCategorySelect }: PoiListProps) {
  const categories = Array.from(new Set(pois.map((poi) => poi.category)));

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Points of Interest</h3>
      
      <div className="flex gap-2 flex-wrap mb-4">
        <Badge
          variant={selectedCategory === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onCategorySelect("all")}
        >
          All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onCategorySelect(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {pois
            .filter((poi) => selectedCategory === "all" || poi.category === selectedCategory)
            .map((poi) => (
              <Card key={poi.id} className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{poi.name}</h4>
                    <p className="text-sm text-muted-foreground">{poi.category}</p>
                  </div>
                  <Badge variant="secondary">
                    {poi.distance.toFixed(1)} km
                  </Badge>
                </div>
              </Card>
            ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
