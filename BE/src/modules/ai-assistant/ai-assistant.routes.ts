import { Router } from 'express';
import aiAssistantController from './ai-assistant.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

router.post('/ask', aiAssistantController.askQuestion);
router.get('/suggestions', aiAssistantController.getSuggestions);
router.get('/statistics', aiAssistantController.getStatistics);

router.get('/history', authenticateToken, aiAssistantController.getHistory);
router.delete('/history/:id', authenticateToken, aiAssistantController.deleteConversation);

export default router;
