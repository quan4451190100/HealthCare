import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Lấy token từ URL query parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const name = params.get("name");
    const error = params.get("error");

    if (error) {
      // Xử lý lỗi
      let errorMessage = "Đăng nhập thất bại";
      
      switch (error) {
        case "auth_failed":
          errorMessage = "Xác thực thất bại";
          break;
        case "user_not_found":
          errorMessage = "Không tìm thấy người dùng";
          break;
        case "google_failed":
          errorMessage = "Đăng nhập Google thất bại";
          break;
        case "facebook_failed":
          errorMessage = "Đăng nhập Facebook thất bại";
          break;
        case "server_error":
          errorMessage = "Lỗi server";
          break;
      }

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });

      // Redirect về trang login sau 2 giây
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    if (token) {
      // Lưu token vào localStorage
      localStorage.setItem("auth_token", token);

      toast({
        title: "Đăng nhập thành công!",
        description: `Chào mừng ${name || "bạn"}!`,
      });

      // Redirect về trang chủ
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } else {
      // Không có token - redirect về login
      navigate("/login");
    }
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
