import { api } from "encore.dev/api";
import { discoveryDB } from "./db";

interface ShareDiscoveryRequest {
  discoveryId: number;
  platform?: 'twitter' | 'facebook' | 'whatsapp' | 'copy';
}

interface ShareDiscoveryResponse {
  shareUrl: string;
  shareText: string;
}

// Generate shareable content for a discovery
export const shareDiscovery = api<ShareDiscoveryRequest, ShareDiscoveryResponse>(
  { expose: true, method: "POST", path: "/share", auth: true },
  async (req, ctx) => {
    // Get the discovery
    const discovery = await discoveryDB.queryRow<{
      id: number;
      fact: string;
      category: string;
      user_id: number;
    }>`
      SELECT id, fact, category, user_id
      FROM discoveries
      WHERE id = ${req.discoveryId} AND user_id = ${ctx.userID}
    `;

    if (!discovery) {
      throw new Error("Discovery not found");
    }

    // Generate share content
    const shareText = `🤔 Did you know? ${discovery.fact} 

Discovered this amazing ${discovery.category} fact with CurioSnap! 📸✨

#CurioSnap #DidYouKnow #${discovery.category.charAt(0).toUpperCase() + discovery.category.slice(1)}`;

    const shareUrl = `${process.env.APP_URL || 'https://curiosnap.app'}/discovery/${discovery.id}`;

    // Track sharing analytics (optional)
    await discoveryDB.exec`
      INSERT INTO discovery_shares (discovery_id, user_id, platform, shared_at)
      VALUES (${req.discoveryId}, ${ctx.userID}, ${req.platform || 'unknown'}, NOW())
      ON CONFLICT DO NOTHING
    `;

    return {
      shareUrl,
      shareText
    };
  }
);

interface GetShareStatsRequest {
  discoveryId: number;
}

interface GetShareStatsResponse {
  totalShares: number;
  platforms: { platform: string; count: number }[];
}

// Get sharing statistics for a discovery
export const getShareStats = api<GetShareStatsRequest, GetShareStatsResponse>(
  { expose: true, method: "GET", path: "/share/stats", auth: true },
  async (req, ctx) => {
    const stats = await discoveryDB.queryAll<{
      platform: string;
      count: number;
    }>`
      SELECT platform, COUNT(*) as count
      FROM discovery_shares
      WHERE discovery_id = ${req.discoveryId}
      GROUP BY platform
    `;

    const totalShares = stats.reduce((sum, stat) => sum + stat.count, 0);

    return {
      totalShares,
      platforms: stats
    };
  }
);
