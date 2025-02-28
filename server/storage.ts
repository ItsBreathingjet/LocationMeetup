import { locations, type Location, type InsertLocation } from "@shared/schema";

export interface IStorage {
  saveLocation(location: InsertLocation): Promise<Location>;
  getLocation(id: number): Promise<Location | undefined>;
}

export class MemStorage implements IStorage {
  private locations: Map<number, Location>;
  private currentId: number;

  constructor() {
    this.locations = new Map();
    this.currentId = 1;
  }

  async saveLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentId++;
    const location = { id, ...insertLocation };
    this.locations.set(id, location);
    return location;
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }
}

export const storage = new MemStorage();
