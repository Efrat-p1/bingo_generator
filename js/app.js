// Google Sheets Web App URL Configuration
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyEEc086LfA0wIRGbHy4j76DALgYXukJyOFNpvKBQslNWRHNXXJCjVfMsNiiXwsb3WY/exec";

// Application State
let questionsState = [];
let lastGeneratedGameData = null;
let activeGridRows = 3;
let activeGridCols = 3;
let activePreviewIndex = 0;

// DOM Elements
const gameTitleInput = document.getElementById('game-title');
const numParticipantsInput = document.getElementById('num-participants');
const btnDec = document.getElementById('btn-dec');
const btnInc = document.getElementById('btn-inc');
const btnGenerate = document.getElementById('btn-generate');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const questionsGrid = document.getElementById('questions-grid');
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
        processFiles(e.target.files);
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
            errors.push(`הקובץ "${file.name}" אינו קובץ תמונה תקין.`);
            continue;
        }
        
        try {
            // Process image via canvas helper (returns { dataUrl, aspectRatio })
            const result = await processImageFile(file);
            
            // Extract clean name without extension
            const defaultText = file.name.split('.').slice(0, -1).join('.');
            
            // Add image to state
            questionsState.push({
                id: Date.now() + Math.random(), // Unique ID
                text: defaultText,
                image_data: result.dataUrl,
                aspectRatio: result.aspectRatio,
                image_name: file.name
            });
            
        } catch (err) {
            errors.push(`כשל בעיבוד התמונה "${file.name}": ${err.message}`);
        }
    }
    
    if (errors.length > 0) {
        alert(errors.join('\n'));
    }
    
    // Re-render and validate
    renderQuestionsGrid();
    validateState();
}

/**
 * Renders the uploaded questions list in a responsive grid.
 */
function renderQuestionsGrid() {
    questionsGrid.innerHTML = '';
    
    questionsState.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'q-card';
        
        card.innerHTML = `
            <div class="q-img-wrap">
                <img src="${q.image_data}" alt="תמונה לתא">
            </div>
            <div class="q-card-footer">
                <input type="text" class="q-input" value="${q.text}" 
                       placeholder="שאלה/תיאור" data-id="${q.id}">
                <button type="button" class="btn-delete" data-id="${q.id}">🗑️</button>
            </div>
        `;
        
        // Listen to changes in question text input
        const input = card.querySelector('.q-input');
        input.addEventListener('change', (e) => {
            const id = parseFloat(e.target.dataset.id);
            const index = questionsState.findIndex(item => item.id === id);
            if (index !== -1) {
                questionsState[index].text = e.target.value;
            }
        });
        
        // Listen to delete click
        const delBtn = card.querySelector('.btn-delete');
        delBtn.addEventListener('click', () => {
            deleteQuestion(q.id);
        });
        
        questionsGrid.appendChild(card);
    });
}

/**
 * Deletes a question from the state by ID.
 */
function deleteQuestion(id) {
    questionsState = questionsState.filter(q => q.id !== id);
    renderQuestionsGrid();
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
    const numUploaded = questionsState.length;
    const numParticipants = parseInt(numParticipantsInput.value) || 25;
    const boardCells = activeGridRows * activeGridCols;
    
    // Update the uploaded count badge in the header of the upload panel
    if (uploadedCountBadge) {
        if (numUploaded > 0) {
            uploadedCountBadge.innerText = `${numUploaded} תמונות הועלו`;
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
        statusText.innerHTML = `הועלו <b>${numUploaded}</b> תמונות מתוך <b>${minRequired}</b> נדרשות לפחות. חסרות <b>${minRequired - numUploaded}</b> תמונות.`;
        btnGenerate.disabled = true;
        statsPanel.classList.add('hidden');
        lastGeneratedGameData = null;
        updateDownloadWarning();
        return;
    }
    
    // Success state
    statusBar.style.background = 'var(--accent-green)';
    const totalCombinations = getCombinationsCount(numUploaded, boardCells);
    
    let statusMsg = `✅ הועלו <b>${numUploaded}</b> תמונות בהצלחה! על מנת שלא תהיה חזרתיות של שילובי תמונות, רצוי לייצר עד <b>${totalCombinations.toLocaleString()}</b> לוחות.`;
    if (numParticipants > totalCombinations) {
        statusMsg += ` במצב זה, כיוון שביקשת לייצר <b>${numParticipants.toLocaleString()}</b> לוחות, ייווצרו כפילויות (באפשרותך להחליט בסוף אם להדפיסם).`;
    } else {
        statusMsg += ` כיוון שביקשת לייצר <b>${numParticipants.toLocaleString()}</b> לוחות, כל הלוחות שייווצרו יהיו ייחודיים ומאוזנים.`;
    }
    
    // Add combinatorics formula explanation
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
    const numUploaded = questionsState.length;
    
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
        
        // 2. Map indices back to our question objects, and shuffle grid layout
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
            questions: questionsState.map((q, idx) => {
                // Update object with 0-indexed id matching position in questionsState
                return {
                    id: idx,
                    text: q.text,
                    image_data: q.image_data,
                    aspectRatio: q.aspectRatio
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
        if (shouldScroll) {
            alert(`שגיאה בייצור לוחות הבינגו: ${error.message}`);
        } else {
            console.error(`שגיאה בייצור לוחות בינגו: ${error.message}`);
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
    btnDownloadAgain.innerText = isPPTX ? '⌛ מייצר מצגת PowerPoint...' : '⌛ מייצר מסמך PDF...';
    
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
            alert(`כשל ביצירת קובץ: ${err.message}`);
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
    if (statImages) statImages.innerText = gameData.questions.length;
    statDeviation.innerText = gameData.maxDeviation === 0 ? 'מושלם (0)' : gameData.maxDeviation;
    
    const boardCells = activeGridRows * activeGridCols;
    const avgShows = (gameData.boards.length * boardCells) / gameData.questions.length;
    statAverage.innerText = avgShows.toFixed(1);
    
    // Group images by their actual appearance count
    const freqGroups = {};
    gameData.questions.forEach((q, idx) => {
        const count = gameData.counts[idx];
        if (!freqGroups[count]) {
            freqGroups[count] = [];
        }
        freqGroups[count].push(q.text || q.image_name || `תמונה ${idx + 1}`);
    });
    
    // Populate frequency summary
    statsFrequencySummary.innerHTML = '';
    const sortedFrequencies = Object.keys(freqGroups).map(Number).sort((a, b) => b - a);
    sortedFrequencies.forEach(freq => {
        const imageList = freqGroups[freq].join(', ');
        const rowEl = document.createElement('div');
        rowEl.style.fontSize = '0.95rem';
        rowEl.innerHTML = `• מופיע <b>${freq}</b> פעמים: <span style="color: var(--text-secondary);">${imageList}</span>`;
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
        const countText = duplicateGroups.length === 1 
            ? 'נמצא לוח כפול אחד (המכיל את אותן התמונות בדיוק בסדר שונה או זהה).' 
            : `נמצאו <b>${duplicateGroups.length}</b> קבוצות של לוחות זהים (המכילים את אותן התמונות בדיוק בסדר שונה או זהה).`;
            
        const textEl = document.createElement('p');
        textEl.style.color = 'var(--accent-red)';
        textEl.style.fontWeight = 'bold';
        textEl.style.marginBottom = '6px';
        textEl.innerHTML = `⚠️ ${countText}<br><span style="font-weight: normal; color: var(--text-secondary); font-size: 0.9rem;">באפשרותך להחליט האם להדפיס לוחות אלו או לא.</span>`;
        statsDuplicatesSummary.appendChild(textEl);
        
        duplicateGroups.forEach((group, gIdx) => {
            const groupEl = document.createElement('div');
            groupEl.style.fontSize = '0.95rem';
            groupEl.innerHTML = `• <b>קבוצה ${gIdx + 1}:</b> לוח ${group.join(', לוח ')}`;
            statsDuplicatesSummary.appendChild(groupEl);
        });
    } else {
        const textEl = document.createElement('p');
        textEl.style.color = 'var(--accent-green)';
        textEl.style.fontWeight = 'bold';
        textEl.innerHTML = `✅ מעולה! כל הלוחות ייחודיים לחלוטין (אין שני לוחות המכילים את אותן התמונות בדיוק).`;
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
    boardCounter.innerText = `עמוד ${activePreviewIndex + 1} מתוך ${numPages}`;
    
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
    
    // Build lookup map for questions
    const questionsMap = {};
    gameData.questions.forEach(q => {
        questionsMap[q.id] = q;
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
        
        const boardQuestions = gameData.boards[boardIdx];
        
        // Card wrapper
        const cardItem = document.createElement('div');
        cardItem.className = 'preview-card-item';
        cardItem.style.padding = cardPadding;
        
        // Title
        const titleEl = document.createElement('div');
        titleEl.className = 'preview-card-title';
        titleEl.style.fontSize = titleFontSize;
        titleEl.style.marginBottom = titleMargin;
        titleEl.innerText = `${gameData.title} - לוח\u00A0${boardIdx + 1}`;
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
                
                const qIdx = boardQuestions[r * gridCols + c];
                const q = questionsMap[qIdx];
                
                const img = document.createElement('img');
                img.src = q.image_data;
                img.alt = q.text;
                
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
                feedbackStatus.innerText = "⚠️ אנא בחרו דירוג בכוכבים (1 עד 5).";
                feedbackStatus.className = "feedback-status error";
                feedbackStatus.classList.remove('hidden');
                return;
            }
            
            feedbackStatus.innerText = "⌛ שולח משוב...";
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
                    feedbackStatus.innerHTML = `❤️ תודה! המשוב נשמר מקומית בדפדפן (כיוון שטרם הוגדר קישור ל-Google Sheets).<br><span style="font-size: 0.8rem; color: var(--text-secondary);">בדקו את ה-Console או ה-LocalStorage כדי לראות את הנתונים.</span>`;
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
                feedbackStatus.innerText = "❤️ המשוב שלך נשלח בהצלחה ונשמר בגיליון Google Sheets! תודה רבה.";
                feedbackStatus.className = "feedback-status success";
                
                // Reset form
                selectedRating = 0;
                updateStars(0);
                feedbackComment.value = '';
                btnSubmitFeedback.disabled = false;
            })
            .catch(err => {
                feedbackStatus.innerText = `⚠️ כשל בשליחת המשוב: ${err.message || err}`;
                feedbackStatus.className = "feedback-status error";
                btnSubmitFeedback.disabled = false;
            });
        });
    }
}
