# HTML5 Ad Preview Tool

The **HTML5 Ad Preview Tool** is a lightweight web application designed to help digital advertisers, designers, and developers preview and validate HTML5 ad creatives packaged as ZIP files. It provides an intuitive interface to quickly render ads, verify their dimensions, check for common ad standards, and ensure that key tracking elements like `clickTag` are present.

---

## Features

- **Drag & Drop or File Select:** Easily upload one or multiple ZIP files containing HTML5 ad creatives.
- **ZIP Extraction:** Uses [JSZip](https://stuk.github.io/jszip/) to extract the contents of ZIP files directly in the browser, with no server-side processing.
- **Ad Rendering:** Renders the main HTML file inside a responsive iframe, allowing you to preview how the ad will appear.
- **Validation Checks:** Automatically runs a set of common validations including:
  - **File Size Check:** Ensures the ZIP file size is less than or equal to 150KB, a common ad network requirement.
  - **Dimension Validation:** Verifies the ad’s rendered width and height against standard IAB ad sizes.
  - **clickTag Detection:** Checks if the ad contains the required `clickTag` variable or function for proper click tracking.
  - **Meta Tag Size Validation:** Ensures the ad's `<meta name="ad.size" content="width=...,...">` tag matches IAB standards and corresponds to the rendered size.
- **Theme Toggle:** Switch between light and dark modes for better readability and comfort.
- **User Feedback:** Displays clear pass/fail checklists for each uploaded ad to quickly identify issues.

---

## How It Works

1. **Uploading Ads:** Users drag and drop ZIP files or select them via a file dialog.
2. **Extracting Content:** The tool uses JSZip to read the ZIP archive and extract all files.
3. **Identifying Main HTML:** It looks for the primary HTML file (typically ending with `.html`) within the ZIP.
4. **Asset Mapping:** Relative URLs (`src` and `href`) inside the HTML are replaced with `Blob` URLs created from extracted assets so the ad renders correctly inside the iframe.
5. **Rendering:** The HTML content is loaded into an iframe wrapped inside a responsive container.
6. **Validations:** When the iframe loads, JavaScript reads its dimensions and runs validation checks against predefined criteria.
7. **Results Display:** Pass/fail results for each check are shown in a checklist under the preview.

---

## Supported IAB Ad Sizes

The tool validates ad dimensions against the following standard sizes:

- 300×250 (Medium Rectangle)
- 728×90 (Leaderboard)
- 160×600 (Wide Skyscraper)
- 300×600 (Half Page)
- 970×250 (Billboard)
- 336×280 (Large Rectangle)
- 320×50 (Mobile Leaderboard)
- 300×50 (Mobile Banner)
- 468×60 (Banner)
- 250×250 (Square)
- 200×200 (Small Square)
- 120×600 (Skyscraper)
- 180×150 (Rectangle)
- 234×60 (Half Banner)

---

## Usage Instructions

1. **Open the tool in your browser.**
2. **Drag & drop one or more ZIP files** containing your HTML5 ads into the designated drop area or click it to open the file selector.
3. The tool extracts and renders each ad inside an iframe preview.
4. Below each preview, view the checklist to see validation results.
5. Use the **Light/Dark Mode toggle** button to switch themes if needed.
6. Fix any validation errors found and re-upload your ZIP file to confirm.

---

## ZIP File Requirements

- Must contain at least one HTML file as the main ad creative.
- Assets like images, CSS, JS referenced inside the HTML should be included in the ZIP.
- Paths inside the HTML should be relative (e.g., `./images/banner.png`) for correct mapping.
- The ad HTML should include a `clickTag` variable or function for proper click tracking.
- Ideally include a meta tag with the ad size, e.g.:

  ```html
  <meta name="ad.size" content="width=300,height=250">
