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

    // Spracovanie dátumu narodenia a výpočet veku
    if (birthDateRaw) {
      var birthDate = new Date(birthDateRaw);
      if (!isNaN(birthDate.getTime())) {
        var today = new Date();
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        vypocitanyVek = age;
        formatovanyDatumNarodenia = Utilities.formatDate(birthDate, "Europe/Bratislava", "dd.MM.yyyy");
      } else {
        formatovanyDatumNarodenia = birthDateRaw;
      }
    }

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