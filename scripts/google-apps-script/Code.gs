const SHEET_NAME = "Waitlist";
const DEFAULT_SITE_URL = "https://munchosnft.vercel.app";
const HEADERS = [
  "Timestamp",
  "Full Name",
  "Email",
  "X Username",
  "X Post Link",
  "Wallet Address",
  "Referral Code",
  "Referred By",
  "Referral Count",
  "Task Completed",
  "Submission Status"
];

function doGet() {
  return jsonResponse({
    ok: true,
    message: "Munchos NFT waitlist backend is online."
  });
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = parsePayload(event);
    const validation = validatePayload(payload);

    if (!validation.ok) {
      return jsonResponse(validation);
    }

    const sheet = getWaitlistSheet();
    const headers = ensureHeaders(sheet);
    const rows = sheet.getDataRange().getValues();
    const existing = findExisting(rows, headers, payload);

    if (existing) {
      return jsonResponse({
        ok: true,
        status: "duplicate",
        message: "This wallet, email, or X username is already registered.",
        referralCode: existing.referralCode,
        referralLink: buildReferralLink(existing.referralCode),
        referralCount: existing.referralCount,
        waitlistPosition: null,
        rewardTier: null
      });
    }

    const referralCode = generateReferralCode(rows, headers);
    const referredBy = normalizeReferral(payload.referredBy || payload.referralCode);
    const referralCount = 0;
    const now = new Date();
    const values = {
      "Timestamp": now,
      "Full Name": payload.fullName.trim(),
      "Email": normalizeEmail(payload.email),
      "X Username": normalizeXUsername(payload.xUsername),
      "X Post Link": normalizeUrl(payload.xPostUrl),
      "Wallet Address": normalizeWallet(payload.walletAddress),
      "Referral Code": referralCode,
      "Referred By": referredBy,
      "Referral Count": referralCount,
      "Task Completed": Boolean(payload.taskCompleted),
      "Submission Status": "Registered"
    };

    sheet.appendRow(headers.map(function (header) {
      return Object.prototype.hasOwnProperty.call(values, header) ? values[header] : "";
    }));

    if (referredBy) {
      incrementReferralCount(sheet, referredBy, headers);
    }

    return jsonResponse({
      ok: true,
      status: "registered",
      message: "Your waitlist registration has been received successfully.",
      referralCode: referralCode,
      referralLink: buildReferralLink(referralCode),
      referralCount: referralCount,
      waitlistPosition: null,
      rewardTier: null
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error && error.message ? error.message : "Unexpected backend error."
    });
  } finally {
    lock.releaseLock();
  }
}

function parsePayload(event) {
  if (!event || !event.postData || !event.postData.contents) {
    throw new Error("Missing request body.");
  }

  return JSON.parse(event.postData.contents);
}

function validatePayload(payload) {
  if (
    !payload.fullName ||
    !payload.email ||
    !payload.xUsername ||
    !payload.xPostUrl ||
    !payload.walletAddress
  ) {
    return { ok: false, message: "Missing required fields." };
  }

  if (!payload.taskCompleted) {
    return { ok: false, message: "Required tasks must be completed." };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(String(payload.walletAddress).trim())) {
    return { ok: false, message: "Invalid EVM wallet address." };
  }

  if (!/^https?:\/\/(www\.)?(x|twitter)\.com\/([A-Za-z0-9_]{1,15}|i)\/status(es)?\/\d+/i.test(String(payload.xPostUrl).trim())) {
    return { ok: false, message: "Invalid X post link." };
  }

  return { ok: true };
}

function getWaitlistSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeaders(sheet);
  return sheet;
}

function ensureHeaders(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const firstRow = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  const hasHeaders = firstRow.some(function (value) {
    return String(value || "").trim() !== "";
  });

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return HEADERS.slice();
  }

  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (header) {
    return String(header || "").trim();
  });

  HEADERS.forEach(function (header) {
    if (headers.indexOf(header) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      headers.push(header);
    }
  });

  sheet.setFrozenRows(1);
  return headers;
}

function headerIndex(headers, name) {
  return headers.indexOf(name);
}

function getCell(row, headers, name) {
  const index = headerIndex(headers, name);
  return index === -1 ? "" : row[index];
}

function findExisting(rows, headers, payload) {
  const email = normalizeEmail(payload.email);
  const username = normalizeXUsername(payload.xUsername);
  const wallet = normalizeWallet(payload.walletAddress);

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    const rowEmail = normalizeEmail(getCell(row, headers, "Email"));
    const rowUsername = normalizeXUsername(getCell(row, headers, "X Username"));
    const rowWallet = normalizeWallet(getCell(row, headers, "Wallet Address"));

    if (rowEmail === email || rowUsername === username || rowWallet === wallet) {
      return {
        referralCode: getCell(row, headers, "Referral Code"),
        referralCount: Number(getCell(row, headers, "Referral Count") || 0)
      };
    }
  }

  return null;
}

function incrementReferralCount(sheet, referredBy, headers) {
  const rows = sheet.getDataRange().getValues();
  const codeColumnIndex = headerIndex(headers, "Referral Code");
  const countColumnIndex = headerIndex(headers, "Referral Count");

  if (codeColumnIndex === -1 || countColumnIndex === -1) {
    return;
  }

  for (let index = 1; index < rows.length; index += 1) {
    const rowReferralCode = normalizeReferral(rows[index][codeColumnIndex]);

    if (rowReferralCode === referredBy) {
      const cell = sheet.getRange(index + 1, countColumnIndex + 1);
      const nextValue = Number(cell.getValue() || 0) + 1;
      cell.setValue(nextValue);
      return;
    }
  }
}

function generateReferralCode(rows, headers) {
  let code = "";
  const existingCodes = rows.slice(1).map(function (row) {
    return normalizeReferral(getCell(row, headers, "Referral Code"));
  });

  do {
    code = "MUNCHOS-" + randomToken(6);
  } while (existingCodes.indexOf(code) !== -1);

  return code;
}

function randomToken(length) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = "";

  for (let index = 0; index < length; index += 1) {
    value += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return value;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeXUsername(value) {
  return String(value || "").trim().replace(/^@/, "").toLowerCase();
}

function normalizeWallet(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeReferral(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeUrl(value) {
  return String(value || "").trim();
}

function buildReferralLink(code) {
  return getSiteUrl() + "/?ref=" + encodeURIComponent(code);
}

function getSiteUrl() {
  const configuredUrl = PropertiesService.getScriptProperties().getProperty("SITE_URL");
  const siteUrl = configuredUrl || DEFAULT_SITE_URL;
  return siteUrl.replace(/\/$/, "");
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
