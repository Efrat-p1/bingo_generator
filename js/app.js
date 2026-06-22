// Application State
let questionsState = [];
let lastGeneratedGameData = null;
let activeGridRows = 3;
let activeGridCols = 3;

// DOM Elements
const gameTitleInput = document.getElementById('game-title');
const grid3x3Radio = document.getElementById('grid-3x3');
const grid3x4Radio = document.getElementById('grid-3x4');
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
const statBoards = document.getElementById('stat-boards');
const statDeviation = document.getElementById('stat-deviation');
const statAverage = document.getElementById('stat-average');
const statsTableBody = document.getElementById('stats-table-body');

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
        if (val < 250) {
            numParticipantsInput.value = val + 1;
            validateState();
        }
    });

    numParticipantsInput.addEventListener('change', () => {
        let val = parseInt(numParticipantsInput.value);
        if (isNaN(val) || val < 1) numParticipantsInput.value = 1;
        if (val > 250) numParticipantsInput.value = 250;
        validateState();
    });

    // Grid Size Radio Event Listeners
    grid3x3Radio.addEventListener('change', updateGridRequirements);
    grid3x4Radio.addEventListener('change', updateGridRequirements);

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
    btnGenerate.addEventListener('click', generateBingo);
    btnDownloadAgain.addEventListener('click', downloadBingoPPTX);
});

/**
 * Updates grid parameters based on selected size (3x3 vs 3x4).
 */
function updateGridRequirements() {
    if (grid3x3Radio.checked) {
        activeGridRows = 3;
        activeGridCols = 3;
        minReqText.innerText = '12';
    } else {
        activeGridRows = 3;
        activeGridCols = 4;
        minReqText.innerText = '16';
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
    const minRequired = grid3x3Radio.checked ? 12 : 16;
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
    const minRequired = grid3x3Radio.checked ? 12 : 16;
    const numUploaded = questionsState.length;
    const numParticipants = parseInt(numParticipantsInput.value) || 25;
    const boardCells = activeGridRows * activeGridCols;
    
    // Calculate progress percentage
    const progressPercent = Math.min((numUploaded / minRequired) * 100, 100);
    statusBar.style.width = `${progressPercent}%`;
    
    if (numUploaded < minRequired) {
        statusBar.style.background = 'var(--accent-red)';
        statusText.innerHTML = `הועלו <b>${numUploaded}</b> תמונות מתוך <b>${minRequired}</b> נדרשות לפחות. חסרות <b>${minRequired - numUploaded}</b> תמונות.`;
        btnGenerate.disabled = true;
        return;
    }
    
    // Validate combination capacity
    const totalCombinations = getCombinationsCount(numUploaded, boardCells);
    if (numParticipants > totalCombinations) {
        statusBar.style.background = 'var(--accent-red)';
        statusText.innerHTML = `⚠️ שגיאה: כמות המשתתפים שביקשת (${numParticipants}) גדולה ממספר הלוחות השונים שניתן לייצר (${totalCombinations}). העלה עוד תמונות.`;
        btnGenerate.disabled = true;
        return;
    }
    
    // Success state
    statusBar.style.background = 'var(--accent-green)';
    statusText.innerHTML = `✅ הועלו <b>${numUploaded}</b> תמונות בהצלחה! מוכן לייצר <b>${numParticipants}</b> לוחות ייחודיים ומאוזנים.`;
    btnGenerate.disabled = false;
}

/**
 * Generates the Bingo board allocations and initiates PPTX creation.
 */
function generateBingo() {
    const numParticipants = parseInt(numParticipantsInput.value) || 25;
    const gameTitle = gameTitleInput.value.trim() || 'בינגו ציורים';
    const boardCells = activeGridRows * activeGridCols;
    const numUploaded = questionsState.length;
    
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
        
        // 4. Download PPTX
        downloadBingoPPTX();
        
        // 5. Render Statistics Panel
        renderStatistics(lastGeneratedGameData);
        
    } catch (error) {
        alert(`שגיאה בייצור לוחות הבינגו: ${error.message}`);
    }
}

/**
 * Invokes the PPT builder to create and download the PowerPoint file.
 */
function downloadBingoPPTX() {
    if (!lastGeneratedGameData) return;
    
    btnGenerate.disabled = true;
    const originalText = btnGenerate.innerText;
    btnGenerate.innerText = '⌛ מייצר קובץ PowerPoint...';
    
    buildBingoPptx(lastGeneratedGameData, activeGridRows, activeGridCols)
        .then(() => {
            btnGenerate.disabled = false;
            btnGenerate.innerText = originalText;
        })
        .catch(err => {
            btnGenerate.disabled = false;
            btnGenerate.innerText = originalText;
            alert(`כשל ביצירת קובץ המצגת: ${err.message}`);
        });
}

/**
 * Renders the statistics cards, chart, and detailed table.
 */
function renderStatistics(gameData) {
    statsPanel.classList.remove('hidden');
    
    // Fill Cards
    statBoards.innerText = gameData.boards.length;
    statDeviation.innerText = gameData.maxDeviation === 0 ? 'מושלם (0)' : gameData.maxDeviation;
    
    const boardCells = activeGridRows * activeGridCols;
    const avgShows = (gameData.boards.length * boardCells) / gameData.questions.length;
    statAverage.innerText = avgShows.toFixed(1);
    
    // Fill Table
    statsTableBody.innerHTML = '';
    gameData.questions.forEach((q, idx) => {
        const actual = gameData.counts[idx];
        const target = gameData.targets[idx];
        const diff = actual - target;
        
        const diffClass = diff === 0 ? 'stat-perfect' : (diff > 0 ? 'stat-positive' : 'stat-negative');
        const diffSign = diff > 0 ? `+${diff}` : diff;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${idx + 1}</td>
            <td><b>${q.text}</b></td>
            <td>${actual}</td>
            <td>${target}</td>
            <td style="color: ${diff === 0 ? '#10b981' : (diff > 0 ? '#6366f1' : '#ef4444')}">${diffSign}</td>
        `;
        statsTableBody.appendChild(row);
    });
    
    
    // Smooth scroll down to statistics
    statsPanel.scrollIntoView({ behavior: 'smooth' });
}
