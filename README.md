# מחולל לוחות בינגו תמונות בעיצוב אישי 🎲 (Serverless Web App)

מערכת אינטראנט מתקדמת ומודרנית (HTML5, CSS3, JavaScript ES6) ליצירת לוחות בינגו מבוססי תמונות בעיצוב אישי. 
היישום פועל **בצד הלקוח בלבד (Client-Side Only)** ללא צורך בשרת, ומיועד להפעלה מהירה מקומית או לפריסה חינמית ב-**GitHub Pages**.
מיועד במיוחד לפעילויות לילדים, גנים, בתי ספר וימי הולדת (מתאים גם לילדים שטרם למדו לקרוא).

---

## ✨ תכונות עיקריות

1. **פרטיות מוחלטת (Privacy by Design)**: כל עיבוד התמונות, החיתוך, הדחיסה ואלגוריתמי הערבוב מבוצעים במחשב של המשתמש בלבד. התמונות שלכם לא נשמרות ולא מועלות לאף שרת חיצוני!
2. **אלגוריתם איזון מתמטי**: חלוקת תמונות מאוזנת וסטטיסטית על גבי הלוחות. חישוב מדויק של מספר הקומבינטוריקה האפשרי (\(C(n, k)\)) למניעת חזרתיות של לוחות זהים.
3. **כיווץ תמונות אוטומטי (Performance Optimization)**: שינוי גודל תמונות בזיכרון ל-400px (באמצעות Canvas) מבלי לפגוע ביחס הגובה-רוחב המקורי שלהן, למניעת קריסות זיכרון בעבודה עם קבצים כבדים.
4. **ייצוא לפורמטים מרובים**:
   * **PowerPoint (PPTX)** - מצגת ניתנת לעריכה עם תמונות וקטוריות ממורכזות ומיושרות מימין לשמאל.
   * **מסמך PDF** - הפקה מהירה להדפסה ישירה באיכות גבוהה, מוגנת מתיחות (שמירה מלאה על פרופורציות התמונות בשיטת CSS Absolute Centering).
5. **שליטה על פריסת ההדפסה**: אפשרות לבחור בין 1, 2, 4 או 6 לוחות בדף A4 בודד (התאמה אוטומטית של אוריינטציית הדף לאורך/רוחב, שינוי קנה המידה של השוליים, והגבלת אורך כותרת המשחק ל-35 תווים למניעת גלישת טקסט).
6. **תצוגה מקדימה עשירה**: מאפשרת לדפדף דף-אחר-דף ולראות בדיוק כיצד הלוחות יודפסו עוד לפני ההורדה.
7. **איסוף משוב ל-Google Sheets**: טופס דירוג בכוכבים וכתיבת הערות השולח את הנתונים ישירות לגיליון אקסל בענן.
8. **מעקב כניסות**: חיבור מובנה ל-Google Analytics (GA4) לניתוח כמות המשתמשים שנכנסו לאתר.

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
3. בשורות 24 ו-29, החליפו את המזהה הקיים `G-WB2ELGG230` במזהה המעקב שלכם:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-הקוד_שלכם"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-הקוד_שלכם');
   </script>
   ```
4. שמרו והעלו את העדכון ל-GitHub.

---

## 📁 מבנה קבצים והרחבה

למידע מפורט על ארכיטקטורת המערכת, קראו את הקובץ [ARCHITECTURE.md](file:///c:/Users/Efrat/projects/81_antigravity_tests/2_bingo_generator/ARCHITECTURE.md).
