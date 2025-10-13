import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  Lightbulb, 
  Heart, 
  Activity,
  Brain,
  Stethoscope,
  Shield
} from "lucide-react";

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

const quickQuestions = [
  "Cách giảm đau đầu tự nhiên?",
  "Thực phẩm tốt cho tim mạch?",
  "Bài tập thể dục cho người mới bắt đầu?",
  "Cách cải thiện giấc ngủ?",
  "Dấu hiệu cần gặp bác sĩ?",
  "Cách giảm stress hiệu quả?"
];

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: 'Xin chào! Tôi là AI Assistant chuyên về sức khỏe. Tôi có thể giúp bạn tìm hiểu thông tin cơ bản về sức khỏe, đưa ra lời khuyên chăm sóc sức khỏe hàng ngày. Bạn có câu hỏi gì về sức khỏe không?',
      timestamp: '10:00'
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: 'Cảm ơn bạn đã đặt câu hỏi. Đây là thông tin tham khảo từ AI Assistant. Lưu ý: Thông tin này chỉ mang tính chất tham khảo và không thay thế cho lời khuyên của bác sĩ chuyên khoa. Nếu bạn có triệu chứng nghiêm trọng, hãy tham khảo ý kiến bác sĩ.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setInputMessage("");
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-500 rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            AI Tư vấn Sức khỏe
          </h1>
          <p className="text-gray-600">
            Hỗ trợ thông tin sức khỏe cơ bản 24/7
          </p>
        </div>

        {/* Warning */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                <p>AI Assistant chỉ cung cấp thông tin tham khảo về sức khỏe. Không thay thế cho chẩn đoán và điều trị y tế chuyên nghiệp. Trong trường hợp khẩn cấp, hãy liên hệ với cơ sở y tế gần nhất.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col border-blue-200">
              <CardHeader className="border-b border-blue-200">
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span>Trò chuyện với AI</span>
                </CardTitle>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={`${message.type === 'ai' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                          {message.type === 'ai' ? <Bot className="w-4 h-4" /> : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg p-3 ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
              
              {/* Input */}
              <div className="p-4 border-t border-blue-200">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Đặt câu hỏi về sức khỏe..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="min-h-[50px] resize-none border-blue-200 focus:border-blue-600"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white self-end"
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Questions */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  <span>Câu hỏi thường gặp</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto p-3 text-wrap border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Health Categories */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Chủ đề sức khỏe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-blue-50">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Tim mạch</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-blue-50">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Tâm lý</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-blue-50">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Thể dục</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-blue-50">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Khám sức khỏe</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;