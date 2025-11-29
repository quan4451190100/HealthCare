import { validatePostContent } from "../../utils/badwords";
import { createPost, getAllPosts, getPostById } from "./posts.model";

export const createPostService = async (
  userId: number,
  title: string,
  content: string
) => {
  const validation = validatePostContent(title, content);

  if (!validation.isValid) {
    throw new Error("BAD_WORDS_DETECTED");
  }

  const cleanTitle = validation.title.cleanText;
  const cleanContent = validation.content.cleanText;

  const postId = await createPost(userId, cleanTitle, cleanContent);
  return { 
    post_id: postId, 
    title: cleanTitle, 
    content: cleanContent,
    original_title: title,
    original_content: content
  };
};

export const getAllPostsService = async () => {
  return await getAllPosts();
};

export const getPostByIdService = async (postId: number) => {
  return await getPostById(postId);
};
