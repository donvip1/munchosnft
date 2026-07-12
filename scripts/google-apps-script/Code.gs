const SHEET_NAME = "Waitlist";
const DEFAULT_SITE_URL = "https://munchosnft.vercel.app";
const HEADERS = [
  "Timestamp",
  "Full Name",
  "Email",
  "X Username",
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
    const rows = sheet.getDataRange().getValues();
    const existing = findExisting(rows, payload);

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

    const referralCode = generateReferralCode(rows);
    const referredBy = normalizeReferral(payload.referredBy || payload.referralCode);
    const referralCount = 0;
    const now = new Date();

    sheet.appendRow([
      now,
      payload.fullName.trim(),
      normalizeEmail(payload.email),
      normalizeXUsername(payload.xUsername),
      normalizeWallet(payload.walletAddress),
      referralCode,
      referredBy,
      referralCount,
      Boolean(payload.taskCompleted),
      "Registered"
    ]);

    if (referredBy) {
      incrementReferralCount(sheet, referredBy);
    }

    return jsonResponse({
      ok: true,
      status: "registered",
      message: "You are on the Munchos NFT waitlist.",
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
  if (!payload.fullName || !payload.email || !payload.xUsername || !payload.walletAddress) {
    return { ok: false, message: "Missing required fields." };
  }

  if (!payload.taskCompleted) {
    return { ok: false, message: "Required tasks must be completed." };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(String(payload.walletAddress).trim())) {
    return { ok: false, message: "Invalid EVM wallet address." };
  }

  return { ok: true };
}

function getWaitlistSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = firstRow.join("") !== "";

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function findExisting(rows, payload) {
  const email = normalizeEmail(payload.email);
  const username = normalizeXUsername(payload.xUsername);
  const wallet = normalizeWallet(payload.walletAddress);

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    const rowEmail = normalizeEmail(row[2]);
    const rowUsername = normalizeXUsername(row[3]);
    const rowWallet = normalizeWallet(row[4]);

    if (rowEmail === email || rowUsername === username || rowWallet === wallet) {
      return {
        referralCode: row[5],
        referralCount: Number(row[7] || 0)
      };
    }
  }

  return null;
}

function incrementReferralCount(sheet, referredBy) {
  const rows = sheet.getDataRange().getValues();

  for (let index = 1; index < rows.length; index += 1) {
    const rowReferralCode = normalizeReferral(rows[index][5]);

    if (rowReferralCode === referredBy) {
      const cell = sheet.getRange(index + 1, 8);
      const nextValue = Number(cell.getValue() || 0) + 1;
      cell.setValue(nextValue);
      return;
    }
  }
}

function generateReferralCode(rows) {
  let code = "";
  const existingCodes = rows.slice(1).map(function (row) {
    return normalizeReferral(row[5]);
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
