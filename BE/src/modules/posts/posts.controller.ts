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
  
  if (!result || !result.post_id) {
    console.error("Create post error: result is null or invalid");
    return res.status(500).json({ message: "Internal server error" });
  }
  
  return res.status(201).json(result);
};

export const getAllPostsController = async (req: Request, res: Response) => {
  const posts = await getAllPostsService();
  
  if (!posts) {
    console.error("Get all posts error: posts is null");
    return res.status(500).json({ message: "Internal server error" });
  }
  
  return res.status(200).json(posts);
};

export const getPostByIdController = async (req: Request, res: Response) => {
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
};

export const checkBadWordsController = async (req: Request, res: Response) => {
  const { text, language = 'both' } = req.body as { text: string; language?: 'vi' | 'en' | 'both' };

  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }

  const validation = validatePostContent(text, "", language);
  
  if (!validation) {
    console.error("Check bad words error: validation is null");
    return res.status(500).json({ message: "Internal server error" });
  }

  return res.status(200).json({
    hasBadWords: validation.title.hasBadWords,
    cleanText: validation.title.cleanText,
    detectedWords: validation.title.detectedWords,
    language: language
  });
};

export const likePostController = async (req: Request, res: Response) => {
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

  const created = await createLike(postId, userId);
  
  if (!created) {
    console.error("Like post error: failed to create like");
    return res.status(500).json({ message: "Internal server error" });
  }
  
  const likeCount = await getLikeCount(postId);

  return res.status(200).json({ 
    message: "Post liked successfully",
    likeCount,
    isLiked: true
  });
};

export const unlikePostController = async (req: Request, res: Response) => {
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
};

export const getCommentsController = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  const postId = parseInt(id);

  if (isNaN(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  const comments = await getCommentsByPost(postId);
  
  if (!comments) {
    console.error("Get comments error: comments is null");
    return res.status(500).json({ message: "Internal server error" });
  }
  
  return res.status(200).json(comments);
};

export const createCommentController = async (req: Request, res: Response) => {
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
  
  if (!commentId) {
    console.error("Create comment error: failed to create comment");
    return res.status(500).json({ message: "Internal server error" });
  }
  
  const commentCount = await getCommentCount(postId);

  return res.status(201).json({ 
    message: "Comment created successfully",
    comment_id: commentId,
    commentCount
  });
};
