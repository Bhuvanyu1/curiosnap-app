import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { discoveryDB } from "./db";

interface ListDiscoveriesRequest {
  limit?: Query<number>;
  offset?: Query<number>;
}

interface Discovery {
  id: number;
  imageData: string;
  fact: string;
  category: string;
  createdAt: Date;
}

interface ListDiscoveriesResponse {
  discoveries: Discovery[];
  total: number;
}

// Lists saved discoveries with pagination.
export const listDiscoveries = api<ListDiscoveriesRequest, ListDiscoveriesResponse>(
  { expose: true, method: "GET", path: "/discoveries" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;

    const discoveries = await discoveryDB.queryAll<{
      id: number;
      image_data: string;
      fact: string;
      category: string;
      created_at: Date;
    }>`
      SELECT id, image_data, fact, category, created_at
      FROM discoveries
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const totalResult = await discoveryDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM discoveries
    `;

    return {
      discoveries: discoveries.map(d => ({
        id: d.id,
        imageData: d.image_data,
        fact: d.fact,
        category: d.category,
        createdAt: d.created_at
      })),
      total: totalResult?.count || 0
    };
  }
);
