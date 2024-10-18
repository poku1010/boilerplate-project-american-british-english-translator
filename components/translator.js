const americanOnly = require('./american-only.js');
const britishOnly = require('./british-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require('./american-to-british-titles.js');

const britishToAmericanSpelling = {};
const britishToAmericanTitles = {};

for (let key in americanToBritishSpelling) {
  britishToAmericanSpelling[americanToBritishSpelling[key]] = key;
}

for (let key in americanToBritishTitles) {
  britishToAmericanTitles[americanToBritishTitles[key]] = key;
}

class Translator {
  translate(text, locale) {
    if (text === undefined) return { error: 'No text to translate' };
    if (locale === undefined) return { error: 'Locale field is empty' };
    if (locale !== 'american-to-british' && locale !== 'british-to-american') {
      return { error: 'Invalid locale field' };
    }

    let translation = text;
    let translationExists = false;

    const translateText = (text, dictionary) => {
      const regex = new RegExp('\\b(' + Object.keys(dictionary).map(k => k.replace(/\./g, '\\.')).join('|') + ')\\b', 'gi');
      return text.replace(regex, (match) => {
        const lowerMatch = match.toLowerCase();
        const replacement = dictionary[lowerMatch];
        const highlighted = `<span class="highlight">${replacement}</span>`;
        translationExists = true;
        // 保留原始大小寫
        return match[0] === match[0].toUpperCase()
          ? highlighted.charAt(0).toUpperCase() + highlighted.slice(1)
          : highlighted;
      });
    };

    const translateTitles = (text, titles) => {
      const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const titlesRegex = Object.keys(titles).map(title => escapeRegExp(title)).join('|');
      const regex = new RegExp('(' + titlesRegex + ')', 'gi');
      return text.replace(regex, (match) => {
        const lowerMatch = match.toLowerCase();
        const replacement = titles[lowerMatch];
        const highlighted = `<span class="highlight">${replacement.charAt(0).toUpperCase()}${replacement.slice(1)}</span>`;
        translationExists = true;
        return highlighted;
      });
    };

    if (locale === 'american-to-british') {
      translation = translateTitles(translation, americanToBritishTitles);
      translation = translateText(translation, americanToBritishSpelling);
      translation = translateText(translation, americanOnly);

      translation = translation.replace(/(\d{1,2}):(\d{2})/g, (match) => {
        const replacement = match.replace(':', '.');
        const highlighted = `<span class="highlight">${replacement}</span>`;
        translationExists = true;
        return highlighted;
      });
    } else {
      translation = translateTitles(translation, britishToAmericanTitles);
      translation = translateText(translation, britishToAmericanSpelling);
      translation = translateText(translation, britishOnly);

      translation = translation.replace(/(\d{1,2})\.(\d{2})/g, (match) => {
        const replacement = match.replace('.', ':');
        const highlighted = `<span class="highlight">${replacement}</span>`;
        translationExists = true;
        return highlighted;
      });
    }

    // 修改這裡，去除高亮標籤再進行比較
    if (!translationExists || translation.replace(/<[^>]*>/g, '') === text) {
      return { text, translation: 'Everything looks good to me!' };
    }

    return { text, translation };
  }
}

module.exports = Translator;
