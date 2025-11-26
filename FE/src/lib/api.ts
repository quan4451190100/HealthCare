export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL as string
) || "http://localhost:5000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiFetch<TResponse>(
  path: string,
  options: RequestInit & { method?: HttpMethod; skipAuth?: boolean } = {}
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;

  // Get token from localStorage if available (unless skipAuth is true)
  const token = !options.skipAuth ? localStorage.getItem("auth_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Add Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const message = await safeParseError(response);
    
    // If token is invalid/expired (403), clear it from localStorage
    if (response.status === 403 || response.status === 401) {
      const tokenExists = localStorage.getItem("auth_token");
      if (tokenExists && (message?.includes("token") || message?.includes("Unauthorized") || message?.includes("Forbidden"))) {
        localStorage.removeItem("auth_token");
      }
    }
    
    throw new Error(message || `Request failed with ${response.status}`);
  }

  // handle empty body
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {

    return (await response.text()) as unknown as TResponse;
  }

  return (await response.json()) as TResponse;
}

async function safeParseError(res: Response): Promise<string | null> {
  try {
    const data = await res.json();
    if (data && typeof data.message === "string") return data.message;
    return null;
  } catch {
    return null;
  }
}

// Auth APIs
export type LoginRequest = { email: string; password: string };
export type LoginResponse = { 
  user_id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  token: string;
};
export function loginApi(body: LoginRequest) {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type RegisterRequest = { name: string; email: string; password: string };
export type RegisterResponse = { 
  user_id: number; 
  name: string; 
  email: string; 
  token: string;
};
export function registerApi(body: RegisterRequest) {
  return apiFetch<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type UserProfile = {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  created_at: string;
};
export function getProfileApi() {
  return apiFetch<UserProfile>("/api/auth/profile", {
    method: "GET",
  });
}

export type UpdateProfileRequest = { 
  name: string; 
  email: string;
  phone?: string;
  address?: string;
};
export type UpdateProfileResponse = {
  message: string;
  user: UserProfile;
};
export function updateProfileApi(body: UpdateProfileRequest) {
  return apiFetch<UpdateProfileResponse>("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export type HealthResponse = { status: string };
export function healthApi() {
  return apiFetch<HealthResponse>("/api/health");
}

// Posts APIs
export type CheckBadWordsRequest = { text: string; language?: "vi" | "en" | "both" };
export type CheckBadWordsResponse = {
  hasBadWords: boolean;
  cleanText: string;
  detectedWords: string[];
  language: string;
};
export function checkBadWordsApi(body: CheckBadWordsRequest) {
  return apiFetch<CheckBadWordsResponse>("/api/posts/check-badwords", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true, // API này không cần authentication
  });
}

export type CreatePostRequest = { title: string; content: string };
export type CreatePostResponse = { post_id: number; title: string; content: string; original_title?: string; original_content?: string };
export function createPostApi(body: CreatePostRequest) {
  return apiFetch<CreatePostResponse>("/api/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Like/Unlike APIs
export type LikeResponse = { message: string; likeCount: number; isLiked: boolean };
export function likePostApi(postId: number) {
  return apiFetch<LikeResponse>(`/api/posts/${postId}/like`, {
    method: "POST",
  });
}

export function unlikePostApi(postId: number) {
  return apiFetch<LikeResponse>(`/api/posts/${postId}/like`, {
    method: "DELETE",
  });
}

// Comment APIs
export type Comment = {
  comment_id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_name: string;
};

export function getCommentsApi(postId: number) {
  return apiFetch<Comment[]>(`/api/posts/${postId}/comments`, {
    method: "GET",
  });
}

export type CreateCommentRequest = { content: string };
export type CreateCommentResponse = { message: string; comment_id: number; commentCount: number };
export function createCommentApi(postId: number, body: CreateCommentRequest) {
  return apiFetch<CreateCommentResponse>(`/api/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// AI Assistant APIs
export type AskQuestionRequest = { question: string };
export type RelevantDoc = {
  doc_id: string;
  question_vi: string;
  answer_vi: string;
  source: string;
};
export type AskQuestionResponse = {
  success: boolean;
  data: {
    question: string;
    answer: string;
    relevantDocs: RelevantDoc[];
    confidence: string;
    timestamp: string;
  };
};
export function askQuestionApi(body: AskQuestionRequest) {
  return apiFetch<AskQuestionResponse>("/api/ai-assistant/ask", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true, // Allow unauthenticated users to ask questions
  });
}

export type SuggestionsResponse = {
  success: boolean;
  data: {
    suggestions: string[];
  };
};
export function getSuggestionsApi(topic?: string, limit?: number) {
  const params = new URLSearchParams();
  if (topic) params.append("topic", topic);
  if (limit) params.append("limit", limit.toString());
  const query = params.toString() ? `?${params.toString()}` : "";
  
  return apiFetch<SuggestionsResponse>(`/api/ai-assistant/suggestions${query}`, {
    method: "GET",
    skipAuth: true,
  });
}

export type AIConversation = {
  _id: string;
  userId: string;
  question: string;
  answer: string;
  relevantDocs: RelevantDoc[];
  createdAt: string;
};
export type ConversationHistoryResponse = {
  success: boolean;
  data: {
    conversations: AIConversation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
};
export function getConversationHistoryApi(page: number = 1, limit: number = 20) {
  return apiFetch<ConversationHistoryResponse>(`/api/ai-assistant/history?page=${page}&limit=${limit}`, {
    method: "GET",
  });
}

export type StatisticsResponse = {
  success: boolean;
  data: {
    totalDocs: number;
    sources: string[];
    categories: Record<string, number>;
  };
};
export function getStatisticsApi() {
  return apiFetch<StatisticsResponse>("/api/ai-assistant/statistics", {
    method: "GET",
    skipAuth: true,
  });
}

export function deleteConversationApi(id: string) {
  return apiFetch<{ success: boolean; message: string }>(`/api/ai-assistant/history/${id}`, {
    method: "DELETE",
  });
}

