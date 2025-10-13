import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageSquare, 
  Bot, 
  User, 
  Home, 
  Menu, 
  X 
} from "lucide-react";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token");
      setIsAuthenticated(!!token);
    } catch {
      setIsAuthenticated(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("auth_token");
    } catch {}
    setIsAuthenticated(false);
    navigate("/login");
  };

  const navigation = [
    { name: "Trang chủ", href: "/", icon: Home },
    { name: "Cộng đồng", href: "/community", icon: MessageSquare },
    { name: "AI Tư vấn", href: "/ai-assistant", icon: Bot },
    { name: "Hồ sơ", href: "/profile", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600">HealthCare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-blue-600 bg-blue-100"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white" size="sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
                <Avatar className="w-8 h-8 border-2 border-blue-200 cursor-pointer hover:border-blue-400 transition-colors">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold">
                    {(() => {
                      try {
                        const userInfo = localStorage.getItem("user_info");
                        if (userInfo) {
                          const user = JSON.parse(userInfo);
                          return user.name?.charAt(0).toUpperCase() || "U";
                        }
                      } catch (e) {
                        console.error("Error parsing user info:", e);
                      }
                      return "U";
                    })()}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-28 justify-center border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white" size="sm" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button className="w-28 justify-center bg-blue-600 hover:bg-blue-700 text-white" size="sm" asChild>
                  <Link to="/register">Đăng ký</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-200">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.href)
                        ? "text-blue-600 bg-blue-100"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-4 space-y-2">
                {isAuthenticated ? (
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white" size="sm" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                    Đăng xuất
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white" size="sm" asChild>
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập</Link>
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm" asChild>
                      <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>Đăng ký</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};