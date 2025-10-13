import { Router } from "express";
import { 
  createPostController, 
  getAllPostsController, 
  getPostByIdController, 
  checkBadWordsController,
  likePostController,
  unlikePostController,
  getCommentsController,
  createCommentController
} from "./posts.controller";
import { authenticateToken } from "../../middleware/auth";

const router = Router();

// POST /posts/check-badwords - Kiểm tra từ cấm (không cần auth)
router.post("/check-badwords", checkBadWordsController);

// Tất cả routes khác đều cần authentication
router.use(authenticateToken);

// POST /posts - Tạo bài viết mới
router.post("/", createPostController);

// GET /posts - Lấy tất cả bài viết
router.get("/", getAllPostsController);

// GET /posts/:id - Lấy bài viết theo ID
router.get("/:id", getPostByIdController);

// POST /posts/:id/like - Like bài viết
router.post("/:id/like", likePostController);

// DELETE /posts/:id/like - Unlike bài viết
router.delete("/:id/like", unlikePostController);

// GET /posts/:id/comments - Lấy comments của bài viết
router.get("/:id/comments", getCommentsController);

// POST /posts/:id/comments - Tạo comment mới
router.post("/:id/comments", createCommentController);

export default router;
