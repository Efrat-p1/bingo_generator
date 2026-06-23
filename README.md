# מחולל לוחות בינגו תמונות בעיצוב אישי 🎲 (Serverless Web App)

מערכת אינטראנט מתקדמת ומודרנית (HTML5, CSS3, JavaScript ES6) ליצירת לוחות בינגו מבוססי תמונות בעיצוב אישי. 
היישום פועל **בצד הלקוח בלבד (Client-Side Only)** ללא צורך בשרת, ומיועד להפעלה מהירה מקומית או לפריסה חינמית ב-**GitHub Pages**.
מיועד במיוחד לפעילויות לילדים, גנים, בתי ספר וימי הולדת (מתאים גם לילדים שטרם למדו לקרוא).

---

## ✨ תכונות עיקריות

1. **תמיכה דו-לשונית מלאה**: ממשק המשתמש תומך במעבר מהיר ובולט בין עברית (RTL) לאנגלית (LTR). המערכת שומרת את בחירת השפה של המשתמש בדפדפן.
2. **פרטיות מוחלטת (Privacy by Design)**: כל עיבוד התמונות, החיתוך, הדחיסה ואלגוריתמי הערבוב מבוצעים במחשב של המשתמש בלבד. התמונות שלכם לא נשמרות ולא מועלות לאף שרת חיצוני!
3. **אלגוריתם איזון מתמטי**: חלוקת תמונות מאוזנת וסטטיסטית על גבי הלוחות. חישוב מדויק של מספר הקומבינטוריקה האפשרי (\(C(n, k)\)) למניעת חזרתיות של לוחות זהים.
4. **כיווץ תמונות אוטומטי (Performance Optimization)**: שינוי גודל תמונות בזיכרון ל-400px (באמצעות Canvas) מבלי לפגוע ביחס הגובה-רוחב המקורי שלהן, למניעת קריסות זיכרון בעבודה עם קבצים כבדים.
5. **ייצוא לפורמטים מרובים**:
   * **PowerPoint (PPTX)** - מצגת ניתנת לעריכה עם תמונות וקטוריות ממורכזות ומיושרות, בהתאמה אוטומטית לכיווניות השפה הפעילה (RTL בעברית ו-LTR באנגלית).
   * **מסמך PDF** - הפקה מהירה להדפסה ישירה באיכות גבוהה, מוגנת מתיחות (שמירה מלאה על פרופורציות התמונות בשיטת CSS Absolute Centering) ותרגום דינמי של תוויות לוח.
6. **שליטה על פריסת ההדפסה**: אפשרות לבחור בין 1, 2, 4 או 6 לוחות בדף A4 בודד (התאמה אוטומטית של אוריינטציית הדף לאורך/רוחב, שינוי קנה המידה של השוליים, והגבלת אורך כותרת המשחק ל-35 תווים למניעת גלישת טקסט).
7. **תצוגה מקדימה עשירה**: מאפשרת לדפדף דף-אחר-דף ולראות בדיוק כיצד הלוחות יודפסו עוד לפני ההורדה.
8. **איסוף משוב ל-Google Sheets**: טופס דירוג בכוכבים וכתיבת הערות השולח את הנתונים ישירות לגיליון אקסל בענן.
9. **מעקב כניסות**: חיבור מובנה ל-Google Analytics (GA4) לניתוח כמות המשתמשים שנכנסו לאתר.

---

## 🚀 איך להריץ מקומית?

אין צורך בהתקנת ספריות או הרצת שרתים (כמו Node.js או Python).
1. הורידו את קבצי הפרויקט למחשב.
2. לחצו לחיצה כפולה על הקובץ **`index.html`** כדי לפתוח אותו ישירות בדפדפן האינטרנט שלכם.

---

## 🌐 פריסה חינמית ב-GitHub Pages

כדי להעלות את הפרויקט לרשת כאתר אינטרנט ציבורי שנגיש מכל מכשיר:

1. פתחו רפוזיטורי (Repository) חדש ב-**GitHub** והגדירו אותו כ-**Public**.
2. העלו את כל קבצי הפרויקט (`index.html`, תיקיות `css/` ו-`js/`).
3. היכנסו להגדרות הרפוזיטורי (**Settings**) -> בתפריט הצדדי בחרו ב-**Pages**.
4. תחת **Build and deployment**, בחרו בתוך **Branch** את הענף `main` (או `master`) ולחצו על **Save**.
5. תוך דקה האתר שלכם יהיה זמין בכתובת:  
   `https://[username].github.io/[repository-name]/`

---

## 📊 הגדרת טופס המשוב מול Google Sheets

האתר מאפשר למשתמשים לשלוח משוב ישירות לגיליון גוגל שיטס שלכם. אם הקישור לא מוגדר, המשוב יישמר זמנית ב-LocalStorage של הדפדפן לצורכי בדיקה.

### שלבי הגדרה:
1. פתחו גיליון Google Sheets חדש בחשבון ה-Google שלכם.
2. הגדירו את כותרות העמודות בשורה הראשונה בדיוק כך:
   * עמודה A: `Timestamp`
   * עמודה B: `Stars`
   * עמודה C: `Comment`
   * עמודה D: `GameTitle`
   * עמודה E: `BoardsCount`
3. בתפריט העליון, היכנסו אל **Extensions** (הרחבות) -> **Apps Script**.
4. מחקו את הקוד הקיים והדביקו את קוד ה-JavaScript הבא:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),
      data.stars,
      data.comment,
      data.title,
      data.boardsCount
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

5. לחצו על כפתור השמירה (אייקון של דיסקט).
6. לחצו על **Deploy** (פריסה) -> **New deployment** (פריסה חדשה).
7. לחצו על גלגל השיניים של סוג הפריסה ובחרו ב-**Web app**.
8. תחת ההגדרות:
   * **Execute as**: בחרו ב-**Me** (החשבון שלכם).
   * **Who has access**: בחרו ב-**Anyone** (חיוני כדי שהדפדפנים של המשתמשים יוכלו לשלוח נתונים ללא הרשאות כניסה).
9. לחצו על **Deploy** ואשרו את ההרשאות המבוקשות (Authorize Access).
10. העתיקו את ה-**Web app URL** שקיבלתם.
11. פתחו את הקובץ [js/app.js](file:///c:/Users/Efrat/projects/81_antigravity_tests/2_bingo_generator/js/app.js) בשורה 2, והחליפו את כתובת ה-URL במשתנה `GOOGLE_SCRIPT_URL`:
    ```javascript
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/הקישור_החדש_שלכם/exec";
    ```
12. שמרו את הקובץ והעלו את העדכון ל-GitHub.

---

## 📈 הגדרת Google Analytics 4 (GA4)

כדי לקבל סטטיסטיקות על כמות המשתמשים שנכנסו לאתר שלכם:
1. הקימו נכס חדש ב-Google Analytics והפיקו מזהה מעקב (Measurement ID) שמתחיל ב-`-G` (לדוגמה: `G-XXXXXX`).
2. פתחו את הקובץ [index.html](file:///c:/Users/Efrat/projects/81_antigravity_tests/2_bingo_generator/index.html).
3. בשורות 28 ו-33, החליפו את המזהה הקיים במזהה המעקב שלכם.
4. שמרו והעלו את העדכון ל-GitHub.

---

## 📁 מבנה קבצים והרחבה

למידע מפורט על ארכיטקטורת המערכת, קראו את הקובץ [ARCHITECTURE.md](file:///c:/Users/Efrat/projects/81_antigravity_tests/2_bingo_generator/ARCHITECTURE.md).

================================================================================

# Custom Picture Bingo Generator 🎲 (Serverless Web App)

An advanced and modern client-side web application (HTML5, CSS3, JavaScript ES6) to create custom, printable picture bingo boards using your own uploaded images.
The application runs **entirely client-side (no server required)**. It can be run locally by opening the HTML file or deployed for free on **GitHub Pages**.
Perfect for kids, classroom vocabulary building, preschool activities, birthday parties, and family game nights (no reading skills required!).

---

## ✨ Key Features

1. **Full Bilingual Support**: The user interface supports a clear and prominent toggle between English (LTR) and Hebrew (RTL), preserving the user's preference in the browser's storage.
2. **Absolute Privacy (Privacy by Design)**: All image processing, canvas resizing, compression, and shuffling algorithms are executed in-memory on the user's computer. Your photos are never saved or uploaded to any server!
3. **Mathematical Balancing Algorithm**: Distributes images evenly and statistically across the boards. Computes combinations count (\(C(n, k)\)) to analyze uniqueness and alert on potential duplicates.
4. **Automatic Image Compression**: Resizes photos in-memory to 400px (via Canvas) while preserving original aspect ratios, avoiding browser crashes when handling large photos.
5. **Multi-Format Export Support**:
   * **PowerPoint (PPTX)** - Editable presentation with vector-positioned cells and images, automatically adapting layout directions (RTL vs LTR) and titles based on the active language.
   * **PDF Document** - High-quality, printable sheets. Aspect ratios are protected using CSS absolute centering, with dynamic translation of board headers.
6. **Custom Print Layouts**: Choose from 1, 2, 4, or 6 boards per A4 page. Page orientation (Portrait/Landscape), card scaling, margins, and title size adjust automatically. Game titles are limited to 35 characters to prevent overlap.
7. **Live Interactive Preview**: Page-by-page browser preview lets you inspect the final print layout before downloading.
8. **Feedback Form Integration**: Submit star ratings and suggestions directly to your cloud Google Sheets spreadsheet.
9. **Traffic Analytics**: Built-in integration for Google Analytics (GA4) to monitor page views and interactions.

---

## 🚀 How to Run Locally?

No need to install dependencies, databases, or local servers (no Node.js or Python required).
1. Download the repository files to your computer.
2. Double-click the **`index.html`** file to open the generator directly in your web browser.

---

## 🌐 Free Deployment on GitHub Pages

To make the application publicly available on the web:

1. Create a new repository on **GitHub** and set it to **Public**.
2. Upload the project files (`index.html`, `css/`, and `js/` folders).
3. Go to the repository **Settings** -> select **Pages** from the sidebar.
4. Under **Build and deployment**, select the `main` (or `master`) branch and click **Save**.
5. Within a minute, your site will be live at:  
   `https://[username].github.io/[repository-name]/`

---

## 📊 Setting Up Feedback Form with Google Sheets

The app allows users to submit reviews directly to your Google Sheets. If the script URL is not configured, the feedback is saved locally in the browser's `LocalStorage`.

### Configuration Steps:
1. Open a new Google Sheet in your Google account.
2. Set the column headers in the first row exactly as follows:
   * Column A: `Timestamp`
   * Column B: `Stars`
   * Column C: `Comment`
   * Column D: `GameTitle`
   * Column E: `BoardsCount`
3. In the top menu, go to **Extensions** -> **Apps Script**.
4. Delete the default template and paste the following JavaScript code:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),
      data.stars,
      data.comment,
      data.title,
      data.boardsCount
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

5. Click the save icon.
6. Click **Deploy** -> **New deployment**.
7. Click the gear icon next to Select type and choose **Web app**.
8. Configure options:
   * **Execute as**: Select **Me** (your account).
   * **Who has access**: Select **Anyone** (required so browser clients can submit inputs without auth).
9. Click **Deploy** and complete the authorization prompt (Authorize Access).
10. Copy the generated **Web app URL**.
11. Open [js/app.js](file:///c:/Users/Efrat/projects/81_antigravity_tests/2_bingo_generator/js/app.js) line 2, and replace the variable `GOOGLE_SCRIPT_URL` with your link:
    ```javascript
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_NEW_LINK_HERE/exec";
    ```
12. Save the file and upload the update to GitHub.

---

## 📈 Setting Up Google Analytics 4 (GA4)

To get analytics reports on site traffic:
1. Set up a new property in Google Analytics and retrieve your Measurement ID starting with `-G` (e.g. `G-XXXXXX`).
2. Open [index.html](file:///c:/Users/Efrat/projects/81_antigravity_tests/2_bingo_generator/index.html).
3. In lines 28 and 33, replace the existing tag ID with your Measurement ID.
4. Save and commit your changes to GitHub.

---

## 📁 File Structure

For in-depth details about the algorithms, canvas resizing, and exporter architecture, refer to [ARCHITECTURE.md](file:///c:/Users/Efrat/projects/81_antigravity_tests/2_bingo_generator/ARCHITECTURE.md).
