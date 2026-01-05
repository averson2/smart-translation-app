// Local Storage Helper Functions

const storage = {
    // Get item from localStorage
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },

    // Set item in localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },

    // Remove item from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    // Clear all localStorage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
};

// Settings Management
const settingsManager = {
    getLanguage1() {
        return storage.get('language1', { code: 'en', name: 'English', flag: '🇬🇧' });
    },

    getLanguage2() {
        return storage.get('language2', { code: 'tr', name: 'Türkçe', flag: '🇹🇷' });
    },

    setLanguage1(language) {
        storage.set('language1', language);
    },

    setLanguage2(language) {
        storage.set('language2', language);
    },

    swapLanguages() {
        const lang1 = this.getLanguage1();
        const lang2 = this.getLanguage2();
        this.setLanguage1(lang2);
        this.setLanguage2(lang1);
    },

    getTheme() {
        return storage.get('theme', 'light');
    },

    setTheme(theme) {
        storage.set('theme', theme);
    },

    getTextSize() {
        return storage.get('textSize', 16);
    },

    setTextSize(size) {
        storage.set('textSize', size);
    },

    getAutoCopy() {
        return storage.get('autoCopy', false);
    },

    setAutoCopy(value) {
        storage.set('autoCopy', value);
    }
};

// Translation History Management
const historyManager = {
    getHistory() {
        return storage.get('translations', []);
    },

    addTranslation(translation) {
        const history = this.getHistory();
        history.unshift(translation);
        
        // Keep only last 100 translations
        if (history.length > 100) {
            history.splice(100);
        }
        
        storage.set('translations', history);
    },

    clearHistory() {
        storage.set('translations', []);
    }
};
