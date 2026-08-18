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

    var birthDateRaw = getValue(e, 'birth_date');
    var formatovanyDatumNarodenia = "";
    var vypocitanyVek = "";

    if (!birthDateRaw) {
      throw new Error('Datum narodenia je povinny.');
    }

    var birthDateParts = parseBirthDate(birthDateRaw);
    if (!birthDateParts) {
      throw new Error('Neplatny datum narodenia: ' + birthDateRaw);
    }

    var today = new Date();
    var age = today.getFullYear() - birthDateParts.year;
    var monthDifference = (today.getMonth() + 1) - birthDateParts.month;
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateParts.day)) {
      age--;
    }
    vypocitanyVek = age;
    formatovanyDatumNarodenia = padTwoDigits(birthDateParts.day) + '.' +
      padTwoDigits(birthDateParts.month) + '.' + birthDateParts.year;

    // Čas odoslania z webu (Slovenský formát)
    var submittedAtRaw = getValue(e, 'submitted_at');
    var formatovanyCasOdoslania = "";
    if (submittedAtRaw) {
      var dateObj = new Date(submittedAtRaw);
      if (!isNaN(dateObj.getTime())) {
        formatovanyCasOdoslania = Utilities.formatDate(dateObj, "Europe/Bratislava", "dd.MM.yyyy HH:mm:ss");
      }
    }

    // OŠETRENIE TELEFÓNNEHO ČÍSLA (Pridanie apostrofu zabráni #ERROR! chybe)
    var rawPhone = getValue(e, 'phone');
    var bezpecnyTelefon = rawPhone ? "'" + rawPhone : "";

    // PRESNÉ PORADIE STĹPCOV V TABUĽKE (A až H)
    var row = [
      getValue(e, 'parent_name'),     // A: Meno rodiča
      getValue(e, 'child_name'),      // B: Meno dieťaťa
      formatovanyDatumNarodenia,      // C: Dátum narodenia
      vypocitanyVek,                  // D: Vek
      bezpecnyTelefon,                // E: Telefón (Teraz už bezpečne ako text)
      getValue(e, 'email'),           // F: Email
      getValue(e, 'city'),            // G: Mesto
      formatovanyCasOdoslania         // H: Odoslané
    ];

    sheet.appendRow(row);

    // KÓD NA ODOSLANIE EMAILU
    var emailTo = "info@matikaplus.sk";
    var subject = "Nová registrácia z webu: " + getValue(e, 'child_name');
    var body = "Na webe pribudla nová registrácia:\n\n" +
               "Meno rodiča: " + getValue(e, 'parent_name') + "\n" +
               "Meno dieťaťa: " + getValue(e, 'child_name') + "\n" +
               "Dátum narodenia: " + formatovanyDatumNarodenia + " (Vek: " + vypocitanyVek + ")\n" +
               "Telefón: " + rawPhone + "\n" +
               "Email: " + getValue(e, 'email') + "\n" +
               "Mesto: " + getValue(e, 'city') + "\n" +
               "Čas odoslania: " + formatovanyCasOdoslania + "\n\n" +
               "Odkaz na tabuľku: https://google.com" + SPREADSHEET_ID;
               
    GmailApp.sendEmail(emailTo, subject, body);

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
  return ContentService
    .createTextOutput('Apps Script bezi. Pouzi POST z formulara.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getValue(e, key) {
  if (!e || !e.parameter) return '';
  var value = e.parameter[key];
  return value === undefined || value === null ? '' : value;
}

function parseBirthDate(value) {
  var match = String(value).trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;

  var day = Number(match[1]);
  var month = Number(match[2]);
  var year = Number(match[3]);
  var date = new Date(year, month - 1, day, 12);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return { day: day, month: month, year: year };
}

function padTwoDigits(value) {
  return value < 10 ? '0' + value : String(value);
}