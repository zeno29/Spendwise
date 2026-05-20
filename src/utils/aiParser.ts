export interface ParsedTransaction {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: ['food', 'grocery', 'groceries', 'costco', 'walmart', 'dinner', 'lunch', 'breakfast', 'brunch', 'cafe', 'coffee', 'starbucks', 'restaurant', 'pizza', 'subway', 'mcdonalds', 'eat', 'sushi', 'burger', 'dine', 'foodlion'],
  Shopping: ['shopping', 'bought', 'amazon', 'ebay', 'nike', 'shoes', 'clothes', 'clothing', 'mall', 'target', 'gift', 'store', 'electronics', 'bestbuy', 'jacket', 'shirt', 'pants'],
  Transport: ['transport', 'gas', 'uber', 'lyft', 'taxi', 'bus', 'train', 'flight', 'airplane', 'metro', 'subway-ticket', 'parking', 'shell', 'chevron', 'exxon', 'fuel', 'commute', 'toll'],
  Utilities: ['utilities', 'bill', 'rent', 'electricity', 'gas-bill', 'power', 'water', 'internet', 'wifi', 'comcast', 'verizon', 'phone', 'heating', 'trash'],
  Entertainment: ['entertainment', 'netflix', 'spotify', 'movie', 'cinema', 'theatre', 'concert', 'game', 'steam', 'playstation', 'xbox', 'fun', 'tickets', 'bar', 'club', 'pub', 'beer', 'drinks', 'bowling'],
  Health: ['health', 'gym', 'fitness', 'workout', 'doctor', 'dentist', 'dentistry', 'medicine', 'pharmacy', 'cvs', 'walgreens', 'hospital', 'clinic', 'copay', 'protein'],
  Salary: ['salary', 'paycheck', 'wages', 'job', 'direct-deposit', 'employer', 'payday'],
  Freelance: ['freelance', 'client', 'gig', 'upwork', 'fiverr', 'contract', 'project', 'consulting'],
};

export const parseNaturalLanguage = (text: string, availableCategories: string[]): ParsedTransaction => {
  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  const amountRegex = /(?:\$)?\s*(\d+(?:\.\d{1,2})?)/;
  const amountMatch = lowerText.match(amountRegex);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  const incomeKeywords = ['receive', 'received', 'got', 'earned', 'salary', 'paycheck', 'deposit', 'bonus', 'freelance', 'gig', 'wages', 'interest', 'refund'];
  const hasIncomeKeyword = incomeKeywords.some(keyword => lowerText.includes(keyword));

  let type: 'income' | 'expense' = 'expense';
  if (hasIncomeKeyword || lowerText.includes('freelance') || lowerText.includes('salary') || lowerText.includes('paycheck')) {
    type = 'income';
  }

  let category = type === 'income' ? 'Salary' : 'Other';
  let matchedScore = 0;

  for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (availableCategories.includes(catName)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          score += 1;
        }
      }
      if (score > matchedScore) {
        matchedScore = score;
        category = catName;
      }
    }
  }

  if (type === 'income' && category === 'Other') {
    if (lowerText.includes('freelance') || lowerText.includes('project') || lowerText.includes('client')) {
      category = 'Freelance';
    } else {
      category = 'Salary';
    }
  }

  let title = cleanText;

  const atMatch = cleanText.match(/\bat\s+([^,.$0-9]+)/i);

  const forMatch = cleanText.match(/\bfor\s+([^,.$0-9]+)/i);

  if (atMatch && atMatch[1].trim().length > 2) {
    title = atMatch[1].trim();
  } else if (forMatch && forMatch[1].trim().length > 2) {
    title = forMatch[1].trim();
  } else {

    const stopWords = [
      /spent/gi, /received/gi, /bought/gi, /got/gi, /earned/gi, /paid/gi, /logged/gi, /added/gi,
      /\bfor\b/gi, /\bat\b/gi, /\bon\b/gi, /\bin\b/gi, /\ba\b/gi, /\ban\b/gi, /\bthe\b/gi, /\band\b/gi,
      /\bto\b/gi, /\bmy\b/gi, /\bfrom\b/gi,
    ];

    let tempTitle = cleanText;

    tempTitle = tempTitle.replace(/(?:\$)?\s*\d+(?:\.\d{1,2})?/g, '');

    for (const regex of stopWords) {
      tempTitle = tempTitle.replace(regex, '');
    }

    tempTitle = tempTitle.replace(/\s+/g, ' ').trim();

    if (tempTitle.length > 2) {
      title = tempTitle;
    }
  }

  title = title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (!title || title.trim() === '') {
    title = type === 'income' ? 'Income Log' : `Expense Log (${category})`;
  }

  return {
    title,
    amount: amount || 0,
    type,
    category,
  };
};
