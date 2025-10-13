// Test script để kiểm tra badwords
const { checkBadWords } = require('./src/utils/multilang-badwords.ts');

const testCases = [
  "địt",
  "Địt mẹ",
  "đm",
  "fuck",
  "con chó",
  "hello world", // clean
  "địt con",
  "dmm",
  "cặc"
];

console.log("=== TESTING BADWORDS DETECTION ===\n");

testCases.forEach(text => {
  try {
    const result = checkBadWords(text, 'both');
    console.log(`Text: "${text}"`);
    console.log(`  Has badwords: ${result.hasBadWords}`);
    console.log(`  Detected: [${result.detectedWords.join(', ')}]`);
    console.log(`  Clean text: "${result.cleanText}"`);
    console.log('---');
  } catch (err) {
    console.error(`Error testing "${text}":`, err.message);
  }
});
