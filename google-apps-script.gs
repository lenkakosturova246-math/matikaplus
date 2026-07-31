// @ts-nocheck
function doPost(e) {
  try {
    var SPREADSHEET_ID = '1qj5buwkU5Z79Ul2XOWCqrOhNmwsyyDydcw0mlRchCtA';
    var SHEET_NAME = 'Web registracie';

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }

    var headers = [
      'Timestamp',
      'Meno rodiča',
      'Meno dieťaťa',
      'Dátum narodenia',
      'Telefón',
      'Email',
      'Mesto',
      'Zdroj',
      'Odoslané'
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }

    var row = [
      new Date(),
      getValue(e, 'parent_name'),
      getValue(e, 'child_name'),
      getValue(e, 'birth_date'),
      getValue(e, 'phone'),
      getValue(e, 'email'),
      getValue(e, 'city'),
      getValue(e, 'source'),
      getValue(e, 'submitted_at')
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  var SPREADSHEET_ID = '1qj5buwkU5Z79Ul2XOWCqrOhNmwsyyDydcw0mlRchCtA';
  var SHEET_NAME = 'Web registracie';

  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        spreadsheetName: ss.getName(),
        sheetFound: !!sheet,
        sheetName: SHEET_NAME,
        lastRow: sheet ? sheet.getLastRow() : null
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput('Apps Script bezi. Pouzi POST z formulara.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getValue(e, key) {
  if (!e || !e.parameter) return '';
  var value = e.parameter[key];
  return value === undefined || value === null ? '' : value;
}
