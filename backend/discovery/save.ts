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
  { expose: true, method: "POST", path: "/save", auth: true },
  async (req, ctx) => {
    const result = await discoveryDB.queryRow<{ id: number; created_at: Date }>`
      INSERT INTO discoveries (image_data, fact, category, user_id)
      VALUES (${req.imageData}, ${req.fact}, ${req.category}, ${ctx.userID})
      RETURNING id, created_at
    `;

    if (!result) {
      throw new Error("Failed to save discovery");
    }

    // Update user stats
    await discoveryDB.exec`
      UPDATE users 
      SET total_facts = total_facts + 1,
          last_activity_date = CURRENT_DATE,
          streak_count = CASE 
            WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN streak_count + 1
            WHEN last_activity_date = CURRENT_DATE THEN streak_count
            ELSE 1
          END
      WHERE id = ${ctx.userID}
    `;

    return {
      id: result.id,
      createdAt: result.created_at
    };
  }
);
