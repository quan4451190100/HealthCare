import * as fs from 'fs';
import * as path from 'path';

interface MedicalDoc {
  question_en: string;
  answer_en: string;
  question_vi: string;
  answer_vi: string;
  doc_id: string;
  qid: string;
  pid: string;
  source: string;
}

class AIAssistantService {
  private medicalData: MedicalDoc[] = [];
  
  private synonyms: { [key: string]: string[] } = {
    'dau': ['dau don', 'dau dau', 'nhuc', 'moi'],
    'benh': ['trieu chung', 'benh tat', 'chung', 'roi loan'],
    'tieu duong': ['duong huyet', 'tieu duong', 'dai thao duong'],
    'tim': ['tim mach', 'trai tim', 'te bao tim'],
    'huyet ap': ['huyet ap', 'ap huyet', 'hat huyet'],
    'ung thu': ['ung thu', 'cancer', 'ung', 'khoi u'],
    'giam': ['giam dau', 'ha', 'tru', 'bot'],
    'cach': ['phuong phap', 'cach thuc', 'bien phap'],
    'dieu tri': ['chua tri', 'tri lieu', 'chua benh', 'dieu tri'],
    'chuan doan': ['phat hien', 'xac dinh', 'kham'],
    'phong ngua': ['phong tranh', 'tranh', 'ngan ngua'],
    'cam': ['cam lanh', 'cam cum', 'viem duong ho hap', 'cum'],
    'lau': ['bao lau', 'keo dai', 'thoi gian'],
    'ho': ['ho khan', 'ho dam', 'ho lau ngay']
  };

  constructor() {
    this.loadMedicalData();
  }

  private loadMedicalData() {
    const dataPath = path.join(__dirname, '../../../../medquad_vi_translated_all_merged_with_cold.json');
    console.log(`Attempting to load from: ${dataPath}`);
    
    if (!fs.existsSync(dataPath)) {
      console.error('Error loading medical data: file not found');
      console.error('Current __dirname:', __dirname);
      console.error('Make sure medquad_vi_translated_all_merged_with_cold.json is at project root');
      this.medicalData = [];
      return;
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    
    if (!rawData) {
      console.error('Error loading medical data: empty file');
      this.medicalData = [];
      return;
    }
    
    const parsedData = JSON.parse(rawData);
    
    if (!parsedData || !Array.isArray(parsedData)) {
      console.error('Error loading medical data: invalid JSON format');
      this.medicalData = [];
      return;
    }
    
    this.medicalData = parsedData;
    console.log(`Loaded ${this.medicalData.length} medical documents`);
  }

  private removeDiacritics(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[?.,!;:()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private tokenize(text: string): string[] {
    const normalized = this.removeDiacritics(text);
    const stopWords = ['cua', 'la', 'va', 'khong', 'nhu', 'thi', 'hay', 'ma', 'nao', 'mot', 'duoc', 'den', 'trong', 'theo', 'neu', 've', 'voi', 'cho', 'boi', 'tren', 'sau', 'truoc'];
    
    const words = normalized
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.includes(word));
  
    const expandedWords = [...words];
    for (const word of words) {
      for (const [key, synonymList] of Object.entries(this.synonyms)) {
        const keyNormalized = this.removeDiacritics(key);
        
        if (word === keyNormalized || 
            word.includes(keyNormalized) || 
            keyNormalized.includes(word)) {
          synonymList.forEach(syn => {
            const synWords = syn.split(/\s+/);
            synWords.forEach(synWord => {
              const synNormalized = this.removeDiacritics(synWord);
              if (synNormalized.length > 1 && !expandedWords.includes(synNormalized)) {
                expandedWords.push(synNormalized);
              }
            });
          });
        }
      }
    }
    
    return expandedWords;
  }

  private calculateSimilarity(question: string, text: string): number {
    const questionWords = this.tokenize(question);
    const textWords = this.tokenize(text);
    
    if (questionWords.length === 0) return 0;
    
    const questionNormalized = this.removeDiacritics(question);
    const textNormalized = this.removeDiacritics(text);
    
    const penaltyKeywords = ['trieu chung', 'chan doan', 'dieu tri', 'cach chua', 'nguyen nhan', 'phong ngua'];
    let penalty = 1.0;
    
    for (const keyword of penaltyKeywords) {
      const questionHasKeyword = questionNormalized.includes(keyword);
      const textHasKeyword = textNormalized.includes(keyword);
      
      if (textHasKeyword && !questionHasKeyword) {
        penalty *= 0.5; 
      }
    }
    
    const questionPhrases = this.extractPhrases(questionNormalized);
    let phraseMatches = 0;
    for (const phrase of questionPhrases) {
      if (textNormalized.includes(phrase)) {
        phraseMatches++;
      }
    }
    
    const phraseScore = questionPhrases.length > 0 
      ? (phraseMatches / questionPhrases.length) * 2.0 
      : 0;
    
    let exactMatches = 0;
    let partialMatches = 0;
    
    for (const qWord of questionWords) {
      if (textWords.includes(qWord)) {
        exactMatches++;
      } else {
        const hasPartial = textWords.some(tWord => 
          (qWord.length > 2 && tWord.includes(qWord)) || 
          (tWord.length > 2 && qWord.includes(tWord))
        );
        if (hasPartial) {
          partialMatches++;
        }
      }
    }
    
    const wordScore = (exactMatches * 1.0 + partialMatches * 0.5) / questionWords.length;
    const baseScore = Math.max(phraseScore, wordScore);
    return baseScore * penalty;
  }
  
  private extractPhrases(text: string): string[] {
    const words = text.split(/\s+/).filter(w => w.length > 1);
    const phrases: string[] = [];
    
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
    }
    
    for (let i = 0; i < words.length - 2; i++) {
      phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
    
    return phrases;
  }

  public searchRelevantDocs(question: string, limit: number = 5): MedicalDoc[] {
    console.log(`\nSearching for: "${question}"`);
    console.log(`Total documents: ${this.medicalData.length}`);
    
    if (this.medicalData.length === 0) {
      console.log(`ERROR: No data loaded!`);
      return [];
    }
    
    const questionTokens = this.tokenize(question);
    console.log(`Tokens: [${questionTokens.join(', ')}]`);
    
    const scoredDocs = this.medicalData.map(doc => {
      const questionScore = this.calculateSimilarity(question, doc.question_vi) * 2.0;
      const answerScore = this.calculateSimilarity(question, doc.answer_vi) * 0.3;
      
      return {
        doc,
        score: questionScore + answerScore
      };
    });
    const results = scoredDocs
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score > 0.1); 
    
    console.log(`Found ${results.length} results`);
    if (results.length > 0) {
      console.log(`Top 3 matches:`);
      results.slice(0, 3).forEach((r, i) => {
        console.log(`   ${i + 1}. [${r.score.toFixed(3)}] ${r.doc.question_vi.substring(0, 70)}...`);
      });
    } else {
      console.log(`No matches found with score > 0.1`);
      const top5 = scoredDocs.sort((a, b) => b.score - a.score).slice(0, 5);
      console.log(`Top 5 anyway:`);
      top5.forEach((r, i) => {
        console.log(`   ${i + 1}. [${r.score.toFixed(4)}] ${r.doc.question_vi.substring(0, 60)}...`);
      });
    }
    
    return results
      .slice(0, limit)
      .map(item => item.doc);
  }

  public generateAnswer(question: string): {
    answer: string;
    relevantDocs: any[];
    confidence: string;
  } {
    const relevantDocs = this.searchRelevantDocs(question, 1);

    if (relevantDocs.length === 0) {
      return {
        answer: 'Xin lỗi, tôi không tìm thấy thông tin phù hợp với câu hỏi của bạn. \n\nGợi ý:\n- Hãy thử diễn đạt câu hỏi khác đi\n- Sử dụng các từ khóa y tế thông dụng\n- Đặt câu hỏi cụ thể hơn\n\nVí dụ: "Triệu chứng của bệnh tiểu đường?", "Cách điều trị cao huyết áp?"\n\nNếu cần tư vấn cụ thể, vui lòng tham khảo ý kiến bác sĩ chuyên khoa.',
        relevantDocs: [],
        confidence: 'low'
      };
    }

    const bestDoc = relevantDocs[0];
    if (!bestDoc) {
      return {
        answer: 'Xin lỗi, không tìm thấy thông tin phù hợp.',
        relevantDocs: [],
        confidence: 'low'
      };
    }
    
    const answer = `${bestDoc.answer_vi}\n\n---\n**Lưu ý:** Thông tin trên chỉ mang tính tham khảo. Hãy tham khảo ý kiến bác sĩ để được chẩn đoán và điều trị chính xác.`;

    const confidence = 'high';

    return {
      answer,
      relevantDocs: relevantDocs.map(doc => ({
        doc_id: doc.doc_id,
        question_vi: doc.question_vi,
        answer_vi: doc.answer_vi,
        source: doc.source
      })),
      confidence
    };
  }
  public getSuggestedQuestions(topic?: string, limit: number = 6): string[] {
    let filteredDocs = this.medicalData;

    if (topic) {
      filteredDocs = this.medicalData.filter(doc => 
        doc.question_vi.toLowerCase().includes(topic.toLowerCase()) ||
        doc.answer_vi.toLowerCase().includes(topic.toLowerCase())
      );
    }
    const shuffled = filteredDocs.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit).map(doc => doc.question_vi);
  }

  public getStatistics() {
    const sources = new Set(this.medicalData.map(doc => doc.source));
    
    return {
      totalDocs: this.medicalData.length,
      sources: Array.from(sources),
      categories: this.getCategoryStats()
    };
  }

  private getCategoryStats() {
    const keywords = {
      'Tim mạch': ['tim', 'mạch máu', 'huyết áp', 'cholesterol'],
      'Ung thư': ['ung thư', 'cancer', 'lymphoma', 'leukemia'],
      'Tiểu đường': ['tiểu đường', 'đường huyết', 'insulin'],
      'Thần kinh': ['thần kinh', 'não', 'đau đầu'],
      'Xương khớp': ['xương', 'khớp', 'viêm khớp'],
      'Hô hấp': ['phổi', 'hô hấp', 'hen', 'ho'],
      'Tiêu hóa': ['dạ dày', 'ruột', 'gan', 'tiêu hóa']
    };

    const stats: any = {};
    
    for (const [category, words] of Object.entries(keywords)) {
      stats[category] = this.medicalData.filter(doc => 
        words.some(word => 
          doc.question_vi.toLowerCase().includes(word) || 
          doc.answer_vi.toLowerCase().includes(word)
        )
      ).length;
    }

    return stats;
  }
}

export default new AIAssistantService();
