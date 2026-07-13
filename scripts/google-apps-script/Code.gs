const WHITELIST_SHEET_NAME = "Whitelist";
const COLLABORATIONS_SHEET_NAME = "Collaborations";
const DEFAULT_SITE_URL = "https://www.munchosapp.xyz";
const WHITELIST_HEADERS = [
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
const COLLABORATION_HEADERS = [
  "Timestamp",
  "Application ID",
  "Collaboration Type",
  "Project Name",
  "Contact Name",
  "Email",
  "Telegram",
  "X Username",
  "Discord",
  "Website",
  "Country",
  "Social Links",
  "Project Description",
  "Why Collaborate",
  "Extra Information",
  "Logo URL",
  "Status"
];

function doGet() {
  return jsonResponse({
    ok: true,
    message: "Munchos NFT backend is online."
  });
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = parsePayload(event);

    if (payload.formType === "collaboration") {
      return handleCollaborationPost(payload);
    }

    return handleWhitelistPost(payload);
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error && error.message ? error.message : "Unexpected backend error."
    });
  } finally {
    lock.releaseLock();
  }
}

function handleWhitelistPost(payload) {
  const validation = validateWhitelistPayload(payload);

  if (!validation.ok) {
    return jsonResponse(validation);
  }

  const sheet = getWhitelistSheet();
  const headers = ensureHeaders(sheet, WHITELIST_HEADERS);
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
      whitelistPosition: null,
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
    message: "Your whitelist registration has been received successfully.",
    referralCode: referralCode,
    referralLink: buildReferralLink(referralCode),
    referralCount: referralCount,
    whitelistPosition: null,
    rewardTier: null
  });
}

function handleCollaborationPost(payload) {
  const validation = validateCollaborationPayload(payload);

  if (!validation.ok) {
    return jsonResponse(validation);
  }

  const sheet = getCollaborationsSheet();
  const headers = ensureHeaders(sheet, COLLABORATION_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const existing = findExistingCollaboration(rows, headers, payload);

  if (existing) {
    return jsonResponse({
      ok: false,
      status: "duplicate",
      message: "A collaboration request for this email and project name already exists.",
      applicationId: existing.applicationId
    });
  }

  const applicationId = generateCollaborationId(rows);
  const logoUrl = payload.logo ? saveCollaborationLogo(applicationId, payload.logo) : "";
  const now = new Date();
  const values = {
    "Timestamp": now,
    "Application ID": applicationId,
    "Collaboration Type": (payload.collaborationTypes || []).join(", "),
    "Project Name": String(payload.projectName || "").trim(),
    "Contact Name": String(payload.contactName || "").trim(),
    "Email": normalizeEmail(payload.email),
    "Telegram": String(payload.telegram || "").trim(),
    "X Username": normalizeXUsername(payload.xUsername),
    "Discord": String(payload.discord || "").trim(),
    "Website": normalizeUrl(payload.website),
    "Country": String(payload.country || "").trim(),
    "Social Links": JSON.stringify(payload.socialLinks || []),
    "Project Description": String(payload.projectDescription || "").trim(),
    "Why Collaborate": String(payload.whyCollaborate || "").trim(),
    "Extra Information": String(payload.extraInfo || "").trim(),
    "Logo URL": logoUrl,
    "Status": "Pending"
  };

  sheet.appendRow(headers.map(function (header) {
    return Object.prototype.hasOwnProperty.call(values, header) ? values[header] : "";
  }));

  return jsonResponse({
    ok: true,
    status: "submitted",
    message: "Collaboration request submitted.",
    applicationId: applicationId
  });
}

function parsePayload(event) {
  if (!event || !event.postData || !event.postData.contents) {
    throw new Error("Missing request body.");
  }

  return JSON.parse(event.postData.contents);
}

function validateWhitelistPayload(payload) {
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

function validateCollaborationPayload(payload) {
  const fieldErrors = {};

  if (!payload.projectName) {
    fieldErrors.projectName = "Project or brand name is required.";
  }

  if (!payload.contactName) {
    fieldErrors.contactName = "Contact name is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.email || "").trim())) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!payload.telegram) {
    fieldErrors.telegram = "Telegram username is required.";
  }

  if (!payload.xUsername) {
    fieldErrors.xUsername = "X username is required.";
  }

  if (!payload.country) {
    fieldErrors.country = "Country is required.";
  }

  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(String(payload.website || "").trim())) {
    fieldErrors.website = "Enter a valid website URL.";
  }

  if (!payload.collaborationTypes || !payload.collaborationTypes.length) {
    fieldErrors.collaborationTypes = "Select at least one collaboration type.";
  }

  if (String(payload.projectDescription || "").trim().length < 150) {
    fieldErrors.projectDescription = "Project description must be at least 150 characters.";
  }

  if (String(payload.whyCollaborate || "").trim().length < 100) {
    fieldErrors.whyCollaborate = "Collaboration reason must be at least 100 characters.";
  }

  if (payload.logo) {
    const allowedTypes = ["image/png", "image/svg+xml", "image/jpeg"];
    if (allowedTypes.indexOf(String(payload.logo.mimeType || "")) === -1) {
      fieldErrors.logo = "Upload a PNG, SVG, or JPG logo.";
    }

    if (Number(payload.logo.size || 0) > 5 * 1024 * 1024) {
      fieldErrors.logo = "Logo must be 5MB or smaller.";
    }

    if (!payload.logo.base64) {
      fieldErrors.logo = "Logo upload is missing file data.";
    }
  }

  if (!payload.confirmed) {
    fieldErrors.confirmed = "Confirm that the information is accurate.";
  }

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      status: "invalid",
      message: "Please correct the highlighted fields.",
      fieldErrors: fieldErrors
    };
  }

  return { ok: true };
}

function getWhitelistSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(WHITELIST_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(WHITELIST_SHEET_NAME);
  }

  ensureHeaders(sheet, WHITELIST_HEADERS);
  return sheet;
}

function getCollaborationsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(COLLABORATIONS_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(COLLABORATIONS_SHEET_NAME);
  }

  ensureHeaders(sheet, COLLABORATION_HEADERS);
  return sheet;
}

function ensureHeaders(sheet, expectedHeaders) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const firstRow = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  const hasHeaders = firstRow.some(function (value) {
    return String(value || "").trim() !== "";
  });

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    sheet.setFrozenRows(1);
    return expectedHeaders.slice();
  }

  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (header) {
    return String(header || "").trim();
  });

  expectedHeaders.forEach(function (header) {
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

function findExistingCollaboration(rows, headers, payload) {
  const email = normalizeEmail(payload.email);
  const projectName = normalizeComparable(payload.projectName);

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    const rowEmail = normalizeEmail(getCell(row, headers, "Email"));
    const rowProjectName = normalizeComparable(getCell(row, headers, "Project Name"));

    if (rowEmail === email && rowProjectName === projectName) {
      return {
        applicationId: getCell(row, headers, "Application ID")
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

function generateCollaborationId(rows) {
  const nextNumber = Math.max(rows.length, 1);
  return "MUNCH-COLLAB-" + String(nextNumber).padStart(5, "0");
}

function saveCollaborationLogo(applicationId, logo) {
  const safeName = String(logo.fileName || "project-logo").replace(/[^\w.\-]/g, "_");
  const bytes = Utilities.base64Decode(String(logo.base64 || ""));
  const blob = Utilities.newBlob(bytes, logo.mimeType, applicationId + "-" + safeName);
  const file = DriveApp.createFile(blob);

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (error) {
    // Some workspace policies disallow public file sharing. Keep the private URL in that case.
  }

  return file.getUrl();
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

function normalizeComparable(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeReferral(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeUrl(value) {
  return String(value || "").trim();
}

function buildReferralLink(code) {
  return getSiteUrl() + "/whitelist?ref=" + encodeURIComponent(code);
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
