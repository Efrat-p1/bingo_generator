/**
 * Calculates the number of unique combinations (n choose k).
 */
function getCombinationsCount(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
    }
    return Math.round(res);
}

/**
 * Shuffles an array in-place using the Fisher-Yates algorithm.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Generates balanced, unique Bingo board layouts.
 * 
 * @param {number} numBoards - Number of boards to generate (N)
 * @param {number} boardSize - Number of cells in each board (K)
 * @param {number} numImages - Total number of available images (M)
 * @param {number} maxRestarts - Maximum times to reset the process if stuck
 * @param {number} maxRetries - Maximum retries inside the loop to find a unique board
 * @returns {object} Object containing boards, actual counts, target capacities, and maxDeviation
 */
function generateBalancedBoards(numBoards, boardSize, numImages, maxRestarts = 100, maxRetries = 100) {
    const K = boardSize;
    const N = numBoards;
    const M = numImages;
    
    // Calculate total unique combinations
    const totalCombinations = getCombinationsCount(M, K);
    const allowDuplicates = N > totalCombinations;
    
    for (let restart = 0; restart < maxRestarts; restart++) {
        const totalCells = N * K;
        const baseCap = Math.floor(totalCells / M);
        const remCap = totalCells % M;
        
        // Initialize target capacities
        let capacities = new Array(M).fill(baseCap);
        
        // Randomly assign the remainder (+1 capacity) to remCap images
        let imgIndices = Array.from({ length: M }, (_, i) => i);
        shuffleArray(imgIndices);
        for (let i = 0; i < remCap; i++) {
            capacities[imgIndices[i]] += 1;
        }
        
        let appearanceCounts = new Array(M).fill(0); // actual appearance counts
        let boards = [];
        let boardsSet = new Set();
        
        let success = true;
        for (let bIdx = 0; bIdx < N; bIdx++) {
            let boardFound = false;
            for (let retry = 0; retry < maxRetries; retry++) {
                // Calculate randomized priority scores
                // Score = remaining capacity + random noise
                let scores = [];
                for (let j = 0; j < M; j++) {
                    let rem = capacities[j] - appearanceCounts[j];
                    let noise = Math.random() * (0.5 + retry * 0.5);
                    scores.push({ score: rem + noise, index: j });
                }
                
                // Sort descending by score
                scores.sort((a, b) => b.score - a.score);
                
                // Select top K elements and sort indices to make a unique board representation
                let candidateBoard = scores.slice(0, K).map(x => x.index).sort((a, b) => a - b);
                let boardKey = candidateBoard.join(',');
                
                const forceUnique = !allowDuplicates || (boardsSet.size < totalCombinations && retry < maxRetries - 5);
                const isUnique = !boardsSet.has(boardKey);
                
                if (isUnique || !forceUnique) {
                    boards.push(candidateBoard);
                    boardsSet.add(boardKey);
                    
                    // Update appearance counts
                    for (let img of candidateBoard) {
                        appearanceCounts[img]++;
                    }
                    boardFound = true;
                    break;
                }
            }
            
            if (!boardFound) {
                // Stuck, restart entire generation
                success = false;
                break;
            }
        }
        
        if (success) {
            // Calculate max deviation from targets
            let maxDev = 0;
            for (let j = 0; j < M; j++) {
                let dev = Math.abs(appearanceCounts[j] - capacities[j]);
                if (dev > maxDev) {
                    maxDev = dev;
                }
            }
            return {
                boards: boards,
                counts: appearanceCounts,
                targets: capacities,
                maxDeviation: maxDev
            };
        }
    }
    
    throw new Error(
        "נכשלו ניסיונות ייצור לוחות מאוזנים לאחר מספר רב של אתחולים. " +
        "אנא נסה להעלות תמונות נוספות או להקטין את מספר המשתתפים."
    );
}
