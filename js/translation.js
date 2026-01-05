// Supported Languages
const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
];

// Language Detection Service
const languageDetector = {
    detect(text) {
        const cleanText = text.trim();
        
        if (!cleanText) return 'en';

        // Check for specific character sets
        if (this.containsCyrillic(cleanText)) return 'ru';
        if (this.containsArabic(cleanText)) return 'ar';
        if (this.containsHangul(cleanText)) return 'ko';
        if (this.containsHiraganaKatakana(cleanText)) return 'ja';
        if (this.containsCJK(cleanText)) return 'zh';
        if (this.containsTurkish(cleanText)) return 'tr';

        return this.detectLatinLanguage(cleanText);
    },

    containsCyrillic(text) {
        return /[\u0400-\u04FF]/.test(text);
    },

    containsArabic(text) {
        return /[\u0600-\u06FF]/.test(text);
    },

    containsHangul(text) {
        return /[\uAC00-\uD7AF]/.test(text);
    },

    containsHiraganaKatakana(text) {
        return /[\u3040-\u309F\u30A0-\u30FF]/.test(text);
    },

    containsCJK(text) {
        return /[\u4E00-\u9FFF]/.test(text);
    },

    containsTurkish(text) {
        return /[ğĞıİöÖüÜşŞçÇ]/.test(text);
    },

    detectLatinLanguage(text) {
        const lowerText = text.toLowerCase();
        
        const scores = {
            tr: this.countMatches(lowerText, ['bir', 've', 'bu', 'için', 'ile', 'olan', 'var', 'değil', 'da', 'de']),
            en: this.countMatches(lowerText, ['the', 'is', 'and', 'to', 'in', 'of', 'a', 'for', 'that', 'with']),
            es: this.countMatches(lowerText, ['el', 'la', 'de', 'que', 'y', 'en', 'es', 'por', 'un', 'para']),
            fr: this.countMatches(lowerText, ['le', 'la', 'de', 'et', 'à', 'un', 'être', 'pour', 'dans', 'ce']),
            de: this.countMatches(lowerText, ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'])
        };

        const maxScore = Math.max(...Object.values(scores));
        if (maxScore === 0) return 'en';

        return Object.entries(scores).find(([, score]) => score === maxScore)[0];
    },

    countMatches(text, words) {
        let count = 0;
        for (const word of words) {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const matches = text.match(regex);
            if (matches) count += matches.length;
        }
        return count;
    }
};

// Translation Service
const translationService = {
    async translate(text, sourceLang, targetLang) {
        try {
            // Using LibreTranslate API
            const response = await fetch('https://libretranslate.com/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    source: sourceLang,
                    target: targetLang,
                    format: 'text'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.translatedText || text;
        } catch (error) {
            console.error('LibreTranslate error, trying MyMemory API:', error);
            return await this.translateWithMyMemory(text, sourceLang, targetLang);
        }
    },

    async translateWithMyMemory(text, sourceLang, targetLang) {
        try {
            const langPair = `${sourceLang}|${targetLang}`;
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.responseData.translatedText || text;
        } catch (error) {
            console.error('MyMemory translation error:', error);
            throw new Error('Çeviri başarısız. İnternet bağlantınızı kontrol edin.');
        }
    }
};

// Main Translation Function
async function performTranslation(text, lang1, lang2) {
    if (!text.trim()) {
        throw new Error('Lütfen çevirmek için bir metin girin');
    }

    // Detect source language
    const detectedLang = languageDetector.detect(text);
    
    // Determine source and target
    let sourceLang, targetLang;
    if (detectedLang === lang1.code) {
        sourceLang = lang1;
        targetLang = lang2;
    } else if (detectedLang === lang2.code) {
        sourceLang = lang2;
        targetLang = lang1;
    } else {
        // Default to lang1 -> lang2
        sourceLang = lang1;
        targetLang = lang2;
    }

    // Perform translation
    const translatedText = await translationService.translate(
        text,
        sourceLang.code,
        targetLang.code
    );

    return {
        id: Date.now().toString(),
        sourceText: text,
        translatedText: translatedText,
        sourceLang: sourceLang,
        targetLang: targetLang,
        timestamp: new Date().toISOString()
    };
}
