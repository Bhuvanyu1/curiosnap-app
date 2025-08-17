import { api } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { Header } from "encore.dev/api";
import { discoveryDB } from "../discovery/db";

interface User {
  id: number;
  email: string;
  username: string;
  avatar?: string;
  interests: string[];
  streakCount: number;
  totalFacts: number;
  isPremium: boolean;
  lastActivityDate?: string;
  createdAt: Date;
}

interface AuthData {
  userID: number;
  email: string;
}

interface LoginRequest {
  email: string;
  username?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

// Simple token-based auth for demo purposes
// In production, use proper JWT or OAuth
export const auth = authHandler(async (token: string): Promise<AuthData> => {
  // Decode the simple token (email:userId format)
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [email, userIdStr] = decoded.split(':');
    const userID = parseInt(userIdStr);
    
    if (!email || !userID) {
      throw new Error('Invalid token');
    }

    return { userID, email };
  } catch (error) {
    throw new Error('Invalid token');
  }
});

// Login or register user
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    let user = await discoveryDB.queryRow<{
      id: number;
      email: string;
      username: string;
      avatar: string | null;
      interests: string[];
      streak_count: number;
      total_facts: number;
      is_premium: boolean;
      last_activity_date: Date | null;
      created_at: Date;
    }>`
      SELECT id, email, username, avatar, interests, streak_count, total_facts, is_premium, last_activity_date, created_at
      FROM users
      WHERE email = ${req.email}
    `;

    if (!user) {
      // Create new user
      const username = req.username || req.email.split('@')[0];
      user = await discoveryDB.queryRow<{
        id: number;
        email: string;
        username: string;
        avatar: string | null;
        interests: string[];
        streak_count: number;
        total_facts: number;
        is_premium: boolean;
        last_activity_date: Date | null;
        created_at: Date;
      }>`
        INSERT INTO users (email, username, interests)
        VALUES (${req.email}, ${username}, ${[]})
        RETURNING id, email, username, avatar, interests, streak_count, total_facts, is_premium, last_activity_date, created_at
      `;

      if (!user) {
        throw new Error("Failed to create user");
      }
    }

    // Generate simple token
    const token = Buffer.from(`${user.email}:${user.id}`).toString('base64');

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar || undefined,
        interests: user.interests,
        streakCount: user.streak_count,
        totalFacts: user.total_facts,
        isPremium: user.is_premium,
        lastActivityDate: user.last_activity_date?.toISOString().split('T')[0],
        createdAt: user.created_at
      }
    };
  }
);

// Get current user profile
export const getProfile = api<{}, User>(
  { expose: true, method: "GET", path: "/auth/profile", auth: true },
  async (req, ctx) => {
    const user = await discoveryDB.queryRow<{
      id: number;
      email: string;
      username: string;
      avatar: string | null;
      interests: string[];
      streak_count: number;
      total_facts: number;
      is_premium: boolean;
      last_activity_date: Date | null;
      created_at: Date;
    }>`
      SELECT id, email, username, avatar, interests, streak_count, total_facts, is_premium, last_activity_date, created_at
      FROM users
      WHERE id = ${ctx.userID}
    `;

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar || undefined,
      interests: user.interests,
      streakCount: user.streak_count,
      totalFacts: user.total_facts,
      isPremium: user.is_premium,
      lastActivityDate: user.last_activity_date?.toISOString().split('T')[0],
      createdAt: user.created_at
    };
  }
);

interface UpdateProfileRequest {
  username?: string;
  avatar?: string;
  interests?: string[];
}

// Update user profile
export const updateProfile = api<UpdateProfileRequest, User>(
  { expose: true, method: "PUT", path: "/auth/profile", auth: true },
  async (req, ctx) => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(req.username);
    }
    if (req.avatar !== undefined) {
      updates.push(`avatar = $${paramIndex++}`);
      values.push(req.avatar);
    }
    if (req.interests !== undefined) {
      updates.push(`interests = $${paramIndex++}`);
      values.push(req.interests);
    }

    updates.push(`updated_at = NOW()`);
    values.push(ctx.userID);

    const user = await discoveryDB.queryRow<{
      id: number;
      email: string;
      username: string;
      avatar: string | null;
      interests: string[];
      streak_count: number;
      total_facts: number;
      is_premium: boolean;
      last_activity_date: Date | null;
      created_at: Date;
    }>`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, username, avatar, interests, streak_count, total_facts, is_premium, last_activity_date, created_at
    `;

    if (!user) {
      throw new Error("Failed to update user");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar || undefined,
      interests: user.interests,
      streakCount: user.streak_count,
      totalFacts: user.total_facts,
      isPremium: user.is_premium,
      lastActivityDate: user.last_activity_date?.toISOString().split('T')[0],
      createdAt: user.created_at
    };
  }
);
