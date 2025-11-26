import { Request, Response } from 'express';
import aiAssistantService from './ai-assistant.service';
import AIConversationModel from './ai-assistant.model';

class AIAssistantController {
  public async askQuestion(req: Request, res: Response) {
    const { question } = req.body;
    const userId = (req as any).user?.id;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Câu hỏi không hợp lệ'
      });
    }

    const result = aiAssistantService.generateAnswer(question);
    
    if (!result) {
      console.error('Error in generateAnswer');
      return res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xử lý câu hỏi'
      });
    }

    if (userId) {
      const saved = await AIConversationModel.create({
        user_id: userId,
        question,
        answer: result.answer,
        relevant_docs: JSON.stringify(result.relevantDocs)
      });
      
      if (!saved) {
        console.error('Error saving conversation');
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        question,
        answer: result.answer,
        relevantDocs: result.relevantDocs,
        confidence: result.confidence,
        timestamp: new Date().toISOString()
      }
    });
  }

  public async getSuggestions(req: Request, res: Response) {
    const { topic, limit } = req.query;
    const suggestions = aiAssistantService.getSuggestedQuestions(
      topic as string,
      limit ? parseInt(limit as string) : 6
    );

    if (!suggestions) {
      console.error('Error in getSuggestions');
      return res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy câu hỏi gợi ý'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        suggestions
      }
    });
  }

  public async getHistory(req: Request, res: Response) {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để xem lịch sử'
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const conversations = await AIConversationModel.findByUserId(userId, limitNum, offset);
    const total = await AIConversationModel.countByUserId(userId);

    if (!conversations || total === undefined) {
      console.error('Error in getHistory');
      return res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy lịch sử'
      });
    }

    const parsedConversations = conversations.map(conv => ({
      ...conv,
      relevant_docs: typeof conv.relevant_docs === 'string' 
        ? JSON.parse(conv.relevant_docs) 
        : conv.relevant_docs
    }));

    return res.status(200).json({
      success: true,
      data: {
        conversations: parsedConversations,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  }

  public async getStatistics(req: Request, res: Response) {
    const stats = aiAssistantService.getStatistics();

    if (!stats) {
      console.error('Error in getStatistics');
      return res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thống kê'
      });
    }

    return res.status(200).json({
      success: true,
      data: stats
    });
  }

  public async deleteConversation(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }

    const deleted = await AIConversationModel.deleteById(parseInt(id), userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc hội thoại'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã xóa cuộc hội thoại'
    });
  }
}

export default new AIAssistantController();
