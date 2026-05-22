const REQUIRED_FIELDS = ["name", "phone", "model", "rentalTerm", "rentalPurpose", "source", "submittedAt"];
const ALLOWED_FIELDS = [
  "name",
  "phone",
  "model",
  "rentalTerm",
  "rentalPurpose",
  "fromBashkortostanCity",
  "city",
  "comment",
  "consent",
  "source",
  "submittedAt"
];

const writeJson = (response, statusCode, body) => {
  response.status(statusCode).json(body);
};

const asTrimmedString = (value, maxLength) => String(value || "").trim().slice(0, maxLength);

const payloadFromRequest = (body) => {
  let input = body && typeof body === "object" ? body : {};
  if (typeof body === "string") {
    try {
      input = JSON.parse(body);
    } catch (error) {
      input = {};
    }
  }
  const payload = {
    name: asTrimmedString(input.name, 50),
    phone: asTrimmedString(input.phone, 32),
    model: asTrimmedString(input.model, 32),
    rentalTerm: asTrimmedString(input.rentalTerm, 32),
    rentalPurpose: asTrimmedString(input.rentalPurpose, 48),
    fromBashkortostanCity: Boolean(input.fromBashkortostanCity),
    city: asTrimmedString(input.city, 80),
    comment: asTrimmedString(input.comment, 1200),
    consent: input.consent === true,
    source: asTrimmedString(input.source, 80),
    submittedAt: asTrimmedString(input.submittedAt, 64)
  };

  return Object.fromEntries(ALLOWED_FIELDS.map((field) => [field, payload[field]]));
};

const invalidReason = (payload) => {
  if (REQUIRED_FIELDS.some((field) => !payload[field])) {
    return "Заполните обязательные поля.";
  }
  if (!payload.consent) {
    return "Нужно согласие на обработку данных.";
  }
  if (payload.fromBashkortostanCity && !payload.city) {
    return "Укажите город.";
  }
  return "";
};

module.exports = async function bookingHandler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    writeJson(response, 405, { ok: false, error: "Метод не поддерживается." });
    return;
  }

  if (!process.env.GOOGLE_APPS_SCRIPT_URL) {
    writeJson(response, 503, { ok: false, error: "Прием заявок временно не настроен." });
    return;
  }

  const payload = payloadFromRequest(request.body);
  const reason = invalidReason(payload);
  if (reason) {
    writeJson(response, 400, { ok: false, error: reason });
    return;
  }

  try {
    const googleResponse = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });
    const googleText = await googleResponse.text();
    let googleResult = {};

    try {
      googleResult = JSON.parse(googleText);
    } catch (error) {
      googleResult = {};
    }

    if (!googleResponse.ok || googleResult.ok !== true) {
      writeJson(response, 502, { ok: false, error: "Google Таблица не подтвердила запись заявки." });
      return;
    }

    writeJson(response, 200, { ok: true });
  } catch (error) {
    writeJson(response, 502, { ok: false, error: "Не удалось связаться с сервисом заявок." });
  }
};

module.exports.payloadFromRequest = payloadFromRequest;
module.exports.invalidReason = invalidReason;
