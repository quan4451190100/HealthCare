import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  MessageSquare, 
  Bot, 
  Users, 
  Shield, 
  Clock,
  Star,
  ChevronRight,
  Activity,
  Award
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Cộng đồng sức khỏe",
      description: "Kết nối và chia sẻ kinh nghiệm với hàng ngàn thành viên"
    },
    {
      icon: Bot,
      title: "AI Tư vấn 24/7",
      description: "Nhận lời khuyên sức khỏe từ AI được đào tạo bởi chuyên gia"
    },
    {
      icon: Shield,
      title: "Thông tin đáng tin cậy",
      description: "Nội dung được kiểm duyệt bởi các chuyên gia y tế"
    },
    {
      icon: Clock,
      title: "Hỗ trợ 24/7",
      description: "Luôn sẵn sàng giải đáp thắc mắc về sức khỏe"
    }
  ];

  const stats = [
    { number: "10K+", label: "Thành viên" },
    { number: "50K+", label: "Câu hỏi đã giải đáp" },
    { number: "100+", label: "Chuyên gia tham gia" },
    { number: "24/7", label: "Hỗ trợ online" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-500 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-blue-600 mb-6">
            Cộng đồng <span className="text-green-500">Sức khỏe</span> 
            <br />Thông minh
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Nền tảng kết nối cộng đồng với AI hỗ trợ tư vấn sức khỏe. 
            Chia sẻ kinh nghiệm, đặt câu hỏi và nhận lời khuyên từ chuyên gia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex-1 sm:flex-none sm:min-w-[180px]" 
              size="lg" 
              asChild
            >
              <Link to="/register" className="flex items-center justify-center">
                Đăng ký miễn phí
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex-1 sm:flex-none sm:min-w-[180px]" 
              size="lg" 
              asChild
            >
              <Link to="/community" className="flex items-center justify-center">
                Khám phá cộng đồng
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-4">
              Tại sao chọn HealthCare?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chúng tôi kết hợp sức mạnh của cộng đồng với công nghệ AI tiên tiến
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-blue-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-blue-600">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bắt đầu hành trình sức khỏe của bạn
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Tham gia cộng đồng hàng ngàn người quan tâm đến sức khỏe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Button 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors flex-1 sm:flex-none sm:min-w-[180px]" 
              size="lg" 
              asChild
            >
              <Link to="/register" className="flex items-center justify-center">
                Đăng ký miễn phí
              </Link>
            </Button>
            <Button 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-medium transition-colors flex-1 sm:flex-none sm:min-w-[180px]" 
              size="lg" 
              asChild
            >
              <Link to="/ai-assistant" className="flex items-center justify-center">
                Thử AI Assistant
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-4">
              Cảm nhận từ cộng đồng
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Chị Mai Lan",
                role: "Thành viên từ 2024",
                content: "Cộng đồng rất hữu ích, tôi đã học được nhiều cách chăm sóc sức khỏe từ các thành viên khác.",
                rating: 5
              },
              {
                name: "Anh Minh Tuấn",
                role: "Người dùng tích cực",
                content: "AI Assistant rất thông minh, đưa ra lời khuyên chính xác và dễ hiểu về các vấn đề sức khỏe.",
                rating: 5
              },
              {
                name: "Cô Thanh Hương",
                role: "Chuyên gia dinh dưỡng",
                content: "Nền tảng tuyệt vời để chia sẻ kiến thức và kết nối với những người quan tâm đến sức khỏe.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-600">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;