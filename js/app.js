// Google Sheets Web App URL Configuration
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyEEc086LfA0wIRGbHy4j76DALgYXukJyOFNpvKBQslNWRHNXXJCjVfMsNiiXwsb3WY/exec";

// Application State
let uploadedImages = [];
let lastGeneratedGameData = null;
let activeGridRows = 3;
let activeGridCols = 3;
let activePreviewIndex = 0;
let currentLanguage = 'en'; // default language
window.currentLanguage = currentLanguage;

// DOM Elements
const gameTitleInput = document.getElementById('game-title');
const numParticipantsInput = document.getElementById('num-participants');
const btnDec = document.getElementById('btn-dec');
const btnInc = document.getElementById('btn-inc');
const btnGenerate = document.getElementById('btn-generate');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const imagesGrid = document.getElementById('images-grid');
const uploadStatus = document.getElementById('upload-status');
const statusBar = document.getElementById('status-bar');
const statusText = document.getElementById('status-text');
const minReqText = document.getElementById('min-req-text');
const statsPanel = document.getElementById('stats-panel');
const btnDownloadAgain = document.getElementById('btn-download-again');

// Stat values
const statPages = document.getElementById('stat-pages');
const statBoards = document.getElementById('stat-boards');
const statImages = document.getElementById('stat-images');
const statDeviation = document.getElementById('stat-deviation');
const statAverage = document.getElementById('stat-average');
const statsFrequencySummary = document.getElementById('stats-frequency-summary');
const statsDuplicatesSummary = document.getElementById('stats-duplicates-summary');
const uploadedCountBadge = document.getElementById('uploaded-count-badge');

// Translation Dictionary
const translations = {
    en: {
        docTitle: "🎲 Custom Picture Bingo Generator 🎉",
        appTitle: "Custom Picture Bingo Generator 🎉",
        appSubtitle: "Create unique and balanced bingo boards with photos you love! Perfect for toddlers and kids (no reading required). Upload images, generate a printable layout, and start playing.",
        privacyNoteB: "We value your privacy:",
        privacyNoteText: "All image processing and algorithms run locally on your computer. Your photos are never saved or uploaded to any server!",
        settingsTitle: "⚙️ Game Settings",
        gameTitleLabel: "Game Title (up to 35 chars)",
        gameTitlePlaceholder: "e.g. Animal Bingo",
        boardSizeLabel: "Board Size",
        grid3x3Title: "3x3",
        grid3x3Desc: "9 cells (at least 10 images)",
        grid3x4Title: "3x4",
        grid3x4Desc: "12 cells (at least 13 images)",
        grid4x4Title: "4x4",
        grid4x4Desc: "16 cells (at least 17 images)",
        grid5x5Title: "5x5",
        grid5x5Desc: "25 cells (at least 26 images)",
        numParticipantsLabel: "Number of participants (boards)",
        cardsPerPageLabel: "Boards per page for printing",
        cardsPerPage1: "1 board per page (Portrait)",
        cardsPerPage2: "2 boards per page (Landscape - Default)",
        cardsPerPage4: "4 boards per page (Portrait)",
        cardsPerPage6: "6 boards per page (Landscape)",
        btnGenerate: "🎲 Shuffle & Update Boards",
        uploadPanelTitle: "📸 Upload Images",
        dragDropText: "Drag and drop image files here or <span>click to select files</span>",
        fileLimits: "PNG, JPG, JPEG, WEBP files only",
        statsTitleText: "📊 Board Stats & Live Preview",
        formatPdfLabel: "PDF Document",
        btnDownload: "📥 Download Printable File",
        previewTitle: "👀 Live Bingo Boards Preview",
        btnPrev: "◀️ Previous",
        btnNext: "Next ▶️",
        statPagesLabel: "Pages Generated",
        statBoardsLabel: "Boards Generated",
        statImagesLabel: "Uploaded Images",
        statDeviationLabel: "Max Balance Deviation",
        statAverageLabel: "Average Appearances",
        statsFreqTitle: "📊 Image Appearance Summary",
        statsDupTitle: "🔍 Board Uniqueness Analysis (Duplicate Boards)",
        feedbackTitle: "💬 We'd love to hear from you!",
        feedbackSubtitle: "How was your experience designing custom bingo boards?",
        feedbackPlaceholder: "Comments, suggestions, or kind words...",
        btnSubmitFeedback: "Submit Feedback",
        copyright: "Custom Picture Bingo Generator for Kids © 2026 | Version v1.0.1"
    },
    he: {
        docTitle: "🎲 מחולל לוחות בינגו תמונות בעיצוב אישי 🎉",
        appTitle: "מחולל לוחות בינגו תמונות בעיצוב אישי 🎉",
        appSubtitle: "עצבו לוחות בינגו ייחודיים ומאוזנים עם תמונות שלכם! מושלם לפעוטות וילדים (ללא צורך בקריאה). מעלים תמונות, מייצרים פריסה להדפסה ומתחילים לשחק.",
        privacyNoteB: "אנו מעריכים את הפרטיות שלך:",
        privacyNoteText: "כל עיבוד התמונות והאלגוריתמים רצים מקומית במחשב שלכם. התמונות שלכם אינן נשמרות ואינן מועלות לאף שרת חיצוני!",
        settingsTitle: "⚙️ הגדרות המשחק",
        gameTitleLabel: "כותרת המשחק (עד 35 תווים)",
        gameTitlePlaceholder: "למשל: בינגו חיות לגן",
        boardSizeLabel: "גודל לוח",
        grid3x3Title: "3x3",
        grid3x3Desc: "9 תאים (לפחות 10 תמונות)",
        grid3x4Title: "3x4",
        grid3x4Desc: "12 תאים (לפחות 13 תמונות)",
        grid4x4Title: "4x4",
        grid4x4Desc: "16 תאים (לפחות 17 תמונות)",
        grid5x5Title: "5x5",
        grid5x5Desc: "25 תאים (לפחות 26 תמונות)",
        numParticipantsLabel: "מספר משתתפים (לוחות)",
        cardsPerPageLabel: "לוחות בדף להדפסה",
        cardsPerPage1: "לוח 1 בדף (לאורך)",
        cardsPerPage2: "2 לוחות בדף (לרוחב - ברירת מחדל)",
        cardsPerPage4: "4 לוחות בדף (לאורך)",
        cardsPerPage6: "6 לוחות בדף (לרוחב)",
        btnGenerate: "🎲 ערבב ועדכן לוחות",
        uploadPanelTitle: "📸 העלאת תמונות",
        dragDropText: "גררו קבצי תמונות לכאן או <span>לחצו לבחירת קבצים</span>",
        fileLimits: "קבצי PNG, JPG, JPEG, WEBP בלבד",
        statsTitleText: "📊 נתוני איזון ותצוגה מקדימה",
        formatPdfLabel: "מסמך PDF",
        btnDownload: "📥 הורד קובץ להדפסה",
        previewTitle: "👀 תצוגה מקדימה של לוחות הבינגו",
        btnPrev: "◀️ הקודם",
        btnNext: "הבא ▶️",
        statPagesLabel: "דפים שנוצרו",
        statBoardsLabel: "לוחות שנוצרו",
        statImagesLabel: "תמונות הועלו",
        statDeviationLabel: "סטיית איזון מקסימלית",
        statAverageLabel: "ממוצע הופעות לתמונה",
        statsFreqTitle: "📊 סיכום הופעות תמונות",
        statsDupTitle: "🔍 בדיקת ייחודיות לוחות (לוחות זהים)",
        feedbackTitle: "💬 נשמח לשמוע ממך!",
        feedbackSubtitle: "איך הייתה החוויה שלך בעיצוב לוחות הבינגו?",
        feedbackPlaceholder: "הערות, רעיונות לשיפור או מילים טובות...",
        btnSubmitFeedback: "שלח משוב",
        copyright: "מחולל לוחות בינגו תמונות לילדים © 2026 | גרסה v1.0.1"
    }
};

// Update page content based on language
function setLanguage(lang) {
    currentLanguage = lang;
    window.currentLanguage = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    localStorage.setItem('bingo_generator_lang', lang);
    
    // Toggle active classes on language buttons
    const btnEn = document.getElementById('lang-en');
    const btnHe = document.getElementById('lang-he');
    if (lang === 'he') {
        btnHe.classList.add('active');
        btnEn.classList.remove('active');
    } else {
        btnEn.classList.add('active');
        btnHe.classList.remove('active');
    }
    
    // Set document title
    document.title = translations[lang].docTitle;
    
    // Translate all static texts
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (key === 'dragDropText' || key === 'privacyNoteText') {
                el.innerHTML = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });
    
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.setAttribute('placeholder', translations[lang][key]);
        }
    });
    
    // Check and set default game title value if user has not customized it yet
    if (gameTitleInput) {
        if ((gameTitleInput.value === 'Picture Bingo' || gameTitleInput.value === '') && lang === 'he') {
            gameTitleInput.value = 'בינגו ציורים';
        } else if ((gameTitleInput.value === 'בינגו ציורים' || gameTitleInput.value === '') && lang === 'en') {
            gameTitleInput.value = 'Picture Bingo';
        }
    }
    
    // Re-validate state which translates dynamic components like status text, stats summary and warning messages
    validateState();
    
    // Update placeholders of image inputs that are loaded dynamically
    document.querySelectorAll('.image-input').forEach(input => {
        input.setAttribute('placeholder', lang === 'he' ? 'שם/תיאור התמונה' : 'Image description');
    });
    
    // Load dynamic SEO article content
    renderSeoContent();
}

// Renders the dynamic SEO articles based on chosen language
function renderSeoContent() {
    const seoPanel = document.getElementById('seo-content-panel');
    if (!seoPanel) return;
    
    if (currentLanguage === 'he') {
        seoPanel.innerHTML = `
            <h3>🎨 יצירת לוחות בינגו תמונות מנצחים!</h3>
            <p>הכנת לוחות בינגו ציורים להדפסה היא דרך נפלאה להעסיק פעוטות, ילדי גן ותלמידים בכיתות הנמוכות. מכיוון שלא נדרש ידע בקריאה, כל הילדים יכולים להשתתף וליהנות מחוויה חינוכית ומעשירה! השתמשו במחולל החינמי שלנו ליצירת בינגו חיות לגן, למידת מילים חדשות, הפעלות לימי הולדת או משחק משפחתי בעיצוב אישי.</p>
            <h4>💡 טיפים מובילים לאיזון ואיכות משחק מושלמת</h4>
            <ul>
                <li><b>השתמשו במספיק תמונות:</b> העלאת כמות תמונות הגדולה ממספר התאים בלוח (למשל, 15-20 תמונות ללוח 3x3) מבטיחה שכל הלוחות שיופקו יהיו ייחודיים ומגוונים.</li>
                <li><b>שמרו על פשטות:</b> בחרו בתמונות עם רקע נקי וברור. ילדים קטנים מזהים חפצים וחיות במהירות רבה יותר כשיש פחות רעש ויזואלי סביבם.</li>
                <li><b>חיסכון בזיכרון:</b> המערכת שלנו מקטינה ומכווצת את התמונות ל-400 פיקסלים בתוך הדפדפן, ובכך חוסכת בזיכרון המחשב ושומרת על ביצועים מהירים מבלי לפגוע באיכות ההדפסה.</li>
            </ul>
            <h4>🎲 רעיונות יצירתיים למשחק בינגו תמונות</h4>
            <ul>
                <li><b>הרחבת אוצר מילים:</b> המנחה קורא בשם החפץ (או משמיע את קולו של בעל החיים), והילדים מזהים ומכסים את הציור המתאים בלוח שלהם.</li>
                <li><b>לימוד שפות זרות:</b> קראו את שם המילה בשפה שרוצים ללמוד (למשל אנגלית או עברית) כדי לתרגל אוצר מילים בצורה חווייתית וכיפית.</li>
                <li><b>משחק הגדרות וזיכרון:</b> תארו את החפץ (למשל, "זה פרי צהוב שקופים מאוד אוהבים לאכול") במקום לומר את שמו ישירות, ואפשרו לילדים לנחש את המילה ולמצוא אותה בלוח.</li>
            </ul>
        `;
    } else {
        seoPanel.innerHTML = `
            <h3>🎨 Master the Art of Custom Picture Bingo!</h3>
            <p>Creating your own printable picture bingo cards is the perfect way to engage toddlers, preschoolers, and classroom students. Since no reading is required, kids of all ages can join in on the educational fun! Use our free generator for animal bingo, vocabulary building, birthday parties, or custom family games.</p>
            <h4>💡 Top Tips for Perfect Bingo Game Balance</h4>
            <ul>
                <li><b>Use Enough Images:</b> Uploading more images than the board cells (e.g. 15-20 images for a 3x3 board) ensures that every board is unique and exciting.</li>
                <li><b>Keep it Clean:</b> Use simple, bright photos with clear backgrounds. Toddlers recognize objects faster when there is less visual noise.</li>
                <li><b>Save Memory:</b> Our system automatically compresses images to 400px in the browser, keeping the file size small while maintaining crisp printing quality.</li>
            </ul>
            <h4>🎲 Fun Ways to Play Picture Bingo</h4>
            <ul>
                <li><b>Vocabulary Builder:</b> Call out the name of the object (or make its sound) and have children identify and cover the picture on their board.</li>
                <li><b>Foreign Language Learning:</b> Call out the vocabulary word in a target language (e.g., Spanish, Hebrew, or English) to practice translation in a play-based setting.</li>
                <li><b>Memory Recall:</b> Describe the item (e.g., "It's yellow and monkeys love to eat it") instead of saying the name directly, forcing kids to guess the word first.</li>
            </ul>
        `;
    }
}


// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Participant Counter Event Listeners
    btnDec.addEventListener('click', () => {
        let val = parseInt(numParticipantsInput.value) || 25;
        if (val > 1) {
            numParticipantsInput.value = val - 1;
            validateState();
        }
    });
    
    btnInc.addEventListener('click', () => {
        let val = parseInt(numParticipantsInput.value) || 25;
        if (val < 1000) {
            numParticipantsInput.value = val + 1;
            validateState();
        }
    });

    numParticipantsInput.addEventListener('change', () => {
        let val = parseInt(numParticipantsInput.value);
        if (isNaN(val) || val < 1) numParticipantsInput.value = 1;
        if (val > 1000) numParticipantsInput.value = 1000;
        validateState();
    });

    // Grid Size Radio Event Listeners
    document.getElementById('grid-3x3').addEventListener('change', updateGridRequirements);
    document.getElementById('grid-3x4').addEventListener('change', updateGridRequirements);
    document.getElementById('grid-4x4').addEventListener('change', updateGridRequirements);
    document.getElementById('grid-5x5').addEventListener('change', updateGridRequirements);

    // Format Selector Event Listeners
    document.getElementById('format-pptx').addEventListener('change', updateDownloadWarning);
    document.getElementById('format-pdf').addEventListener('change', updateDownloadWarning);

    // Cards Per Page Selector Event Listener
    document.getElementById('cards-per-page').addEventListener('change', () => {
        activePreviewIndex = 0;
        updateDownloadWarning();
        if (lastGeneratedGameData) {
            renderActivePagePreview();
            const cardsPerPage = parseInt(document.getElementById('cards-per-page').value) || 2;
            const numPages = Math.ceil(lastGeneratedGameData.boards.length / cardsPerPage);
            if (statPages) statPages.innerText = numPages;
        }
    });

    // Drag & Drop Event Listeners
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragging');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragging');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragging');
        if (e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    });

    // Generate Button Event Listener
    btnGenerate.addEventListener('click', () => generateBingo(true));
    btnDownloadAgain.addEventListener('click', downloadBingoFile);
    
    // Live update title in browser preview and enforce 2-line maximum constraint
    let lastValidTitle = gameTitleInput.value;
    
    gameTitleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const newlines = (gameTitleInput.value.match(/\n/g) || []).length;
            if (newlines >= 1) {
                e.preventDefault();
            }
        }
    });
    
    gameTitleInput.addEventListener('input', () => {
        const originalValue = gameTitleInput.value;
        const newlines = (originalValue.match(/\n/g) || []).length;
        if (newlines > 1) {
            gameTitleInput.value = lastValidTitle;
            return;
        }

        // Temporarily append the longest possible suffix " - לוח 1000" to test height constraint
        gameTitleInput.value = originalValue + " - לוח 1000";
        const exceeds = (gameTitleInput.scrollHeight - gameTitleInput.clientHeight > 5);
        
        // Restore original value
        gameTitleInput.value = originalValue;

        if (exceeds) {
            gameTitleInput.value = lastValidTitle;
        } else {
            lastValidTitle = originalValue;
        }
        
        const gameTitle = gameTitleInput.value.trim() || 'בינגו ציורים';
        if (lastGeneratedGameData) {
            lastGeneratedGameData.title = gameTitle;
            renderActivePagePreview();
        }
    });
    
    // Board Browser Navigation Event Listeners
    document.getElementById('btn-prev-board').addEventListener('click', () => {
        if (activePreviewIndex > 0) {
            activePreviewIndex--;
            renderActivePagePreview();
        }
    });
    
    document.getElementById('btn-next-board').addEventListener('click', () => {
        if (lastGeneratedGameData) {
            const cardsPerPage = parseInt(document.getElementById('cards-per-page').value) || 2;
            const numPages = Math.ceil(lastGeneratedGameData.boards.length / cardsPerPage);
            if (activePreviewIndex < numPages - 1) {
                activePreviewIndex++;
                renderActivePagePreview();
            }
        }
    });
    
    // Interactive feedback form stars and submit handlers
    initFeedbackForm();
    
    // Language Switcher Listeners
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-he').addEventListener('click', () => setLanguage('he'));
    
    // Load saved language or default to English
    const savedLang = localStorage.getItem('bingo_generator_lang') || 'en';
    setLanguage(savedLang);
});

/**
 * Updates grid parameters based on selected size (3x3 vs 3x4).
 */
function updateGridRequirements() {
    if (document.getElementById('grid-3x3').checked) {
        activeGridRows = 3;
        activeGridCols = 3;
        minReqText.innerText = '10';
    } else if (document.getElementById('grid-3x4').checked) {
        activeGridRows = 3;
        activeGridCols = 4;
        minReqText.innerText = '13';
    } else if (document.getElementById('grid-4x4').checked) {
        activeGridRows = 4;
        activeGridCols = 4;
        minReqText.innerText = '17';
    } else if (document.getElementById('grid-5x5').checked) {
        activeGridRows = 5;
        activeGridCols = 5;
        minReqText.innerText = '26';
    }
    validateState();
}

/**
 * Handles file selection from the input click.
 */
function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        // Convert live FileList to a static array to prevent it being cleared when fileInput.value is reset
        const filesArray = Array.from(e.target.files);
        processFiles(filesArray);
    }
    // Clear input value so same files can be re-uploaded if deleted
    fileInput.value = '';
}

/**
 * Processes a list of uploaded File objects.
 */
async function processFiles(files) {
    let errors = [];
    
    // Disable generate button during load
    btnGenerate.disabled = true;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
            errors.push(currentLanguage === 'he'
                ? `הקובץ "${file.name}" אינו קובץ תמונה תקין.`
                : `The file "${file.name}" is not a valid image.`);
            continue;
        }
        
        try {
            // Process image via canvas helper (returns { dataUrl, aspectRatio })
            const result = await processImageFile(file);
            
            // Extract clean name without extension
            const defaultText = file.name.split('.').slice(0, -1).join('.');
            
            // Add image to state
            uploadedImages.push({
                id: Date.now() + Math.random(), // Unique ID
                text: defaultText,
                image_data: result.dataUrl,
                aspectRatio: result.aspectRatio,
                image_name: file.name
            });
            
        } catch (err) {
            errors.push(currentLanguage === 'he'
                ? `כשל בעיבוד התמונה "${file.name}": ${err.message}`
                : `Failed to process image "${file.name}": ${err.message}`);
        }
    }
    
    if (errors.length > 0) {
        alert(errors.join('\n'));
    }
    
    // Re-render and validate state
    renderUploadedImagesGrid();
    validateState();
}

/**
 * Renders the uploaded images list in a responsive grid.
 */
function renderUploadedImagesGrid() {
    imagesGrid.innerHTML = '';
    
    uploadedImages.forEach((imgObj) => {
        const card = document.createElement('div');
        card.className = 'image-card';
        
        const altText = currentLanguage === 'he' ? 'תמונה ללוח' : 'Board image';
        const placeholderText = currentLanguage === 'he' ? 'שם/תיאור התמונה' : 'Image description';
        
        card.innerHTML = `
            <div class="image-wrap">
                <img src="${imgObj.image_data}" alt="${altText}">
            </div>
            <div class="image-card-footer">
                <input type="text" class="image-input" value="${imgObj.text}" 
                       placeholder="${placeholderText}" data-id="${imgObj.id}">
                <button type="button" class="btn-delete" data-id="${imgObj.id}">🗑️</button>
            </div>
        `;
        
        // Listen to changes in image text input
        const input = card.querySelector('.image-input');
        input.addEventListener('change', (e) => {
            const id = parseFloat(e.target.dataset.id);
            const index = uploadedImages.findIndex(item => item.id === id);
            if (index !== -1) {
                uploadedImages[index].text = e.target.value;
            }
        });
        
        // Listen to delete click
        const delBtn = card.querySelector('.btn-delete');
        delBtn.addEventListener('click', () => {
            deleteUploadedImage(imgObj.id);
        });
        
        imagesGrid.appendChild(card);
    });
}

/**
 * Deletes an uploaded image from the state by ID.
 */
function deleteUploadedImage(id) {
    uploadedImages = uploadedImages.filter(img => img.id !== id);
    renderUploadedImagesGrid();
    validateState();
}

/**
 * Validates current configuration and updates the UI status and button states.
 */
function validateState() {
    let minRequired = 10;
    if (document.getElementById('grid-3x3').checked) minRequired = 10;
    else if (document.getElementById('grid-3x4').checked) minRequired = 13;
    else if (document.getElementById('grid-4x4').checked) minRequired = 17;
    else if (document.getElementById('grid-5x5').checked) minRequired = 26;
    const numUploaded = uploadedImages.length;
    const numParticipants = parseInt(numParticipantsInput.value) || 25;
    const boardCells = activeGridRows * activeGridCols;
    
    // Update the uploaded count badge in the header of the upload panel
    if (uploadedCountBadge) {
        if (numUploaded > 0) {
            uploadedCountBadge.innerText = currentLanguage === 'he'
                ? `${numUploaded} תמונות הועלו`
                : `${numUploaded} images uploaded`;
            uploadedCountBadge.style.display = 'inline-block';
        } else {
            uploadedCountBadge.style.display = 'none';
        }
    }
    
    // Calculate progress percentage
    const progressPercent = Math.min((numUploaded / minRequired) * 100, 100);
    statusBar.style.width = `${progressPercent}%`;
    
    if (numUploaded < minRequired) {
        statusBar.style.background = 'var(--accent-red)';
        statusText.innerHTML = currentLanguage === 'he'
            ? `הועלו <b>${numUploaded}</b> תמונות מתוך <b>${minRequired}</b> נדרשות לפחות. חסרות <b>${minRequired - numUploaded}</b> תמונות.`
            : `Uploaded <b>${numUploaded}</b> out of at least <b>${minRequired}</b> required images. Missing <b>${minRequired - numUploaded}</b> images.`;
        btnGenerate.disabled = true;
        statsPanel.classList.add('hidden');
        lastGeneratedGameData = null;
        updateDownloadWarning();
        return;
    }
    
    // Success state
    statusBar.style.background = 'var(--accent-green)';
    const totalCombinations = getCombinationsCount(numUploaded, boardCells);
    
    let statusMsg = "";
    if (currentLanguage === 'he') {
        statusMsg = `✅ הועלו <b>${numUploaded}</b> תמונות בהצלחה! על מנת שלא תהיה חזרתיות של שילובי תמונות, רצוי לייצר עד <b>${totalCombinations.toLocaleString()}</b> לוחות.`;
        if (numParticipants > totalCombinations) {
            statusMsg += ` במצב זה, כיוון שביקשת לייצר <b>${numParticipants.toLocaleString()}</b> לוחות, ייווצרו כפילויות (באפשרותך להחליט בסוף אם להדפיסם).`;
        } else {
            statusMsg += ` כיוון שביקשת לייצר <b>${numParticipants.toLocaleString()}</b> לוחות, כל הלוחות שייווצרו יהיו ייחודיים ומאוזנים.`;
        }
        
        statusMsg += `
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px; line-height: 1.4; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">
            💡 <b>כיצד מחושב מספר הלוחות השונים ללא חזרתיות?</b> לפי נוסחת הקומבינטוריקה לצירופים (Combinations):
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; direction: ltr; margin: 6px auto; background: rgba(15, 23, 42, 0.4); padding: 6px 12px; border-radius: 6px; width: fit-content; border: 1px solid var(--card-border);">
                <span style="font-weight: 600;">C(n, k) = </span>
                <div style="display: inline-flex; flex-direction: column; align-items: center; line-height: 1.1;">
                    <span style="border-bottom: 1px solid var(--text-secondary); padding-bottom: 2px; font-weight: 600;">n!</span>
                    <span style="padding-top: 2px; font-size: 0.8rem;">k! · (n - k)!</span>
                </div>
            </div>
            כאשר <b>n</b> הוא מספר התמונות שהעלית (<b>${numUploaded}</b>) ו-<b>k</b> הוא מספר התאים בלוח (<b>${boardCells}</b>).
        </div>`;
    } else {
        statusMsg = `✅ Uploaded <b>${numUploaded}</b> images successfully! To avoid duplicate board combinations, we recommend generating up to <b>${totalCombinations.toLocaleString()}</b> boards.`;
        if (numParticipants > totalCombinations) {
            statusMsg += ` Since you requested to generate <b>${numParticipants.toLocaleString()}</b> boards, some duplicate boards will occur (you can choose whether to print them at the end).`;
        } else {
            statusMsg += ` Since you requested to generate <b>${numParticipants.toLocaleString()}</b> boards, all boards generated will be unique and balanced.`;
        }
        
        statusMsg += `
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px; line-height: 1.4; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">
            💡 <b>How is the maximum number of unique boards calculated?</b> Using the combinatorics formula for combinations:
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; direction: ltr; margin: 6px auto; background: rgba(15, 23, 42, 0.4); padding: 6px 12px; border-radius: 6px; width: fit-content; border: 1px solid var(--card-border);">
                <span style="font-weight: 600;">C(n, k) = </span>
                <div style="display: inline-flex; flex-direction: column; align-items: center; line-height: 1.1;">
                    <span style="border-bottom: 1px solid var(--text-secondary); padding-bottom: 2px; font-weight: 600;">n!</span>
                    <span style="padding-top: 2px; font-size: 0.8rem;">k! · (n - k)!</span>
                </div>
            </div>
            Where <b>n</b> is the total number of uploaded images (<b>${numUploaded}</b>) and <b>k</b> is the number of cells on each board (<b>${boardCells}</b>).
        </div>`;
    }
    
    statusText.innerHTML = statusMsg;
    btnGenerate.disabled = false;
    
    // Update download warning dynamically
    updateDownloadWarning();
    
    // Automatically generate boards for preview (without scrolling)
    generateBingo(false);
}

/**
 * Generates the Bingo board allocations and initiates PPTX creation.
 */
function generateBingo(shouldScroll = true) {
    const numParticipants = parseInt(numParticipantsInput.value) || 25;
    const gameTitle = gameTitleInput.value.trim() || 'בינגו ציורים';
    const boardCells = activeGridRows * activeGridCols;
    const numUploaded = uploadedImages.length;
    
    // Safety check: verify state is valid
    let minRequired = 10;
    if (document.getElementById('grid-3x3').checked) minRequired = 10;
    else if (document.getElementById('grid-3x4').checked) minRequired = 13;
    else if (document.getElementById('grid-4x4').checked) minRequired = 17;
    else if (document.getElementById('grid-5x5').checked) minRequired = 26;
    
    if (numUploaded < minRequired) return;
    
    try {
        // 1. Run balancing algorithm in JS
        const balanceResult = generateBalancedBoards(numParticipants, boardCells, numUploaded);
        
        // 2. Map indices back to our image objects, and shuffle grid layout
        const shuffledBoards = balanceResult.boards.map(boardIndices => {
            let boardList = [...boardIndices];
            shuffleArray(boardList);
            return boardList;
        });
        
        // 3. Compile game data
        lastGeneratedGameData = {
            title: gameTitle,
            boards: shuffledBoards,
            counts: balanceResult.counts,
            targets: balanceResult.targets,
            maxDeviation: balanceResult.maxDeviation,
            images: uploadedImages.map((imgObj, idx) => {
                // Update object with 0-indexed id matching position in uploadedImages
                return {
                    id: idx,
                    text: imgObj.text,
                    image_data: imgObj.image_data,
                    aspectRatio: imgObj.aspectRatio
                };
            })
        };
        
        // 4. Set active preview index to show the first board
        if (activePreviewIndex >= lastGeneratedGameData.boards.length) {
            activePreviewIndex = 0;
        }
        
        // 5. Render Statistics Panel (which calls the browser preview)
        renderStatistics(lastGeneratedGameData, shouldScroll);
        
    } catch (error) {
        const errorMsg = currentLanguage === 'he'
            ? `שגיאה בייצור לוחות הבינגו: ${error.message}`
            : `Error generating bingo boards: ${error.message}`;
        if (shouldScroll) {
            alert(errorMsg);
        } else {
            console.error(errorMsg);
        }
    }
}

/**
 * Invokes the correct builder to create and download either PowerPoint or PDF.
 */
function downloadBingoFile() {
    if (!lastGeneratedGameData) return;
    
    const isPPTX = document.getElementById('format-pptx').checked;
    const cardsPerPage = parseInt(document.getElementById('cards-per-page').value) || 2;
    
    btnDownloadAgain.disabled = true;
    const originalText = btnDownloadAgain.innerText;
    if (isPPTX) {
        btnDownloadAgain.innerText = currentLanguage === 'he' ? '⌛ מייצר מצגת PowerPoint...' : '⌛ Generating PowerPoint presentation...';
    } else {
        btnDownloadAgain.innerText = currentLanguage === 'he' ? '⌛ מייצר מסמך PDF...' : '⌛ Generating PDF document...';
    }
    
    const generatorPromise = isPPTX 
        ? buildBingoPptx(lastGeneratedGameData, activeGridRows, activeGridCols, cardsPerPage)
        : buildBingoPdf(lastGeneratedGameData, activeGridRows, activeGridCols, cardsPerPage);
        
    generatorPromise
        .then(() => {
            btnDownloadAgain.disabled = false;
            btnDownloadAgain.innerText = originalText;
        })
        .catch(err => {
            btnDownloadAgain.disabled = false;
            btnDownloadAgain.innerText = originalText;
            alert(currentLanguage === 'he'
                ? `כשל ביצירת קובץ: ${err.message}`
                : `File generation failed: ${err.message}`);
        });
}

/**
 * Renders the statistics cards, chart, and detailed table.
 */
function renderStatistics(gameData, shouldScroll = true) {
    statsPanel.classList.remove('hidden');
    
    const cardsPerPage = parseInt(document.getElementById('cards-per-page').value) || 2;
    const numPages = Math.ceil(gameData.boards.length / cardsPerPage);
    
    // Fill Cards
    if (statPages) statPages.innerText = numPages;
    statBoards.innerText = gameData.boards.length;
    if (statImages) statImages.innerText = gameData.images.length;
    
    if (statDeviation) {
        statDeviation.innerText = gameData.maxDeviation === 0 
            ? (currentLanguage === 'he' ? 'מושלם (0)' : 'Perfect (0)') 
            : gameData.maxDeviation;
    }
    
    const boardCells = activeGridRows * activeGridCols;
    const avgShows = (gameData.boards.length * boardCells) / gameData.images.length;
    statAverage.innerText = avgShows.toFixed(1);
    
    // Group images by their actual appearance count
    const freqGroups = {};
    gameData.images.forEach((imgObj, idx) => {
        const count = gameData.counts[idx];
        if (!freqGroups[count]) {
            freqGroups[count] = [];
        }
        freqGroups[count].push(imgObj.text || imgObj.image_name || `תמונה ${idx + 1}`);
    });
    
    // Populate frequency summary
    statsFrequencySummary.innerHTML = '';
    const sortedFrequencies = Object.keys(freqGroups).map(Number).sort((a, b) => b - a);
    sortedFrequencies.forEach(freq => {
        const imageList = freqGroups[freq].join(', ');
        const rowEl = document.createElement('div');
        rowEl.style.fontSize = '0.95rem';
        if (currentLanguage === 'he') {
            rowEl.innerHTML = `• מופיע <b>${freq}</b> פעמים: <span style="color: var(--text-secondary);">${imageList}</span>`;
        } else {
            rowEl.innerHTML = `• Appears <b>${freq}</b> times: <span style="color: var(--text-secondary);">${imageList}</span>`;
        }
        statsFrequencySummary.appendChild(rowEl);
    });
    
    // Find duplicate boards (independent of layout order)
    const boardKeyToIndices = {}; // map of sorted_indices_string -> array of board indices (1-based)
    gameData.boards.forEach((board, bIdx) => {
        const sortedKey = [...board].sort((a, b) => a - b).join(',');
        if (!boardKeyToIndices[sortedKey]) {
            boardKeyToIndices[sortedKey] = [];
        }
        boardKeyToIndices[sortedKey].push(bIdx + 1); // 1-based board index
    });
    
    // Filter out keys that have only 1 board (meaning they are unique)
    const duplicateGroups = [];
    Object.keys(boardKeyToIndices).forEach(key => {
        const boardsList = boardKeyToIndices[key];
        if (boardsList.length > 1) {
            duplicateGroups.push(boardsList);
        }
    });
    
    // Populate duplicates summary
    statsDuplicatesSummary.innerHTML = '';
    if (duplicateGroups.length > 0) {
        let countText = "";
        let subText = "";
        let groupPrefix = "";
        let boardPrefix = "";
        
        if (currentLanguage === 'he') {
            countText = duplicateGroups.length === 1 
                ? 'נמצא לוח כפול אחד (המכיל את אותן התמונות בדיוק בסדר שונה או זהה).' 
                : `נמצאו <b>${duplicateGroups.length}</b> קבוצות של לוחות זהים (המכילים את אותן התמונות בדיוק בסדר שונה או זהה).`;
            subText = 'באפשרותך להחליט האם להדפיס לוחות אלו או לא.';
            groupPrefix = 'קבוצה';
            boardPrefix = 'לוח';
        } else {
            countText = duplicateGroups.length === 1 
                ? 'Found one duplicate board combination (containing the exact same set of images in a different or same order).' 
                : `Found <b>${duplicateGroups.length}</b> groups of duplicate boards (containing the exact same set of images in a different or same order).`;
            subText = 'You can choose whether to print these boards or not.';
            groupPrefix = 'Group';
            boardPrefix = 'Board';
        }
            
        const textEl = document.createElement('p');
        textEl.style.color = 'var(--accent-red)';
        textEl.style.fontWeight = 'bold';
        textEl.style.marginBottom = '6px';
        textEl.innerHTML = `⚠️ ${countText}<br><span style="font-weight: normal; color: var(--text-secondary); font-size: 0.9rem;">${subText}</span>`;
        statsDuplicatesSummary.appendChild(textEl);
        
        duplicateGroups.forEach((group, gIdx) => {
            const groupEl = document.createElement('div');
            groupEl.style.fontSize = '0.95rem';
            groupEl.innerHTML = `• <b>${groupPrefix} ${gIdx + 1}:</b> ${boardPrefix} ${group.join(`, ${boardPrefix} `)}`;
            statsDuplicatesSummary.appendChild(groupEl);
        });
    } else {
        const textEl = document.createElement('p');
        textEl.style.color = 'var(--accent-green)';
        textEl.style.fontWeight = 'bold';
        textEl.innerHTML = currentLanguage === 'he'
            ? `✅ מעולה! כל הלוחות ייחודיים לחלוטין (אין שני לוחות המכילים את אותן התמונות בדיוק).`
            : `✅ Excellent! All boards are completely unique (no two boards contain the exact same set of images).`;
        statsDuplicatesSummary.appendChild(textEl);
    }
    
    // Render the active preview board card
    renderActivePagePreview();
    
    // Smooth scroll down to statistics
    if (shouldScroll) {
        statsPanel.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Renders the currently active page in the preview card,
 * and updates browser controls (Prev/Next buttons and page numbers).
 */
function renderActivePagePreview() {
    if (!lastGeneratedGameData) return;
    
    const gameData = lastGeneratedGameData;
    const gridRows = activeGridRows;
    const gridCols = activeGridCols;
    const pageIdx = activePreviewIndex;
    
    const cardsPerPageSelect = document.getElementById('cards-per-page');
    const cardsPerPage = parseInt(cardsPerPageSelect.value) || 2;
    
    const numBoards = gameData.boards.length;
    const numPages = Math.ceil(numBoards / cardsPerPage);
    
    // Bounds check
    if (activePreviewIndex >= numPages) {
        activePreviewIndex = 0;
    }
    
    // Update board counter text to show page numbers
    const boardCounter = document.getElementById('board-counter');
    boardCounter.innerText = currentLanguage === 'he'
        ? `עמוד ${activePreviewIndex + 1} מתוך ${numPages}`
        : `Page ${activePreviewIndex + 1} of ${numPages}`;
    
    // Enable/disable buttons
    const btnPrev = document.getElementById('btn-prev-board');
    const btnNext = document.getElementById('btn-next-board');
    
    btnPrev.disabled = activePreviewIndex === 0;
    btnNext.disabled = activePreviewIndex >= numPages - 1;
    
    // Render the page container inside active-preview-card
    const activePreviewCard = document.getElementById('active-preview-card');
    activePreviewCard.innerHTML = '';
    
    // Clean classes and assign dynamic portrait/landscape classes
    activePreviewCard.className = 'preview-card';
    if (cardsPerPage === 1 || cardsPerPage === 4) {
        activePreviewCard.classList.add('portrait');
    } else {
        activePreviewCard.classList.add('landscape');
    }
    
    // Create the page grid element
    const pageGridEl = document.createElement('div');
    pageGridEl.className = 'preview-page-grid';
    
    // Set grid columns/rows dynamically
    let cols = 1, rows = 1;
    if (cardsPerPage === 2) { cols = 2; rows = 1; }
    else if (cardsPerPage === 4) { cols = 2; rows = 2; }
    else if (cardsPerPage === 6) { cols = 3; rows = 2; }
    
    pageGridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    pageGridEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    // Build lookup map for images
    const imagesMap = {};
    gameData.images.forEach(imgObj => {
        imagesMap[imgObj.id] = imgObj;
    });
    
    // Scale parameters based on layout density (cards per page)
    let titleFontSize = '1.3rem';
    let cardPadding = '15px';
    let titleMargin = '10px';
    let gridBorderWidth = '1.5px';
    let cellPadding = '3%';
    
    if (cardsPerPage === 2) {
        titleFontSize = '0.95rem';
        cardPadding = '10px';
        titleMargin = '8px';
    } else if (cardsPerPage === 4) {
        titleFontSize = '0.75rem';
        cardPadding = '6px';
        titleMargin = '4px';
        gridBorderWidth = '1px';
    } else if (cardsPerPage === 6) {
        titleFontSize = '0.65rem';
        cardPadding = '4px';
        titleMargin = '3px';
        gridBorderWidth = '1px';
    }
    
    // Render the cards on the page
    for (let i = 0; i < cardsPerPage; i++) {
        const boardIdx = pageIdx * cardsPerPage + i;
        if (boardIdx >= numBoards) {
            // Fill empty slot with empty invisible div to maintain grid structure
            const emptyCell = document.createElement('div');
            emptyCell.style.visibility = 'hidden';
            pageGridEl.appendChild(emptyCell);
            continue;
        }
        
        const boardImages = gameData.boards[boardIdx];
        
        // Card wrapper
        const cardItem = document.createElement('div');
        cardItem.className = 'preview-card-item';
        cardItem.style.padding = cardPadding;
        
        // Title
        const titleEl = document.createElement('div');
        titleEl.className = 'preview-card-title';
        titleEl.style.fontSize = titleFontSize;
        titleEl.style.marginBottom = titleMargin;
        const boardLabel = currentLanguage === 'he' ? 'לוח' : 'Board';
        titleEl.innerText = `${gameData.title} - ${boardLabel}\u00A0${boardIdx + 1}`;
        cardItem.appendChild(titleEl);
        
        // Grid container
        const gridEl = document.createElement('div');
        gridEl.className = 'preview-card-grid';
        gridEl.style.borderTop = `${gridBorderWidth} solid #94a3b8`;
        gridEl.style.borderLeft = `${gridBorderWidth} solid #94a3b8`;
        
        for (let r = 0; r < gridRows; r++) {
            const rowEl = document.createElement('div');
            rowEl.className = 'preview-card-row';
            
            for (let c = 0; c < gridCols; c++) {
                const cellEl = document.createElement('div');
                cellEl.className = 'preview-card-cell';
                cellEl.style.borderBottom = `${gridBorderWidth} solid #94a3b8`;
                cellEl.style.borderRight = `${gridBorderWidth} solid #94a3b8`;
                cellEl.style.padding = cellPadding;
                
                const imgIdx = boardImages[r * gridCols + c];
                const imgObj = imagesMap[imgIdx];
                
                const img = document.createElement('img');
                img.src = imgObj.image_data;
                img.alt = imgObj.text;
                
                cellEl.appendChild(img);
                rowEl.appendChild(cellEl);
            }
            gridEl.appendChild(rowEl);
        }
        
        cardItem.appendChild(gridEl);
        pageGridEl.appendChild(cardItem);
    }
    
    activePreviewCard.appendChild(pageGridEl);
}

/**
 * Updates the visibility and text of the large export warning.
 */
function updateDownloadWarning() {
    const numParticipants = parseInt(numParticipantsInput.value) || 25;
    const isPDF = document.getElementById('format-pdf').checked;
    const warningEl = document.getElementById('download-warning');
    const isStatsPanelVisible = statsPanel && !statsPanel.classList.contains('hidden');
    
    if (!warningEl) return;
    
    if (isStatsPanelVisible && numParticipants > 150 && isPDF) {
        warningEl.innerText = '⚠️ שים לב: הפקת כמות גדולה של לוחות (מעל 150) בפורמט PDF עלולה לקחת זמן מה ולהכביד על הדפדפן. מומלץ להשתמש בפורמט PowerPoint (PPTX) למהירות מרבית.';
        warningEl.classList.remove('hidden');
    } else {
        warningEl.innerText = '';
        warningEl.classList.add('hidden');
    }
}

/**
 * Initializes the interactive star rating and feedback form submission.
 */
function initFeedbackForm() {
    const stars = document.querySelectorAll('.star');
    const btnSubmitFeedback = document.getElementById('btn-submit-feedback');
    const feedbackComment = document.getElementById('feedback-comment');
    const feedbackStatus = document.getElementById('feedback-status');
    
    let selectedRating = 0;
    
    // Set up star rating interactions
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            selectedRating = parseInt(e.target.dataset.value);
            updateStars(selectedRating);
        });
        
        star.addEventListener('mouseover', (e) => {
            const hoverValue = parseInt(e.target.dataset.value);
            updateStars(hoverValue);
        });
        
        star.addEventListener('mouseleave', () => {
            updateStars(selectedRating);
        });
    });
    
    function updateStars(rating) {
        stars.forEach(star => {
            const val = parseInt(star.dataset.value);
            if (val <= rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
    
    // Handle form submission
    if (btnSubmitFeedback) {
        btnSubmitFeedback.addEventListener('click', () => {
            if (selectedRating === 0) {
                feedbackStatus.innerText = currentLanguage === 'he'
                    ? "⚠️ אנא בחרו דירוג בכוכבים (1 עד 5)."
                    : "⚠️ Please select a star rating (1 to 5).";
                feedbackStatus.className = "feedback-status error";
                feedbackStatus.classList.remove('hidden');
                return;
            }
            
            feedbackStatus.innerText = currentLanguage === 'he' ? "⌛ שולח משוב..." : "⌛ Submitting feedback...";
            feedbackStatus.className = "feedback-status";
            feedbackStatus.classList.remove('hidden');
            btnSubmitFeedback.disabled = true;
            
            const feedbackData = {
                stars: selectedRating,
                comment: feedbackComment.value.trim(),
                title: lastGeneratedGameData ? lastGeneratedGameData.title : "לא נוצר",
                boardsCount: lastGeneratedGameData ? lastGeneratedGameData.boards.length : 0
            };
            
            // Check if Google Sheet Web App URL is configured
            if (!GOOGLE_SCRIPT_URL) {
                // Save locally for demonstration/testing
                let localFeedbacks = [];
                try {
                    localFeedbacks = JSON.parse(localStorage.getItem('bingo_local_feedbacks') || '[]');
                } catch(e) {}
                
                localFeedbacks.push({
                    date: new Date().toLocaleString(),
                    ...feedbackData
                });
                
                localStorage.setItem('bingo_local_feedbacks', JSON.stringify(localFeedbacks));
                
                setTimeout(() => {
                    if (currentLanguage === 'he') {
                        feedbackStatus.innerHTML = `❤️ תודה! המשוב נשמר מקומית בדפדפן (כיוון שטרם הוגדר קישור ל-Google Sheets).<br><span style="font-size: 0.8rem; color: var(--text-secondary);">בדקו את ה-Console או ה-LocalStorage כדי לראות את הנתונים.</span>`;
                    } else {
                        feedbackStatus.innerHTML = `❤️ Thank you! Your feedback was saved locally in the browser (as no Google Sheets integration is configured).<br><span style="font-size: 0.8rem; color: var(--text-secondary);">Check the Console or LocalStorage to view the data.</span>`;
                    }
                    feedbackStatus.className = "feedback-status success";
                    console.log("Local feedbacks stored:", localFeedbacks);
                    
                    // Reset form
                    selectedRating = 0;
                    updateStars(0);
                    feedbackComment.value = '';
                    btnSubmitFeedback.disabled = false;
                }, 800);
                return;
            }
            
            // Send to Google Sheets Web App
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(feedbackData)
            })
            .then(() => {
                feedbackStatus.innerText = currentLanguage === 'he'
                    ? "❤️ המשוב שלך נשלח בהצלחה ונשמר בגיליון Google Sheets! תודה רבה."
                    : "❤️ Your feedback was successfully submitted and saved in your Google Sheet!";
                feedbackStatus.className = "feedback-status success";
                
                // Reset form
                selectedRating = 0;
                updateStars(0);
                feedbackComment.value = '';
                btnSubmitFeedback.disabled = false;
            })
            .catch(err => {
                feedbackStatus.innerText = currentLanguage === 'he'
                    ? `⚠️ כשל בשליחת המשוב: ${err.message || err}`
                    : `⚠️ Failed to submit feedback: ${err.message || err}`;
                feedbackStatus.className = "feedback-status error";
                btnSubmitFeedback.disabled = false;
            });
        });
    }
}
