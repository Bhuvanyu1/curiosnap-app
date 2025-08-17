import { api } from "encore.dev/api";
import { discoveryDB } from "./db";

interface SaveDiscoveryRequest {
  imageData: string;
  fact: string;
  category: string;
}

interface SaveDiscoveryResponse {
  id: number;
  createdAt: Date;
}

// Saves a discovery to the database.
export const saveDiscovery = api<SaveDiscoveryRequest, SaveDiscoveryResponse>(
  { expose: true, method: "POST", path: "/save" },
  async (req) => {
    const result = await discoveryDB.queryRow<{ id: number; created_at: Date }>`
      INSERT INTO discoveries (image_data, fact, category)
      VALUES (${req.imageData}, ${req.fact}, ${req.category})
      RETURNING id, created_at
    `;

    if (!result) {
      throw new Error("Failed to save discovery");
    }

    return {
      id: result.id,
      createdAt: result.created_at
    };
  }
);
