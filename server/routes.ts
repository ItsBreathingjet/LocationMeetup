import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertLocationSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.post("/api/locations", async (req, res) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const location = await storage.saveLocation(locationData);
      res.json(location);
    } catch (error) {
      res.status(400).json({ error: "Invalid location data" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    
    const location = await storage.getLocation(id);
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }
    
    res.json(location);
  });

  return createServer(app);
}
