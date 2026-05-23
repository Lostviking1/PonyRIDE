const SPREADSHEET_ID = "1F4eky9iPFbJoWFVBX_4cXTM-zyJKE26OMM7olQUwGek";
const SHEET_NAME = "Лист1";
const NOTIFY_EMAIL = "ponyride_official@mail.ru";
const HEADERS = [
  "Дата получения",
  "Имя",
  "Телефон",
  "Модель",
  "Срок аренды",
  "Цель",
  "Из другого города РБ",
  "Город",
  "Комментарий",
  "Согласие",
  "Источник",
  "Дата с сайта"
];

function doGet() {
  return json_({
    ok: true,
    service: "Pony RIDE booking endpoint",
    method: "POST"
  });
}

function doPost(event) {
  try {
    const data = JSON.parse(event.postData.contents || "{}");
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error("Sheet not found: " + SHEET_NAME);
    }

    ensureHeaders_(sheet);
    sheet.appendRow([
      new Date(),
      data.name || "",
      data.phone || "",
      data.model || "",
      data.rentalTerm || "",
      data.rentalPurpose || "",
      data.fromBashkortostanCity ? "Да" : "Нет",
      data.city || "",
      data.comment || "",
      data.consent ? "Да" : "Нет",
      data.source || "",
      data.submittedAt || ""
    ]);

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "Новая заявка Pony RIDE",
      body: [
        "Поступила новая заявка:",
        "",
        "Имя: " + (data.name || "-"),
        "Телефон: " + (data.phone || "-"),
        "Модель: " + (data.model || "-"),
        "Срок аренды: " + (data.rentalTerm || "-"),
        "Цель: " + (data.rentalPurpose || "-"),
        "Из другого города РБ: " + (data.fromBashkortostanCity ? "Да" : "Нет"),
        "Город: " + (data.city || "-"),
        "Комментарий: " + (data.comment || "-"),
        "Источник: " + (data.source || "-")
      ].join("\n")
    });

    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: String(error.message || error) });
  }
}

function ensureHeaders_(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const currentHeaders = range.getValues()[0];
  if (HEADERS.every((header, index) => currentHeaders[index] === header)) {
    return;
  }
  range.setValues([HEADERS]);
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
