// RSVP receiver + dashboard data for catherine-greg.com
// Lives in Extensions > Apps Script on the RSVP Google Sheet. Deployed as a Web app
// (Execute as: Me, Who has access: Anyone). To update: paste, Save, then
// Deploy > Manage deployments > pencil > Version: New version > Deploy (keeps the same URL).
//
// Script properties (Project Settings > Script properties):
//   DATA_KEY         long random string; the site's /guests page uses it to read RSVPs
//   BACKUP_SHEET_ID  ID of Brooke's private backup spreadsheet (every RSVP is copied there)

var NOTIFY = 'katsia24@hotmail.com, brookebetterton5@gmail.com';   // who gets an email for each RSVP (comma-separate to add more)
var HEADERS = ['Received', 'First name', 'Last name', 'Email', 'Wedding (Jul 7)', 'Welcome reception (Jul 5)', 'Boat day (Jul 6)', 'Farewell luncheon (Jul 8)', 'Note'];

function prop_(name) { return PropertiesService.getScriptProperties().getProperty(name) || ''; }

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
  var rows = [[new Date(), clean(p.first_name), clean(p.last_name), clean(p.email),
               clean(p.wedding), clean(p.welcome), clean(p.boat), clean(p.farewell), clean(p.note)]];
  var guest = (clean(p.guest_first) + ' ' + clean(p.guest_last)).trim();
  if (guest) {                                        // plus one gets their own row, same answers
    rows.push([new Date(), clean(p.guest_first), clean(p.guest_last), '',
               clean(p.wedding), clean(p.welcome), clean(p.boat), clean(p.farewell),
               'Plus one of ' + clean(p.first_name) + ' ' + clean(p.last_name)]);
  }
  rows.forEach(function (r) { sheet.appendRow(r); });
  backup_(rows);

  var name = (p.first_name + ' ' + p.last_name).trim();
  var lines = [
    'Name: ' + name,
    'Email: ' + p.email,
    'Plus one: ' + (guest || '—'),
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
    subject: 'New RSVP: ' + name + (guest ? ' + ' + guest : '') + (p.wedding === 'Yes' ? ' (attending)' : ' (declined)'),
    body: lines.join('\n'),
    replyTo: p.email || undefined
  });
  return ok_();
}

// Copy every RSVP to Brooke's private backup spreadsheet. Never blocks an RSVP if it fails.
function backup_(rows) {
  try {
    var id = prop_('BACKUP_SHEET_ID');
    if (!id) return;
    var b = SpreadsheetApp.openById(id).getSheets()[0];
    if (b.getLastRow() === 0) { b.appendRow(HEADERS); b.setFrozenRows(1); }
    rows.forEach(function (r) { b.appendRow(r); });
  } catch (err) {
    console.error('Backup failed: ' + err);
  }
}

// RSVP data for the site's password-protected /guests page. Requires ?key=DATA_KEY.
function doGet(e) {
  var key = prop_('DATA_KEY');
  var p = (e && e.parameter) || {};
  if (!key || p.key !== key) return json_({ ok: false, error: 'unauthorized' });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var last = sheet.getLastRow();
  var rows = last > 1 ? sheet.getRange(2, 1, last - 1, HEADERS.length).getValues() : [];
  rows = rows.map(function (r) {
    return r.map(function (v) { return v instanceof Date ? v.toISOString() : v; });
  });
  return json_({ ok: true, rows: rows, sheetUrl: ss.getUrl() });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function ok_() { return json_({ ok: true }); }
