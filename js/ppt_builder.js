/**
 * Builds a PowerPoint (.pptx) presentation containing A5 Bingo boards side-by-side.
 * Runs entirely client-side using PPTXGenJS.
 * 
 * @param {object} gameData - The generated game output from balancing logic
 * @param {number} gridRows - Number of rows (3)
 * @param {number} gridCols - Number of columns (3 or 4)
 * @param {number} cardsPerPage - Number of cards per slide (1, 2, 4, 6)
 * @returns {Promise<void>} Resolves when the presentation file is created and triggered for download
 */
function buildBingoPptx(gameData, gridRows, gridCols, cardsPerPage = 2) {
    return new Promise((resolve, reject) => {
        try {
            const title = gameData.title;
            const boards = gameData.boards;
            const images = gameData.images;
            
            // 1. Create a new presentation instance
            let pptx = new PptxGenJS();
            pptx.rtlMode = true;
            
            // Determine orientation and slide layout sizes in inches
            let layoutName = 'A4_LANDSCAPE';
            let pageWidth = 11.69; // 29.7cm
            let pageHeight = 8.27; // 21.0cm
            
            if (cardsPerPage === 1 || cardsPerPage === 4) {
                layoutName = 'A4_PORTRAIT';
                pageWidth = 8.27;  // 21.0cm
                pageHeight = 11.69; // 29.7cm
            }
            
            pptx.defineLayout({
                name: layoutName,
                width: pageWidth,
                height: pageHeight
            });
            pptx.layout = layoutName;
            
            // Grid sizing on the page (columns and rows)
            let cols = 1, rows = 1;
            if (cardsPerPage === 2) { cols = 2; rows = 1; }
            else if (cardsPerPage === 4) { cols = 2; rows = 2; }
            else if (cardsPerPage === 6) { cols = 3; rows = 2; }
            
            const colWidth = pageWidth / cols;
            const rowHeight = pageHeight / rows;
            
            // Scale parameter configuration
            let margin = 0.5;
            let titleFontSize = 20;
            let titleHeight = 0.6;
            let titleGap = 0.2;
            let cellBorderWidth = 2.0;
            
            if (cardsPerPage === 2) {
                margin = 0.3;
                titleFontSize = 16;
                titleHeight = 0.45;
                titleGap = 0.15;
                cellBorderWidth = 1.5;
            } else if (cardsPerPage === 4) {
                margin = 0.2;
                titleFontSize = 12;
                titleHeight = 0.35;
                titleGap = 0.1;
                cellBorderWidth = 1.0;
            } else if (cardsPerPage === 6) {
                margin = 0.15;
                titleFontSize = 10;
                titleHeight = 0.28;
                titleGap = 0.08;
                cellBorderWidth = 1.0;
            }
            
            const numBoards = boards.length;
            const numSlides = Math.ceil(numBoards / cardsPerPage);
            
            // Loop through slide by slide
            for (let sIdx = 0; sIdx < numSlides; sIdx++) {
                let slide = pptx.addSlide();
                
                // Add cards on this slide
                for (let i = 0; i < cardsPerPage; i++) {
                    const boardIdx = sIdx * cardsPerPage + i;
                    if (boardIdx >= numBoards) break;
                    
                    // Coordinates of this card partition on slide
                    const cIdx = i % cols;
                    const rIdx = Math.floor(i / cols);
                    
                    // Lay out slides from right-to-left (first card on the right)
                    const colIdxRTL = cols - 1 - cIdx;
                    const offsetX = colIdxRTL * colWidth;
                    const offsetY = rIdx * rowHeight;
                    
                    const cardLeft = offsetX + margin;
                    const cardTop = offsetY + margin;
                    const cardWidth = colWidth - (2 * margin);
                    const cardHeight = rowHeight - (2 * margin);
                    
                    // A. Draw card container (Rounded rectangle)
                    slide.addShape(pptx.ShapeType.roundRect, {
                        x: cardLeft, y: cardTop, w: cardWidth, h: cardHeight,
                        fill: { color: 'FFFFFF' },
                        line: { color: 'B4B4B4', width: 1.5 }
                    });
                    
                    // B. Draw Hebrew Title
                    const titleLeft = cardLeft + margin;
                    const titleTop = cardTop + margin;
                    const titleWidth = cardWidth - (2 * margin);
                    
                    slide.addText(`${title} - לוח ${boardIdx + 1}`, {
                        x: titleLeft, y: titleTop, w: titleWidth, h: titleHeight,
                        fontSize: titleFontSize,
                        bold: true,
                        color: '323232',
                        align: 'center',
                        rtlMode: true,
                        fontFace: 'Segoe UI',
                        fit: 'shrink'
                    });
                    
                    // C. Calculate available grid space
                    const gridLeft = cardLeft + margin;
                    const gridTop = titleTop + titleHeight + titleGap;
                    const gridWidth = cardWidth - (2 * margin);
                    const gridHeight = cardHeight - (2 * margin) - titleHeight - titleGap;
                    
                    // D. Calculate cell size
                    const cellWidth = gridWidth / gridCols;
                    const cellHeight = gridHeight / gridRows;
                    
                    // E. Generate cells and place images
                    const boardImages = boards[boardIdx];
                    for (let r = 0; r < gridRows; r++) {
                        for (let c = 0; c < gridCols; c++) {
                            // Lay out columns from right-to-left for proper Hebrew direction alignment
                            const colIdxRTL = gridCols - 1 - c;
                            const cellLeft = gridLeft + colIdxRTL * cellWidth;
                            const cellTop = gridTop + r * cellHeight;
                            
                            // Draw cell border
                            slide.addShape(pptx.ShapeType.rect, {
                                x: cellLeft, y: cellTop, w: cellWidth, h: cellHeight,
                                fill: { color: 'FFFFFF' },
                                line: { color: '787878', width: cellBorderWidth }
                            });
                            
                            // Get image data
                            const imgIdx = boardImages[r * gridCols + c];
                            const imgObj = images[imgIdx];
                            
                            // Bounding box with 3% padding inside the cell
                            const paddingX = cellWidth * 0.03;
                            const paddingY = cellHeight * 0.03;
                            const targetW = cellWidth - (2 * paddingX);
                            const targetH = cellHeight - (2 * paddingY);
                            
                            // Fit image maintaining aspect ratio
                            const aspect = imgObj.aspectRatio || 1.0;
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
                                data: imgObj.image_data,
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
