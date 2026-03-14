import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { videos, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * GET /api/videos
 * Fetch paginated videos
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const videoList = await db
      .select()
      .from(videos)
      .where(eq(videos.isPublic, true))
      .orderBy(videos.createdAt)
      .limit(limit)
      .offset(offset);

    const videoWithUsers = await Promise.all(
      videoList.map(async (video: any) => {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, video.userId))
          .limit(1);

        return {
          ...video,
          user: user[0] || null,
        };
      })
    );

    res.json({
      videos: videoWithUsers,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

/**
 * GET /api/videos/:id
 * Get single video by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const videoId = parseInt(req.params.id);

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const video = await db
      .select()
      .from(videos)
      .where(eq(videos.id, videoId))
      .limit(1);

    if (!video[0]) {
      return res.status(404).json({ error: "Video not found" });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, video[0].userId))
      .limit(1);

    res.json({
      ...video[0],
      user: user[0] || null,
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

/**
 * POST /api/videos/upload
 * Upload new video
 */
router.post("/upload", async (req: Request, res: Response) => {
  try {
    const {
      caption,
      hashtags,
      isPublic,
      duration,
      width,
      height,
      videoUrl,
      thumbnailUrl,
    } = req.body;

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    // Get user ID from auth token (simplified)
    const userId = (req as any).userId || 1;

    const newVideo = await db
      .insert(videos)
      .values({
        userId,
        title: caption || "Untitled",
        description: caption,
        videoUrl: videoUrl || "",
        thumbnailUrl: thumbnailUrl || "",
        duration: duration || 0,
        fileSize: 0,
        width: width || 1080,
        height: height || 1920,
        videoQuality: "high",
        isPublic: isPublic !== false,
        isProcessing: true,
        processingStatus: "processing",
      });

    res.status(201).json({
      id: 1,
      videoUrl: videoUrl || "",
      thumbnailUrl: thumbnailUrl || "",
      message: "Video uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Failed to upload video" });
  }
});

/**
 * PUT /api/videos/:id
 * Update video metadata
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const videoId = parseInt(req.params.id);
    const { caption, isPublic } = req.body;

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const updated = await db
      .update(videos)
      .set({
        description: caption,
        isPublic,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, videoId));

    res.json({ message: "Video updated successfully" });
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ error: "Failed to update video" });
  }
});

/**
 * DELETE /api/videos/:id
 * Delete video
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const videoId = parseInt(req.params.id);

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    await db.delete(videos).where(eq(videos.id, videoId));

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

export default router;
