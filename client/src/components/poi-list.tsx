import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import type { PointOfInterest } from "@shared/schema";

interface PoiListProps {
  pois: PointOfInterest[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export function PoiList({ pois, selectedCategory, onCategorySelect }: PoiListProps) {
  const categories = Array.from(new Set(pois.map((poi) => poi.category)))
    .sort((a, b) => a.localeCompare(b));

  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      'Restaurant': '🍽️',
      'Cafe': '☕',
      'Park': '🌳',
      'Shopping': '🛍️',
      'Entertainment': '🎭',
      'Hotel': '🏨',
      'Bar': '🍸',
      'Museum': '🏛️',
      'Other': '📍'
    };
    return emojiMap[category] || emojiMap.Other;
  };

  return (
    <Card className="p-4 shadow-lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-primary">Points of Interest</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Discover places near the midpoint
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer transition-colors"
            onClick={() => onCategorySelect("all")}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => onCategorySelect(category)}
            >
              {getCategoryEmoji(category)} {category}
            </Badge>
          ))}
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {pois
              .filter((poi) => selectedCategory === "all" || poi.category === selectedCategory)
              .map((poi) => (
                <Card key={poi.id} className="p-4 hover:bg-accent/5 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getCategoryEmoji(poi.category)}</span>
                        <h4 className="font-medium line-clamp-1">{poi.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{poi.distance.toFixed(1)} km away</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${poi.latitude},${poi.longitude}`,
                          '_blank'
                        );
                      }}
                    >
                      View
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}