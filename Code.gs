/**
 * Spring Hockey Application - Google Sheets receiver
 *
 * IMPORTANT: Open the destination Google spreadsheet, then choose
 * Extensions > Apps Script and paste this code into its bound script project.
 * The script writes to the first tab in that spreadsheet.
 */

const APPLICATION_HEADERS = [
  "Submitted At",
  "Player Name",
  "Birth Year",
  "Position",
  "Height",
  "Weight",
  "Parent Name",
  "Phone Number",
  "Email",
  "City",
  "State",
  "Player Type",
  "Current Team"
];

function doGet() {
  return ContentService
    .createTextOutput("Spring Hockey Application endpoint is ready.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No application data received.");
    }

    const data = JSON.parse(e.postData.contents);

    // Basic server-side validation; never rely only on browser validation.
    const required = [
      "playerName", "birthYear", "position", "parentName",
      "phone", "email", "city", "state", "playerType", "currentTeam"
    ];
    required.forEach(function (key) {
      if (!String(data[key] || "").trim()) {
        throw new Error("Missing required field: " + key);
      }
    });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) {
      throw new Error("Invalid email address.");
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) throw new Error("This script must be bound to the destination spreadsheet.");

    const sheet = spreadsheet.getSheets()[0];
    const headers = ensureHeaders_(sheet);
    const now = new Date();

    const valuesByHeader = {
      "Submitted At": now,
      "Player Name": safeCell_(data.playerName),
      "Birth Year": safeCell_(data.birthYear),
      "Position": safeCell_(data.position),
      "Height": safeCell_(data.height),
      "Weight": safeCell_(data.weight),
      "Parent Name": safeCell_(data.parentName),
      "Phone Number": safeCell_(data.phone),
      "Email": safeCell_(data.email),
      "City": safeCell_(data.city),
      "State": safeCell_(data.state),
      "Player Type": safeCell_(data.playerType),
      "Current Team": safeCell_(data.currentTeam)
    };

    const row = headers.map(function (header) {
      return Object.prototype.hasOwnProperty.call(valuesByHeader, header)
        ? valuesByHeader[header]
        : "";
    });

    sheet.appendRow(row);
    return jsonResponse_({ ok: true, message: "Application received." });
  } catch (error) {
    return jsonResponse_({ ok: false, message: String(error.message || error) });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function ensureHeaders_(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const firstRow = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  const hasHeaders = firstRow.some(function (value) { return String(value).trim() !== ""; });

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, APPLICATION_HEADERS.length).setValues([APPLICATION_HEADERS]);
    sheet.setFrozenRows(1);
    return APPLICATION_HEADERS.slice();
  }

  const headers = firstRow.map(function (value) { return String(value).trim(); });
  APPLICATION_HEADERS.forEach(function (requiredHeader) {
    if (headers.indexOf(requiredHeader) === -1) {
      headers.push(requiredHeader);
      sheet.getRange(1, headers.length).setValue(requiredHeader);
    }
  });
  sheet.setFrozenRows(1);
  return headers;
}

function safeCell_(value) {
  const text = String(value == null ? "" : value).trim();
  // Prevent user-entered text from being interpreted as a spreadsheet formula.
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
