# Spring Hockey Application Website

This package contains:
- `index.html` — the public application page
- `styles.css` — responsive dark hockey styling
- `app.js` — form validation and submission
- `config.js` — the Google Apps Script endpoint setting
- `Code.gs` — the Google Apps Script that appends applications to your spreadsheet

## Important: the published spreadsheet URL is read-only

The `pubhtml` link is a published display view. A GitHub Pages website cannot write directly into it. This project uses a small Google Apps Script receiver that you authorize to write into the spreadsheet. The receiver runs under your Google account; applicants do not need spreadsheet edit access.

## 1. Add the receiver to your Google Sheet

1. Open the actual spreadsheet in Google Sheets while signed into the account that owns or can edit it. Use the normal editable spreadsheet URL, not the `pubhtml` published-view URL.
2. Select **Extensions → Apps Script**.
3. In the script editor, replace the contents of `Code.gs` with the code in this package's `Code.gs`.
4. Click **Save**.
5. Choose **Deploy → New deployment**.
6. Select the gear/type selector and choose **Web app**.
7. Set **Execute as** to **Me**.
8. Set **Who has access** to **Anyone** (or the equivalent public/anonymous access option shown for your account).
9. Click **Deploy**, approve the requested Google permissions, and copy the Web app URL. It should end in `/exec`.

The script writes to the first tab in the spreadsheet. It adds any missing application column headers to row 1 and appends each submission as a new row. If the first tab already contains headers, it keeps those columns and adds any missing required headers.

## 2. Connect the website to the receiver

1. Open `config.js`.
2. Replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with the `/exec` URL you copied.
3. Save the file.

Do not put passwords, private keys, or Google account credentials in `config.js`.

## 3. Publish on GitHub Pages

1. Create a GitHub repository, for example `spring-hockey-application`.
2. Upload `index.html`, `styles.css`, `app.js`, and `config.js` to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. Wait for GitHub Pages to publish and open the website URL.

`Code.gs` is for the Google Apps Script editor. It does not need to be uploaded to the public GitHub repository unless you want to keep a backup there.

## 4. Test before sharing

1. Open the GitHub Pages site in a private/incognito browser window.
2. Submit a test application using test contact information.
3. Open the Google Sheet and confirm a new row appears on the first tab.
4. Delete the test row if appropriate.

**Browser response note:** GitHub Pages sends the form to Google's Apps Script endpoint using a cross-origin `no-cors` request. This is compatible with Apps Script's redirecting response, but the browser cannot read Google's response body. A successful network handoff displays the confirmation message; always verify the first test row in the spreadsheet before distributing the application link.

## Form fields

Player Name, Birth Year, Position, Height, Weight, Parent Name, Phone Number, Email, City, State, Player Type, Current Team.

Birth year options are generated for a broad 12-year range (current year minus 19 through current year minus 8). If you want a narrower range, edit the year loop in `app.js`. Player Type options can be changed directly in `index.html`.

## Operational notes

- The form includes browser-side required-field checks and basic server-side validation.
- A hidden honeypot field filters basic automated spam.
- The Apps Script uses a lock to avoid simultaneous submissions colliding.
- Anyone with the public form URL can submit an application. Keep the receiver limited to appending these fields; do not add privileged operations to this public endpoint.
- The external team logo URL is used as supplied. For reliability, consider downloading an approved team logo image and committing it into this repository as `team-logo.png`, then changing the image `src` in `index.html` to `team-logo.png`.
