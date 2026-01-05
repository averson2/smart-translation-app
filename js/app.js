// Main App Logic

let currentLangPicker = null;

// Initialize App
function initializeApp() {
    loadSettings();
    loadTranslationHistory();
    setupEventListeners();
}

// Load Settings
function loadSettings() {
    // Load languages
    const lang1 = settingsManager.getLanguage1();
    const lang2 = settingsManager.getLanguage2();
    updateLanguageDisplay(lang1, lang2);
    
    // Load theme
    const theme = settingsManager.getTheme();
    applyTheme(theme);
    document.getElementById('theme-select').value = theme;
    
    // Load text size
    const textSize = settingsManager.getTextSize();
    applyTextSize(textSize);
    document.getElementById('text-size-slider').value = textSize;
    document.getElementById('text-size-value').textContent = textSize;
    
    // Load auto copy
    const autoCopy = settingsManager.getAutoCopy();
    document.getElementById('auto-copy-toggle').checked = autoCopy;
}

// Load Translation History
function loadTranslationHistory() {
    const history = historyManager.getHistory();
    const historyContainer = document.getElementById('translation-history');
    
    if (history.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">translate</span>
                <h3>Çeviri Yapmaya Başlayın</h3>
                <p>Aşağıya bir mesaj yazın</p>
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = '';
    history.forEach(translation => {
        historyContainer.appendChild(createTranslationBubble(translation));
    });
    
    // Scroll to bottom
    historyContainer.scrollTop = historyContainer.scrollHeight;
}

// Create Translation Bubble
function createTranslationBubble(translation) {
    const bubble = document.createElement('div');
    bubble.className = 'translation-bubble';
    
    const textSize = settingsManager.getTextSize();
    
    bubble.innerHTML = `
        <div class="message-group">
            <div class="message-header">
                <div class="message-lang">
                    <span class="flag">${translation.sourceLang.flag}</span>
                    <span>${translation.sourceLang.name}</span>
                </div>
                <button class="copy-btn" onclick="copyText('${escapeHtml(translation.sourceText)}')">
                    <span class="material-icons">content_copy</span>
                </button>
            </div>
            <div class="message-text" style="font-size: ${textSize}px">${escapeHtml(translation.sourceText)}</div>
        </div>
        <div class="message-group translated">
            <div class="message-header">
                <div class="message-lang">
                    <span class="flag">${translation.targetLang.flag}</span>
                    <span>${translation.targetLang.name}</span>
                </div>
                <button class="copy-btn" onclick="copyText('${escapeHtml(translation.translatedText)}')">
                    <span class="material-icons">content_copy</span>
                </button>
            </div>
            <div class="message-text" style="font-size: ${textSize}px">${escapeHtml(translation.translatedText)}</div>
        </div>
    `;
    
    return bubble;
}

// Translate Text
async function translateText() {
    const input = document.getElementById('input-text');
    const text = input.value.trim();
    
    if (!text) return;
    
    const sendBtn = document.getElementById('send-btn');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>';
    
    try {
        const lang1 = settingsManager.getLanguage1();
        const lang2 = settingsManager.getLanguage2();
        
        const translation = await performTranslation(text, lang1, lang2);
        
        // Save to history
        historyManager.addTranslation(translation);
        
        // Update UI
        const historyContainer = document.getElementById('translation-history');
        if (historyContainer.querySelector('.empty-state')) {
            historyContainer.innerHTML = '';
        }
        historyContainer.appendChild(createTranslationBubble(translation));
        
        // Scroll to bottom
        historyContainer.scrollTop = historyContainer.scrollHeight;
        
        // Clear input
        input.value = '';
        
        // Auto copy if enabled
        if (settingsManager.getAutoCopy()) {
            await navigator.clipboard.writeText(translation.translatedText);
            showToast('Çeviri kopyalandı!');
        }
    } catch (error) {
        console.error('Translation error:', error);
        showToast(error.message || 'Çeviri başarısız oldu');
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<span class="material-icons">send</span>';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Enter to send
    const input = document.getElementById('input-text');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            translateText();
        }
    });
    
    // Auto-resize textarea
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

// Update Language Display
function updateLanguageDisplay(lang1, lang2) {
    document.getElementById('lang1-flag').textContent = lang1.flag;
    document.getElementById('lang1-name').textContent = lang1.name;
    document.getElementById('lang2-flag').textContent = lang2.flag;
    document.getElementById('lang2-name').textContent = lang2.name;
}

// Show Language Picker
function showLanguagePicker(langKey) {
    currentLangPicker = langKey;
    const modal = document.getElementById('language-picker-modal');
    const list = document.getElementById('language-picker-list');
    const title = document.getElementById('language-picker-title');
    
    title.textContent = langKey === 'lang1' ? 'Birinci Dili Seçin' : 'İkinci Dili Seçin';
    
    const currentLang = langKey === 'lang1' 
        ? settingsManager.getLanguage1() 
        : settingsManager.getLanguage2();
    
    list.innerHTML = '';
    LANGUAGES.forEach(lang => {
        const option = document.createElement('div');
        option.className = 'language-option';
        if (lang.code === currentLang.code) {
            option.classList.add('selected');
        }
        
        option.innerHTML = `
            <span class="flag">${lang.flag}</span>
            <span>${lang.name}</span>
            ${lang.code === currentLang.code ? '<span class="material-icons">check</span>' : ''}
        `;
        
        option.onclick = () => selectLanguage(lang);
        list.appendChild(option);
    });
    
    modal.classList.remove('hidden');
}

// Select Language
function selectLanguage(language) {
    if (currentLangPicker === 'lang1') {
        settingsManager.setLanguage1(language);
    } else {
        settingsManager.setLanguage2(language);
    }
    
    const lang1 = settingsManager.getLanguage1();
    const lang2 = settingsManager.getLanguage2();
    updateLanguageDisplay(lang1, lang2);
    
    closeLanguagePicker();
}

// Close Language Picker
function closeLanguagePicker() {
    document.getElementById('language-picker-modal').classList.add('hidden');
    currentLangPicker = null;
}

// Swap Languages
function swapLanguages() {
    settingsManager.swapLanguages();
    const lang1 = settingsManager.getLanguage1();
    const lang2 = settingsManager.getLanguage2();
    updateLanguageDisplay(lang1, lang2);
    showToast('Diller değiştirildi');
}

// Change Theme
function changeTheme(theme) {
    settingsManager.setTheme(theme);
    applyTheme(theme);
}

// Apply Theme
function applyTheme(theme) {
    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
    }
    
    document.body.setAttribute('data-theme', theme);
}

// Change Text Size
function changeTextSize(size) {
    settingsManager.setTextSize(size);
    document.getElementById('text-size-value').textContent = size;
    applyTextSize(size);
    loadTranslationHistory(); // Reload to apply new size
}

// Apply Text Size
function applyTextSize(size) {
    document.querySelectorAll('.message-text').forEach(el => {
        el.style.fontSize = `${size}px`;
    });
}

// Toggle Auto Copy
function toggleAutoCopy(enabled) {
    settingsManager.setAutoCopy(enabled);
    showToast(enabled ? 'Otomatik kopyalama açık' : 'Otomatik kopyalama kapalı');
}

// Toggle Settings Panel
function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    panel.classList.toggle('active');
}

// Toggle Menu
function toggleMenu() {
    const menu = document.getElementById('menu-dropdown');
    menu.classList.toggle('hidden');
}

// Close Menu
function closeMenu() {
    document.getElementById('menu-dropdown').classList.add('hidden');
}

// Clear History
function clearHistory() {
    if (confirm('Tüm çeviri geçmişini silmek istediğinizden emin misiniz?')) {
        historyManager.clearHistory();
        loadTranslationHistory();
        showToast('Geçmiş temizlendi');
        closeMenu();
    }
}

// Copy Text to Clipboard
async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Kopyalandı!');
    } catch (error) {
        console.error('Copy error:', error);
        showToast('Kopyalama başarısız');
    }
}

// Show Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('menu-dropdown');
    const menuBtn = e.target.closest('.icon-btn[onclick="toggleMenu()"]');
    
    if (!menu.contains(e.target) && !menuBtn && !menu.classList.contains('hidden')) {
        closeMenu();
    }
});

// Close modals when clicking outside
document.getElementById('language-picker-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'language-picker-modal') {
        closeLanguagePicker();
    }
});

// Watch for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const theme = settingsManager.getTheme();
    if (theme === 'system') {
        applyTheme('system');
    }
});
