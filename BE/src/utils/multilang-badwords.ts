// Utility để kiểm tra từ cấm tiếng Việt và tiếng Anh
import viBadWords from "../../../vn-badwords/vi.json";
import enBadWords from "../../../vn-badwords/en.json";

export interface BadWordsResult {
  hasBadWords: boolean;
  cleanText: string;
  detectedWords: string[];
}

export function checkBadWords(text: string, language: 'vi' | 'en' | 'both' = 'both'): BadWordsResult {
  if (typeof text !== "string") {
    throw new Error("Text must be a string");
  }

  const detectedWords: string[] = [];
  let cleanText = text;

  // Chọn danh sách từ cấm theo ngôn ngữ
  let badWordsList: string[] = [];
  if (language === 'vi') {
    badWordsList = viBadWords;
  } else if (language === 'en') {
    badWordsList = enBadWords;
  } else {
    badWordsList = [...viBadWords, ...enBadWords];
  }

  // Normalize text để so sánh
  const normalizedText = text.toLowerCase().trim();

  // Kiểm tra từng từ cấm
  badWordsList.forEach(badWord => {
    const normalizedBadWord = badWord.toLowerCase();
    
    // Escape special regex characters
    const escapedWord = normalizedBadWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    let regex: RegExp;
    
    if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(normalizedBadWord)) {
      regex = new RegExp(escapedWord, 'gi');
    } else {
      regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
    }
    
    if (regex.test(text)) {
      detectedWords.push(badWord);
      cleanText = cleanText.replace(regex, '*'.repeat(badWord.length));
    }
  });

  return {
    hasBadWords: detectedWords.length > 0,
    cleanText,
    detectedWords
  };
}

export function validatePostContent(title: string, content: string, language: 'vi' | 'en' | 'both' = 'both') {
  const titleResult = checkBadWords(title, language);
  const contentResult = checkBadWords(content, language);

  return {
    isValid: !titleResult.hasBadWords && !contentResult.hasBadWords,
    title: titleResult,
    content: contentResult,
    allDetectedWords: [...titleResult.detectedWords, ...contentResult.detectedWords]
  };
}
