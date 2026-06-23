/**
 * Generates a PDF file containing the Bingo boards.
 * Runs client-side using html2pdf.js.
 * 
 * @param {object} gameData - The generated game output
 * @param {number} gridRows - Number of rows
 * @param {number} gridCols - Number of columns
 * @returns {Promise<void>} Resolves when the PDF generation completes
 */
function buildBingoPdf(gameData, gridRows, gridCols, cardsPerPage = 2) {
    return new Promise((resolve, reject) => {
        try {
            const title = gameData.title;
            const boards = gameData.boards;
            const questions = gameData.questions;
            
            // Create lookup map
            const questionsMap = {};
            questions.forEach(q => {
                questionsMap[q.id] = q;
            });
            
            // Orientation & layout setup
            let orientation = 'landscape';
            let pageWidth = '297mm';
            let pageHeight = '208mm'; // Safety reduction from 210mm
            let tempWidth = '297mm';
            
            if (cardsPerPage === 1 || cardsPerPage === 4) {
                orientation = 'portrait';
                pageWidth = '210mm';
                pageHeight = '295mm'; // Safety reduction from 297mm
                tempWidth = '210mm';
            }
            
            // Create a temporary container for rendering HTML pages completely in-memory
            const tempContainer = document.createElement('div');
            tempContainer.style.width = tempWidth;
            
            // Add a style block to reset margin/padding on the rendering body to prevent extra page overflows
            const styleEl = document.createElement('style');
            styleEl.innerHTML = `
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                }
            `;
            tempContainer.appendChild(styleEl);
            
            // Set dynamic grid columns & rows on page
            let cols = 1, rows = 1;
            if (cardsPerPage === 2) { cols = 2; rows = 1; }
            else if (cardsPerPage === 4) { cols = 2; rows = 2; }
            else if (cardsPerPage === 6) { cols = 3; rows = 2; }
            
            // Scale parameters based on layout density (cards per page)
            let cardPadding = '12mm';
            let containerPadding = '10mm';
            let titleFontSize = '22pt';
            let titleMargin = '6mm';
            let gridBorderWidth = '2.5pt';
            let cellPadding = '4%';
            
            if (cardsPerPage === 2) {
                cardPadding = '6mm';
                containerPadding = '6mm';
                titleFontSize = '16pt';
                titleMargin = '4mm';
                gridBorderWidth = '1.5pt';
                cellPadding = '3%';
            } else if (cardsPerPage === 4) {
                cardPadding = '4mm';
                containerPadding = '4mm';
                titleFontSize = '12pt';
                titleMargin = '3mm';
                gridBorderWidth = '1pt';
                cellPadding = '3%';
            } else if (cardsPerPage === 6) {
                cardPadding = '3mm';
                containerPadding = '3mm';
                titleFontSize = '10pt';
                titleMargin = '2mm';
                gridBorderWidth = '1pt';
                cellPadding = '2%';
            }
            
            const numBoards = boards.length;
            const numSlides = Math.ceil(numBoards / cardsPerPage);
            
            for (let sIdx = 0; sIdx < numSlides; sIdx++) {
                // A4 page container
                const pageEl = document.createElement('div');
                pageEl.style.width = pageWidth;
                pageEl.style.height = pageHeight;
                pageEl.style.display = 'grid';
                pageEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
                pageEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
                pageEl.style.boxSizing = 'border-box';
                pageEl.style.background = '#FFFFFF';
                
                // Add page break attribute for html2pdf
                if (sIdx < numSlides - 1) {
                    pageEl.style.pageBreakAfter = 'always';
                }
                
                // Render cells
                for (let i = 0; i < cardsPerPage; i++) {
                    const boardIdx = sIdx * cardsPerPage + i;
                    
                    if (boardIdx >= numBoards) {
                        const emptyCell = document.createElement('div');
                        emptyCell.style.background = '#FFFFFF';
                        pageEl.appendChild(emptyCell);
                        continue;
                    }
                    
                    const boardQuestions = boards[boardIdx];
                    
                    const cardEl = document.createElement('div');
                    cardEl.style.padding = cardPadding;
                    cardEl.style.boxSizing = 'border-box';
                    cardEl.style.display = 'flex';
                    cardEl.style.flexDirection = 'column';
                    cardEl.style.height = '100%';
                    cardEl.style.width = '100%';
                    
                    const cardContainer = document.createElement('div');
                    cardContainer.style.width = '100%';
                    cardContainer.style.height = '100%';
                    cardContainer.style.border = '1.5pt solid #B4B4B4';
                    cardContainer.style.borderRadius = '6mm';
                    cardContainer.style.padding = containerPadding;
                    cardContainer.style.boxSizing = 'border-box';
                    cardContainer.style.display = 'flex';
                    cardContainer.style.flexDirection = 'column';
                    cardContainer.style.background = '#FFFFFF';
                    
                    // Title
                    const titleEl = document.createElement('div');
                    titleEl.style.width = '100%';
                    titleEl.style.textAlign = 'center';
                    titleEl.style.fontSize = titleFontSize;
                    titleEl.style.fontWeight = 'bold';
                    titleEl.style.fontFamily = '"Segoe UI", Rubik, Arial, sans-serif';
                    titleEl.style.color = '#323232';
                    titleEl.style.whiteSpace = 'pre-line';
                    titleEl.style.display = '-webkit-box';
                    titleEl.style.webkitLineClamp = '2';
                    titleEl.style.webkitBoxOrient = 'vertical';
                    titleEl.style.overflow = 'hidden';
                    titleEl.style.textOverflow = 'ellipsis';
                    titleEl.style.lineHeight = '1.3';
                    titleEl.style.marginBottom = titleMargin;
                    titleEl.innerText = `${title} - לוח\u00A0${boardIdx + 1}`;
                    cardContainer.appendChild(titleEl);
                    
                    // Grid
                    const gridEl = document.createElement('div');
                    gridEl.style.flex = '1';
                    gridEl.style.display = 'flex';
                    gridEl.style.flexDirection = 'column';
                    gridEl.style.minHeight = '0';
                    gridEl.style.borderTop = `${gridBorderWidth} solid #787878`;
                    gridEl.style.borderLeft = `${gridBorderWidth} solid #787878`;
                    gridEl.style.boxSizing = 'border-box';
                    
                    for (let r = 0; r < gridRows; r++) {
                        const rowEl = document.createElement('div');
                        rowEl.style.display = 'flex';
                        rowEl.style.flexDirection = 'row';
                        rowEl.style.flex = '1';
                        rowEl.style.boxSizing = 'border-box';
                        rowEl.style.minHeight = '0';
                        
                        for (let c = 0; c < gridCols; c++) {
                            const cellEl = document.createElement('div');
                            cellEl.style.borderBottom = `${gridBorderWidth} solid #787878`;
                            cellEl.style.borderRight = `${gridBorderWidth} solid #787878`;
                            cellEl.style.display = 'flex';
                            cellEl.style.alignItems = 'center';
                            cellEl.style.justifyContent = 'center';
                            cellEl.style.flex = '1';
                            cellEl.style.padding = cellPadding;
                            cellEl.style.boxSizing = 'border-box';
                            cellEl.style.overflow = 'hidden';
                            cellEl.style.background = '#FFFFFF';
                            cellEl.style.minWidth = '0';
                            cellEl.style.minHeight = '0';
                            
                            const qIdx = boardQuestions[r * gridCols + c];
                            const q = questionsMap[qIdx];
                            
                            const imgEl = document.createElement('img');
                            imgEl.src = q.image_data;
                            imgEl.style.maxWidth = '100%';
                            imgEl.style.maxHeight = '100%';
                            imgEl.style.objectFit = 'contain';
                            
                            cellEl.appendChild(imgEl);
                            rowEl.appendChild(cellEl);
                        }
                        gridEl.appendChild(rowEl);
                    }
                    
                    cardContainer.appendChild(gridEl);
                    cardEl.appendChild(cardContainer);
                    pageEl.appendChild(cardEl);
                }
                tempContainer.appendChild(pageEl);
            }
            
            // Wait for all images in the temp container to load before running html2pdf
            const images = tempContainer.getElementsByTagName('img');
            const imagePromises = Array.from(images).map(img => {
                if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                return new Promise(resolveImg => {
                    img.onload = resolveImg;
                    img.onerror = resolveImg;
                    if (img.complete) resolveImg();
                });
            });

            Promise.all(imagePromises).then(() => {
                const fileTitleClean = title.replace(/\s+/g, '_');
                const opt = {
                    margin: 0,
                    filename: `bingo_${fileTitleClean}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2, 
                        useCORS: true, 
                        letterRendering: true, 
                        scrollY: 0, 
                        scrollX: 0
                    },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: orientation }
                };
                
                html2pdf().from(tempContainer).set(opt).save()
                    .then(() => {
                        resolve();
                    })
                    .catch(err => {
                        reject(err);
                    });
            }).catch(err => {
                reject(err);
            });
                
        } catch (error) {
            reject(error);
        }
    });
}
