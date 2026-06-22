/**
 * Builds a PowerPoint (.pptx) presentation containing A5 Bingo boards side-by-side.
 * Runs entirely client-side using PPTXGenJS.
 * 
 * @param {object} gameData - The generated game output from balancing logic
 * @param {number} gridRows - Number of rows (3)
 * @param {number} gridCols - Number of columns (3 or 4)
 * @returns {Promise<void>} Resolves when the presentation file is created and triggered for download
 */
function buildBingoPptx(gameData, gridRows, gridCols) {
    return new Promise((resolve, reject) => {
        try {
            const title = gameData.title;
            const boards = gameData.boards;
            const questions = gameData.questions;
            
            // 1. Create a new presentation instance
            let pptx = new PptxGenJS();
            pptx.rtlMode = true;
            
            // 2. Define custom A4 Landscape layout in inches (29.7cm x 21.0cm)
            // 29.7 cm / 2.54 = 11.69 inches
            // 21.0 cm / 2.54 = 8.27 inches
            pptx.defineLayout({
                name: 'A4_LANDSCAPE',
                width: 11.69,
                height: 8.27
            });
            pptx.layout = 'A4_LANDSCAPE';
            
            const numBoards = boards.length;
            const numSlides = Math.ceil(numBoards / 2);
            
            // Dimensions in inches
            const a5Width = 5.85;  // 14.85 cm
            const cardMargin = 0.31; // ~0.8 cm
            const cardWidth = a5Width - (2 * cardMargin); // 5.22 inches (~13.25 cm)
            const cardHeight = 8.27 - (2 * cardMargin);  // 7.65 inches (~19.4 cm)
            
            // Loop through slide by slide
            for (let sIdx = 0; sIdx < numSlides; sIdx++) {
                let slide = pptx.addSlide();
                
                // Add up to 2 boards on this slide (left and right)
                for (let bPos = 0; bPos < 2; bPos++) {
                    const boardIdx = sIdx * 2 + bPos;
                    if (boardIdx >= numBoards) break;
                    
                    const offsetX = bPos * a5Width;
                    const cardLeft = offsetX + cardMargin;
                    const cardTop = cardMargin;
                    
                    // A. Draw card container (Rounded rectangle) - white background with grey border
                    slide.addShape(pptx.ShapeType.roundRect, {
                        x: cardLeft, y: cardTop, w: cardWidth, h: cardHeight,
                        fill: { color: 'FFFFFF' },
                        line: { color: 'B4B4B4', width: 1.5 }
                    });
                    
                    // B. Draw Hebrew Title (RTL support, Right aligned, Nice Font, Auto-Shrink on Overflow)
                    const titleLeft = cardLeft + 0.24; // ~0.6 cm
                    const titleTop = cardTop + 0.24;
                    const titleWidth = cardWidth - 0.48;
                    const titleHeight = 0.47; // ~1.2 cm
                    
                    slide.addText(`${title} - לוח ${boardIdx + 1}`, {
                        x: titleLeft, y: titleTop, w: titleWidth, h: titleHeight,
                        fontSize: 16,
                        bold: true,
                        color: '323232',
                        align: 'right',
                        rtlMode: true,
                        fontFace: 'Segoe UI',
                        fit: 'shrink'
                    });
                    
                    // C. Calculate available grid space
                    const availLeft = cardLeft + 0.24;
                    const availTop = titleTop + titleHeight + 0.16; // ~0.4 cm gap
                    const availWidth = cardWidth - 0.48;
                    const availHeight = cardHeight - 0.24 - titleHeight - 0.16 - 0.24;
                    
                    // D. Calculate cell size to fill the available space completely (non-square grid)
                    const cellWidth = availWidth / gridCols;
                    const cellHeight = availHeight / gridRows;
                    
                    const gridLeft = availLeft;
                    const gridTop = availTop;
                    
                    // E. Generate cells and place images
                    const boardQuestions = boards[boardIdx];
                    for (let r = 0; r < gridRows; r++) {
                        for (let c = 0; c < gridCols; c++) {
                            const cellLeft = gridLeft + c * cellWidth;
                            const cellTop = gridTop + r * cellHeight;
                            
                            // Draw cell border
                            slide.addShape(pptx.ShapeType.rect, {
                                x: cellLeft, y: cellTop, w: cellWidth, h: cellHeight,
                                fill: { color: 'FFFFFF' },
                                line: { color: '787878', width: 1.5 }
                            });
                            
                            // Get image data
                            const qIdx = boardQuestions[r * gridCols + c];
                            const q = questions[qIdx];
                            
                            // Calculate picture bounding box with 8% padding inside the cell
                            const paddingX = cellWidth * 0.08;
                            const paddingY = cellHeight * 0.08;
                            const targetW = cellWidth - (2 * paddingX);
                            const targetH = cellHeight - (2 * paddingY);
                            
                            // Fit image maintaining aspect ratio
                            const aspect = q.aspectRatio || 1.0;
                            let w = targetW;
                            let h = targetW / aspect;
                            if (h > targetH) {
                                h = targetH;
                                w = targetH * aspect;
                            }
                            
                            // Center inside cell
                            const imgLeft = cellLeft + paddingX + (targetW - w) / 2;
                            const imgTop = cellTop + paddingY + (targetH - h) / 2;
                            
                            // Add image to slide
                            slide.addImage({
                                data: q.image_data,
                                x: imgLeft, y: imgTop, w: w, h: h
                            });
                        }
                    }
                }
            }
            
            // 3. Save / Download presentation file
            const fileTitleClean = title.replace(/\s+/g, '_');
            pptx.writeFile({ fileName: `bingo_${fileTitleClean}.pptx` })
                .then(() => resolve())
                .catch(err => reject(err));
                
        } catch (error) {
            reject(error);
        }
    });
}
