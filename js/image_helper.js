/**
 * Reads an uploaded image file, resizes it to a maximum of 400px
 * on its longest side while preserving its original aspect ratio (no cropping).
 * 
 * @param {File} file - The uploaded file object
 * @returns {Promise<object>} Promise resolving to { dataUrl, aspectRatio }
 */
function processImageFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const img = new Image();
            
            img.onload = function() {
                // Calculate scale dimensions keeping aspect ratio (max 400px)
                const maxDim = 400;
                let w = img.width;
                let h = img.height;
                const aspectRatio = w / h;
                
                if (w > h) {
                    if (w > maxDim) {
                        h = Math.round((h * maxDim) / w);
                        w = maxDim;
                    }
                } else {
                    if (h > maxDim) {
                        w = Math.round((w * maxDim) / h);
                        h = maxDim;
                    }
                }
                
                // Create a canvas with the scaled dimensions
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                
                // Draw the entire image onto the canvas (no cropping)
                ctx.drawImage(img, 0, 0, w, h);
                
                // Export canvas content as base64 PNG Data URL
                try {
                    const dataUrl = canvas.toDataURL('image/png');
                    resolve({
                        dataUrl: dataUrl,
                        aspectRatio: aspectRatio
                    });
                } catch (err) {
                    reject(new Error("כשל בקידוד התמונה ל-Base64."));
                }
            };
            
            img.onerror = function() {
                reject(new Error("לא ניתן היה לפענח את קובץ התמונה. ודא שהקובץ תקין."));
            };
            
            img.src = event.target.result;
        };
        
        reader.onerror = function() {
            reject(new Error("כשל בקריאת הקובץ מהדיסק."));
        };
        
        reader.readAsDataURL(file);
    });
}
