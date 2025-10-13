import type { Request, Response } from "express";
import { createPostService, getAllPostsService, getPostByIdService } from "./posts.service";
import { validatePostContent } from "../../utils/badwords";
import { 
  createLike, 
  deleteLike, 
  getLikeCount, 
  checkUserLiked,
  createComment,
  getCommentsByPost,
  getCommentCount
} from "./posts.model";

export const createPostController = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body as { title: string; content: string };
    const userId = (req as any).user?.user_id;

    if (!title || !content) {
      return res.status(400).json({ message: "Missing title or content" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validation = validatePostContent(title, content);
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: "Bài viết chứa từ ngữ không phù hợp. Vui lòng kiểm tra lại nội dung.",
        detectedWords: validation.allDetectedWords,
        titleIssues: validation.title.hasBadWords ? validation.title.detectedWords : [],
        contentIssues: validation.content.hasBadWords ? validation.content.detectedWords : []
      });
    }

    const result = await createPostService(userId, title, content);
    return res.status(201).json(result);
  } catch (err: any) {
    console.error("Create post error:", err);
    
    if (err?.message === "BAD_WORDS_DETECTED") {
      return res.status(400).json({ 
        message: "Bài viết chứa từ ngữ không phù hợp. Vui lòng kiểm tra lại nội dung." 
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPostsController = async (req: Request, res: Response) => {
  try {
    const posts = await getAllPostsService();
    return res.status(200).json(posts);
  } catch (err: any) {
    console.error("Get all posts error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPostByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Post ID is required" });
    }
    
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await getPostByIdService(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (err: any) {
    console.error("Get post by ID error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkBadWordsController = async (req: Request, res: Response) => {
  try {
    const { text, language = 'both' } = req.body as { text: string; language?: 'vi' | 'en' | 'both' };

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const validation = validatePostContent(text, "", language);

    return res.status(200).json({
      hasBadWords: validation.title.hasBadWords,
      cleanText: validation.title.cleanText,
      detectedWords: validation.title.detectedWords,
      language: language
    });
  } catch (err: any) {
    console.error("Check bad words error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============ LIKES ============

export const likePostController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const postId = parseInt(id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Kiểm tra xem user đã like chưa
    const alreadyLiked = await checkUserLiked(postId, userId);
    if (alreadyLiked) {
      return res.status(400).json({ message: "Already liked this post" });
    }

    await createLike(postId, userId);
    const likeCount = await getLikeCount(postId);

    return res.status(200).json({ 
      message: "Post liked successfully",
      likeCount,
      isLiked: true
    });
  } catch (err: any) {
    console.error("Like post error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const unlikePostController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const postId = parseInt(id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const deleted = await deleteLike(postId, userId);
    if (!deleted) {
      return res.status(400).json({ message: "Like not found" });
    }

    const likeCount = await getLikeCount(postId);

    return res.status(200).json({ 
      message: "Post unliked successfully",
      likeCount,
      isLiked: false
    });
  } catch (err: any) {
    console.error("Unlike post error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============ COMMENTS ============

export const getCommentsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const postId = parseInt(id);

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const comments = await getCommentsByPost(postId);
    return res.status(200).json(comments);
  } catch (err: any) {
    console.error("Get comments error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createCommentController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body as { content: string };
    const userId = (req as any).user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    if (!id) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const postId = parseInt(id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Kiểm tra từ cấm trong comment
    const validation = validatePostContent(content, "");
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: "Comment chứa từ ngữ không phù hợp",
        detectedWords: validation.allDetectedWords
      });
    }

    const commentId = await createComment(postId, userId, content);
    const commentCount = await getCommentCount(postId);

    return res.status(201).json({ 
      message: "Comment created successfully",
      comment_id: commentId,
      commentCount
    });
  } catch (err: any) {
    console.error("Create comment error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
