import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Map } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Map className="h-16 w-16 text-primary mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
              Page Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              Looks like you've wandered off the map! Let's help you find your way back.
            </p>
            <Link href="/">
              <Button className="w-full sm:w-auto">
                Return to Location Search
              </Button>
            </Link>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-2">Looking for something?</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Find midpoint between two locations</li>
              <li>• Discover meeting spots and points of interest</li>
              <li>• Calculate fair meeting distances</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}