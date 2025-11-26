import db from '../../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface AIConversation {
  id?: number;
  user_id: number;
  question: string;
  answer: string;
  relevant_docs: string;
  created_at?: Date;
}

class AIConversationModel {
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        relevant_docs JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )
    `;
    
    const result = await db.query(query);
    
    if (!result) {
      console.error('Error creating ai_conversations table');
      return;
    }
    
    console.log('AI Conversations table created or already exists');
  }

  async create(conversation: AIConversation): Promise<number> {
    const query = `
      INSERT INTO ai_conversations (user_id, question, answer, relevant_docs)
      VALUES (?, ?, ?, ?)
    `;
    
    const relevantDocsJson = JSON.stringify(conversation.relevant_docs || []);
    const [result] = await db.query<ResultSetHeader>(query, [
      conversation.user_id,
      conversation.question,
      conversation.answer,
      relevantDocsJson
    ]);
    
    return result.insertId;
  }

  async findByUserId(userId: number, limit: number = 20, offset: number = 0): Promise<AIConversation[]> {
    const query = `
      SELECT * FROM ai_conversations
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await db.query<RowDataPacket[]>(query, [userId, limit, offset]);
    return rows as AIConversation[];
  }

  async countByUserId(userId: number): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ai_conversations WHERE user_id = ?`;
    const [rows] = await db.query<RowDataPacket[]>(query, [userId]);
    return rows[0]?.count || 0;
  }

  async deleteById(id: number, userId: number): Promise<boolean> {
    const query = `DELETE FROM ai_conversations WHERE id = ? AND user_id = ?`;
    const [result] = await db.query<ResultSetHeader>(query, [id, userId]);
    return result.affectedRows > 0;
  }
}

export default new AIConversationModel();
