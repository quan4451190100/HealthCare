import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Plus,
  Search,
  Filter,
  TrendingUp,
  Send
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  checkBadWordsApi, 
  createPostApi,
  likePostApi,
  unlikePostApi,
  getCommentsApi,
  createCommentApi,
  type Comment
} from "@/lib/api";

const Community = () => {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLike = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.isLiked) {
        await unlikePostApi(postId);
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, likes: p.likes - 1, isLiked: false }
            : p
        ));
      } else {
        await likePostApi(postId);
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, likes: p.likes + 1, isLiked: true }
            : p
        ));
      }
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err?.message || "Không thể thực hiện thao tác",
        open: true,
      });
    }
  };

  const handleToggleComments = async (postId: number) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      // Load comments nếu chưa có
      if (!comments[postId]) {
        try {
          const postComments = await getCommentsApi(postId);
          setComments({ ...comments, [postId]: postComments });
        } catch (err: any) {
          toast({
            title: "Lỗi",
            description: "Không thể tải comments",
            open: true,
          });
        }
      }
    }
  };

  const handleSubmitComment = async (postId: number) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    try {
      await createCommentApi(postId, { content });
      
      // Reload comments
      const postComments = await getCommentsApi(postId);
      setComments({ ...comments, [postId]: postComments });
      
      // Update comment count
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, comments: postComments.length }
          : p
      ));

      // Clear input
      setNewComment({ ...newComment, [postId]: "" });

      toast({
        title: "Thành công",
        description: "Đã thêm comment",
        open: true,
      });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err?.message || "Không thể thêm comment",
        open: true,
      });
    }
  };

  const handleShare = (postId: number) => {
    // Copy link to clipboard
    const url = `${window.location.origin}/community/post/${postId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Đã sao chép liên kết",
      description: "Link bài viết đã được sao chép vào clipboard",
      open: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Cộng đồng Sức khỏe
          </h1>
          <p className="text-gray-600">
            Chia sẻ kinh nghiệm, đặt câu hỏi và kết nối với cộng đồng
          </p>
        </div>

        {/* Create Post */}
        <Card className="mb-6 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 border-2 border-blue-200">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold text-lg">
                  {(() => {
                    const userInfo = localStorage.getItem("user_info");
                    if (userInfo) {
                      const user = JSON.parse(userInfo);
                      return user.name?.charAt(0).toUpperCase() || "U";
                    }
                    return "U";
                  })()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {(() => {
                    const userInfo = localStorage.getItem("user_info");
                    if (userInfo) {
                      const user = JSON.parse(userInfo);
                      return user.name || "Người dùng";
                    }
                    return "Bạn";
                  })()}
                </h3>
                <p className="text-sm text-gray-500">Chia sẻ với cộng đồng</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Bạn đang nghĩ gì về sức khỏe? Hãy chia sẻ câu hỏi, kinh nghiệm hoặc lời khuyên của bạn..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[120px] border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none rounded-lg text-base"
            />
            
            {/* Character count and tags */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="secondary" 
                  className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors"
                >
                  Sức khỏe
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 cursor-pointer transition-colors"
                >
                  Tư vấn
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 cursor-pointer transition-colors"
                >
                  Thể dục
                </Badge>
              </div>
              <span className={`text-sm ${newPost.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                {newPost.length}/1000
              </span>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t border-blue-100 flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-100"
              onClick={() => setNewPost("")}
              disabled={!newPost.trim()}
            >
              Hủy
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
              disabled={!newPost.trim() || newPost.length > 1000}
              onClick={async () => {
                const text = newPost.trim();
                if (!text) return;

                // Kiểm tra xem người dùng đã đăng nhập chưa TRƯỚC KHI gọi API
                const token = localStorage.getItem("auth_token");
                if (!token) {
                  toast({
                    title: "Chưa đăng nhập",
                    description: "Bạn cần đăng nhập để đăng bài viết.",
                    open: true,
                  });
                  setTimeout(() => {
                    navigate("/login");
                  }, 1500);
                  return;
                }

                try {
                  // Kiểm tra từ cấm trước khi gửi (không cần auth)
                  const res = await checkBadWordsApi({ text, language: "both" });

                  if (res.hasBadWords) {
                    toast({
                      title: "Nội dung không hợp lệ",
                      description: `Bài viết chứa từ ngữ không phù hợp: ${res.detectedWords.join(", ")}. Vui lòng chỉnh sửa.`,
                      open: true,
                    });
                    return;
                  }

                  // Nếu sạch và đã đăng nhập, gọi API tạo bài viết
                  const created = await createPostApi({ title: text.slice(0, 50), content: text });

                  // Lấy thông tin user từ localStorage
                  const userInfo = localStorage.getItem("user_info");
                  let userName = "Bạn";
                  let userInitial = "B";
                  
                  if (userInfo) {
                    try {
                      const user = JSON.parse(userInfo);
                      userName = user.name || "Bạn";
                      userInitial = user.name?.charAt(0).toUpperCase() || "B";
                    } catch (e) {
                      console.error("Error parsing user info:", e);
                    }
                  }

                  
                  setPosts((p) => [
                    {
                      id: created.post_id || Date.now(),
                      author: userName,
                      avatar: "", 
                      time: "Vừa xong",
                      content: created.content,
                      tags: ["sức-khỏe"],
                      likes: 0,
                      comments: 0,
                      isLiked: false,
                    },
                    ...p,
                  ]);

                  setNewPost("");

                  toast({
                    title: "Đăng bài thành công!",
                    description: "Bài viết của bạn đã được chia sẻ với cộng đồng.",
                    open: true,
                  });
                } catch (err: any) {
                  console.error(err);
                  const errorMessage = err?.message || "Không thể kết nối tới server";
                  
                  // Xử lý lỗi xác thực - token hết hạn hoặc không hợp lệ
                  if (errorMessage.includes("token") || 
                      errorMessage.includes("Unauthorized") || 
                      errorMessage.includes("Forbidden") ||
                      errorMessage.includes("expired")) {
                    
                    // Token đã bị xóa trong apiFetch, thông báo và chuyển đến trang login
                    toast({
                      title: "Phiên đăng nhập đã hết hạn",
                      description: "Vui lòng đăng nhập lại để tiếp tục.",
                      open: true,
                    });
                    
                    // Chuyển hướng đến trang login sau 2 giây
                    setTimeout(() => {
                      navigate("/login");
                    }, 2000);
                  } else {
                    toast({
                      title: "Lỗi khi đăng bài",
                      description: errorMessage,
                      open: true,
                    });
                  }
                }
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              <span className="font-semibold">Đăng bài</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Filters & Search */}
        <Card className="mb-6 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Tìm kiếm bài viết, chủ đề..." 
                    className="pl-10 border-blue-200 focus:border-blue-600"
                  />
                </div>
              </div>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </Button>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <TrendingUp className="w-4 h-4 mr-2" />
                Thịnh hành
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="border-blue-200 shadow-md hover:shadow-xl transition-all duration-300 hover:border-blue-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 border-2 border-blue-100">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold">
                        {post.author.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        {post.author}
                        {post.author.includes("Dr.") || post.author.includes("BS.") ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-xs">
                            Chuyên gia
                          </Badge>
                        ) : null}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        {post.time}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-base">
                  {post.content}
                </p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        # {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col items-stretch pt-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`${
                        post.isLiked 
                          ? "text-red-500 hover:text-red-600 bg-red-50" 
                          : "text-gray-600 hover:text-red-500 hover:bg-red-50"
                      } transition-all duration-200 rounded-full px-4`}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                      <span className="font-medium">{post.likes}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`${
                        expandedPost === post.id
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      } transition-all duration-200 rounded-full px-4`}
                      onClick={() => handleToggleComments(post.id)}
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      <span className="font-medium">{post.comments}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200 rounded-full px-4"
                      onClick={() => handleShare(post.id)}
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      <span className="font-medium">Chia sẻ</span>
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedPost === post.id && (
                  <div className="mt-4 border-t border-blue-100 pt-4 space-y-4 bg-white rounded-lg">
                    {/* Comment Input */}
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10 border-2 border-blue-100">
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 text-sm font-semibold">
                          {(() => {
                            const userInfo = localStorage.getItem("user_info");
                            if (userInfo) {
                              const user = JSON.parse(userInfo);
                              return user.name?.charAt(0).toUpperCase() || "U";
                            }
                            return "U";
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Viết bình luận của bạn..."
                          value={newComment[post.id] || ""}
                          onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                          className="flex-1 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full px-4"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitComment(post.id);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSubmitComment(post.id)}
                          disabled={!newComment[post.id]?.trim()}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full px-5 shadow-md hover:shadow-lg transition-all"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Gửi
                        </Button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {comments[post.id]?.length > 0 ? (
                        comments[post.id].map((comment) => (
                          <div key={comment.comment_id} className="flex gap-3 group">
                            <Avatar className="w-9 h-9 border-2 border-gray-100">
                              <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 text-sm font-semibold">
                                {comment.author_name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-2xl p-3 hover:bg-gray-100 transition-colors">
                                <p className="font-semibold text-sm text-gray-800">
                                  {comment.author_name}
                                </p>
                                <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                  {comment.content}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 mt-1 ml-3">
                                <p className="text-xs text-gray-500">
                                  {new Date(comment.created_at).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">Chưa có bình luận nào</p>
                          <p className="text-gray-400 text-xs mt-1">Hãy là người đầu tiên bình luận!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;