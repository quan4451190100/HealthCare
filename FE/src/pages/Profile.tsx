import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getProfileApi, updateProfileApi, UserProfile } from "@/lib/api";
import { 
  User, 
  Settings, 
  Heart, 
  MessageSquare, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  Edit3,
  Camera,
  Award,
  TrendingUp,
  Loader2
} from "lucide-react";

const Profile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const data = await getProfileApi();
      setUserProfile(data);
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin người dùng. " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get first letter of name for avatar
  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Validate input
      if (!userProfile?.name.trim() || !userProfile?.email.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ tên và email",
          variant: "destructive",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userProfile.email)) {
        toast({
          title: "Lỗi",
          description: "Email không hợp lệ",
          variant: "destructive",
        });
        return;
      }

      const result = await updateProfileApi({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        address: userProfile.address,
      });

      // Update user info in localStorage
      const userInfo = {
        user_id: result.user.user_id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      };
      localStorage.setItem("user_info", JSON.stringify(userInfo));

      // Update local state
      setUserProfile(result.user);
      setIsEditing(false);

      toast({
        title: "Cập nhật thành công!",
        description: "Thông tin cá nhân đã được cập nhật.",
      });
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const userStats = [
    { label: "Bài viết", value: 24, icon: MessageSquare },
    { label: "Lượt thích", value: 156, icon: Heart },
    { label: "Điểm uy tín", value: 89, icon: Award },
    { label: "Hoạt động", value: "7 ngày", icon: TrendingUp }
  ];

  const recentPosts = [
    {
      id: 1,
      title: "Tips uống nước đúng cách",
      date: "2 ngày trước",
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      title: "Bài tập yoga buổi sáng",
      date: "5 ngày trước",
      likes: 31,
      comments: 12
    },
    {
      id: 3,
      title: "Chế độ ăn cho người làm việc văn phòng",
      date: "1 tuần trước",
      likes: 45,
      comments: 18
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                    {getInitials(userProfile?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-blue-600 mb-1">
                      {userProfile?.name}
                    </h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{userProfile?.email}</span>
                      </div>
                      {userProfile?.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{userProfile.phone}</span>
                        </div>
                      )}
                      {userProfile?.address && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{userProfile.address}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {userProfile?.created_at && 
                            `Tham gia từ tháng ${new Date(userProfile.created_at).getMonth() + 1}, ${new Date(userProfile.created_at).getFullYear()}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="mt-4 md:mt-0 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? "Hủy" : "Chỉnh sửa"}
                  </Button>
                </div>

                {/* User Badges */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {userProfile?.role === "admin" && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Quản trị viên
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {userStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-blue-200">
                <CardContent className="pt-6 text-center">
                  <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Bài viết</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
            <TabsTrigger value="activity">Hoạt động</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle>Bài viết gần đây</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-blue-600">{post.title}</h3>
                      <p className="text-sm text-gray-500">{post.date}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input
                      id="name"
                      value={userProfile?.name || ""}
                      onChange={(e) => setUserProfile(userProfile ? { ...userProfile, name: e.target.value } : null)}
                      disabled={!isEditing}
                      className="border-blue-200 focus:border-blue-600"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile?.email || ""}
                      onChange={(e) => setUserProfile(userProfile ? { ...userProfile, email: e.target.value } : null)}
                      disabled={!isEditing}
                      className="border-blue-200 focus:border-blue-600"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={userProfile?.phone || ""}
                      onChange={(e) => setUserProfile(userProfile ? { ...userProfile, phone: e.target.value } : null)}
                      disabled={!isEditing}
                      className="border-blue-200 focus:border-blue-600"
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={userProfile?.address || ""}
                      onChange={(e) => setUserProfile(userProfile ? { ...userProfile, address: e.target.value } : null)}
                      disabled={!isEditing}
                      className="border-blue-200 focus:border-blue-600"
                      placeholder=""
                    />
                  </div>
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-blue-200 text-blue-600 hover:bg-blue-50" 
                      onClick={async () => {
                        setIsEditing(false);
                        // Reload original values from API
                        await fetchProfile();
                      }}
                      disabled={saving}
                    >
                      Hủy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-sm">Đã thích bài viết "Tips giảm stress hiệu quả"</span>
                    <span className="text-xs text-gray-500 ml-auto">2 giờ trước</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Đã bình luận bài viết "Chế độ ăn healthy"</span>
                    <span className="text-xs text-gray-500 ml-auto">5 giờ trước</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Đã cập nhật thông tin hồ sơ</span>
                    <span className="text-xs text-gray-500 ml-auto">1 ngày trước</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      )}
    </div>
  );
};

export default Profile;