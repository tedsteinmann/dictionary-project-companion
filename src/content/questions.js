import { importedQuestions } from './imported-questions.js';
import { lessons } from './lessons.js';

// The source records remain untouched. Adaptations belong in this separate layer.
const beginnerIds = new Set([1, 2, 5, 10, 11, 12, 13, 14, 15, 16, 21, 25, 28, 29, 37, 39, 42, 77, 78, 79, 82, 85, 86, 91, 92]);
const needsReview = new Set([4, 22]);
const guideExamples = { 5: ['flammable', 'fluster'], 6: ['modern', 'moratorium'] };
// Authored distractors, never spelling variants or automatically generated facts.
const distractors = {
  1: ['pillow'], 2: ['monster', 'month'], 3: ['snail', 'snake'], 5: ['forest'], 6: ['mirror'],
  7: ['2', '4'], 8: ['29%', '50%'], 9: ['Bergy Bit', 'Large'],
  10: ['meat', 'rocks'], 11: ['plants', 'rocks'], 12: ['1', '3'],
  16: ['rocks', 'stars'], 17: ['plants', 'fish'],
  19: ['tail', 'ears'], 20: ['feathers', 'scales'], 21: ['horns', 'antlers'],
  23: ['South America', 'Australia'], 24: ['fish', 'reptile'],
  25: ['job', 'lesson'], 26: ['freeze', 'sleep'], 27: ['place', 'plant'], 28: ['crawl', 'roll'],
  29: ['running', 'eating'], 30: ['stomach', 'tongue'], 32: ['agrees', 'repeats'],
  33: ['2', '4'], 36: ['mountains', 'rivers'], 37: ['mountains', 'desert'], 38: ['Moon', 'Sun'],
  40: ['1', '3'], 42: ['2', '3'], 43: ['1', '26'], 44: ['16', '32'],
  46: ['Virginia', 'New York'], 48: ['measles', 'influenza'], 49: ['prisoners of war', 'indentured servants'],
  50: ['10', '100'], 51: ['slavery in only one state', 'the right to vote'],
  52: ['visitors', 'ambassadors'], 53: ['visitors', 'members of Congress'], 54: ['16', '21'],
  55: ['science', 'sports'], 56: ['flags', 'land'], 57: ['We Are Here', 'For Our Country'],
  58: ['1776', '1865'], 59: ['Rose', 'Sunflower'], 60: ['Miami', 'Orlando'], 61: ['Fargo', 'Pierre'],
  62: ['1787', '1812'], 63: ['June', 'August'], 64: ['Wealth', 'Victory'], 65: ['famous', 'wealthy'],
  68: ['Rio de Janeiro', 'São Paulo'], 69: ['Brazzaville', 'Nairobi'], 70: ['Toronto', 'Vancouver'],
  71: ['Rome', 'Madrid'], 72: ['Alexandria', 'Luxor'], 73: ['Nairobi', 'Cairo'],
  74: ['Milan', 'Venice'], 75: ['Guadalajara', 'Cancún'], 76: ['Lima', 'Santiago'],
  77: ['silver', 'iron'], 78: ['gold', 'silver'], 79: ['gold', 'iron'],
  80: ['Martha Washington', 'Abigail Adams'], 82: ['9', '12'], 84: ['100', '1,000'],
  85: ['Earth', 'Mars'], 86: ['Venus', 'Mars'], 87: ['Venus', 'Jupiter'],
  88: ['12', '18'], 89: ['heart', 'skin'], 99: ['rain', 'snow']
};

function teachingTip(question) {
  if (question.dictionarySkill === 'alphabetical-order') return 'Compare the words from left to right. When letters match, keep going until the letters are different.';
  if (question.dictionarySkill === 'guide-words') return 'Guide words show the first and last entries on a page. Compare the word with both guide words in A–Z order.';
  if (question.dictionarySkill === 'pronunciation') return 'Look beside the headword for its pronunciation. The key near the front of your dictionary explains the marks.';
  if (question.category === 'Word Hunt') return 'Start with the first letter. Check the guide words, find the entry, and read its definition slowly.';
  return 'Use the contents page to find the named reference section. Look for the matching heading, row, or chart in your book.';
}

export const questions = [
  ...importedQuestions.map((question) => {
    const choices = distractors[question.id] ? [question.answer, ...distractors[question.id]] : undefined;
    return {
      ...question,
      source: 'csv', sourceDifficulty: question.difficulty,
      difficulty: question.difficulty === 'Easy' && !beginnerIds.has(question.id) ? 'Medium' : question.difficulty,
      available: !needsReview.has(question.id),
      type: choices ? 'multiple-choice' : 'typed-answer',
      ...(choices ? { choices } : {}),
      ...(guideExamples[question.id] ? { guideWords: guideExamples[question.id] } : {}),
      tip: teachingTip(question),
      success: question.dictionarySkill === 'reference-lookup'
        ? `You practiced finding information in the ${question.subcategory} section. The contents page and section headings help you search again.`
        : 'You practiced finding an entry and reading it carefully. Use this same approach when you meet a new word.'
    };
  }),
  ...lessons
];
