// RSVP receiver for catherine-greg.com
// Paste into Extensions > Apps Script on the RSVP Google Sheet, then Deploy > New deployment > Web app
// (Execute as: Me, Who has access: Anyone). Copy the Web app URL into site/index.html (RSVP_ENDPOINT_URL).

var NOTIFY = 'katsia24@hotmail.com';   // who gets an email for each RSVP (comma-separate to add more)
var HEADERS = ['Received', 'First name', 'Last name', 'Email', 'Wedding (Jul 7)', 'Welcome reception (Jul 5)', 'Boat day (Jul 6)', 'Farewell luncheon (Jul 8)', 'Note'];

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.company) return ok_();                       // spam trap
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  var clean = function (v) { v = String(v || '').slice(0, 2000); return /^[=+\-@]/.test(v) ? "'" + v : v; };
  var row = [new Date(), clean(p.first_name), clean(p.last_name), clean(p.email),
             clean(p.wedding), clean(p.welcome), clean(p.boat), clean(p.farewell), clean(p.note)];
  sheet.appendRow(row);

  var name = (p.first_name + ' ' + p.last_name).trim();
  var lines = [
    'Name: ' + name,
    'Email: ' + p.email,
    '',
    'Wedding (Wed, Jul 7): ' + p.wedding,
    'Welcome reception (Mon, Jul 5): ' + p.welcome,
    'Boat day on Lipari (Tue, Jul 6): ' + p.boat,
    'Farewell luncheon (Thu, Jul 8): ' + p.farewell,
    '',
    'Note: ' + (p.note || '—'),
    '',
    'All replies: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ];
  MailApp.sendEmail({
    to: NOTIFY,
    subject: 'New RSVP: ' + name + (p.wedding === 'Yes' ? ' (attending)' : ' (declined)'),
    body: lines.join('\n'),
    replyTo: p.email || undefined
  });
  return ok_();
}

function ok_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
