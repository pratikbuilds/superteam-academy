import { Hono } from "hono";
import { getLeaderboard } from "../leaderboard";

export const leaderboardRoutes = new Hono().get("/leaderboard", async (c) => {
  try {
    const entries = await getLeaderboard();
    return c.json(entries);
  } catch (e) {
    console.error("Leaderboard error", e);
    return c.json({ error: "LEADERBOARD_UNAVAILABLE" }, 503);
  }
});
