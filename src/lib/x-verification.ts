import { pinnedPostId, siteConfig } from "@/config/site";
import { normalizeXUsername } from "@/lib/validation";
import type { VerifyTasksResponse, XTaskStatusMap } from "@/types/task-verification";

const X_API_BASE_URL = "https://api.x.com/2";
const DEFAULT_MAX_PAGES = 8;
const DEFAULT_CACHE_TTL_MS = 60_000;
const PROJECT_USER_CACHE_KEY = "__project_user__";

type XUser = {
  id: string;
  username: string;
  name?: string;
};

type XTweet = {
  id: string;
};

type XSingleUserResponse = {
  data?: XUser;
  title?: string;
  detail?: string;
};

type XPagedResponse<T> = {
  data?: T[];
  meta?: {
    next_token?: string;
    result_count?: number;
  };
  title?: string;
  detail?: string;
};

class XApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "XApiError";
    this.status = status;
  }
}

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const verificationCache = new Map<string, CacheEntry<VerifyTasksResponse>>();
const userIdCache = new Map<string, CacheEntry<string>>();

function getCacheTtlMs() {
  const configuredSeconds = Number(process.env.X_VERIFICATION_CACHE_TTL_SECONDS ?? 60);
  const seconds = Number.isFinite(configuredSeconds) && configuredSeconds > 0 ? configuredSeconds : 60;
  return seconds * 1000;
}

function readCache<T>(cache: Map<string, CacheEntry<T>>, key: string) {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function writeCache<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs = DEFAULT_CACHE_TTL_MS) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}

function getBearerToken() {
  return process.env.X_API_BEARER_TOKEN?.trim();
}

function getMaxPages() {
  const configured = Number(process.env.X_VERIFICATION_MAX_PAGES ?? DEFAULT_MAX_PAGES);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_PAGES;
}

function getVerificationPostId() {
  return process.env.X_PINNED_POST_ID?.trim() || pinnedPostId;
}

async function xFetch<T>(path: string, bearerToken: string): Promise<T> {
  const response = await fetch(`${X_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`
    },
    cache: "no-store"
  });
  const text = await response.text();
  let payload: T & { title?: string; detail?: string };

  try {
    payload = JSON.parse(text) as T & { title?: string; detail?: string };
  } catch {
    throw new XApiError("X returned an unexpected response.", response.status);
  }

  if (!response.ok) {
    const message = payload.detail || payload.title || "X verification request failed.";

    if (response.status === 429 || /credit|quota|rate limit/i.test(message)) {
      throw new XApiError(
        "X API credits are depleted or rate-limited. Verification is temporarily unavailable until your X API quota resets or your plan is upgraded.",
        response.status
      );
    }

    throw new XApiError(
      message,
      response.status
    );
  }

  return payload;
}

async function getUserByUsername(username: string, bearerToken: string) {
  const cachedUserId = readCache(userIdCache, username);

  if (cachedUserId) {
    return {
      id: cachedUserId,
      username
    };
  }

  const response = await xFetch<XSingleUserResponse>(
    `/users/by/username/${encodeURIComponent(username)}`,
    bearerToken
  );

  if (!response.data?.id) {
    throw new XApiError(`X user @${username} was not found.`);
  }

  writeCache(userIdCache, username, response.data.id, getCacheTtlMs());

  return response.data;
}

async function getProjectUserId(bearerToken: string) {
  const configuredUserId = process.env.X_PROJECT_USER_ID?.trim();

  if (configuredUserId) {
    return configuredUserId;
  }

  const cachedProjectUserId = readCache(userIdCache, PROJECT_USER_CACHE_KEY);

  if (cachedProjectUserId) {
    return cachedProjectUserId;
  }

  const projectUser = await getUserByUsername(siteConfig.handle, bearerToken);
  writeCache(userIdCache, PROJECT_USER_CACHE_KEY, projectUser.id, getCacheTtlMs());

  return projectUser.id;
}

async function pagedContainsUser(
  initialPath: string,
  userId: string,
  bearerToken: string,
  maxPages = getMaxPages()
) {
  let nextToken = "";

  for (let page = 0; page < maxPages; page += 1) {
    const separator = initialPath.includes("?") ? "&" : "?";
    const path = nextToken
      ? `${initialPath}${separator}pagination_token=${encodeURIComponent(nextToken)}`
      : initialPath;
    const response = await xFetch<XPagedResponse<XUser>>(path, bearerToken);

    if (response.data?.some((user) => user.id === userId)) {
      return true;
    }

    nextToken = response.meta?.next_token ?? "";

    if (!nextToken) {
      return false;
    }
  }

  return false;
}

async function pagedContainsTweet(
  initialPath: string,
  tweetId: string,
  bearerToken: string,
  maxPages = getMaxPages()
) {
  let nextToken = "";

  for (let page = 0; page < maxPages; page += 1) {
    const separator = initialPath.includes("?") ? "&" : "?";
    const path = nextToken
      ? `${initialPath}${separator}pagination_token=${encodeURIComponent(nextToken)}`
      : initialPath;
    const response = await xFetch<XPagedResponse<XTweet>>(path, bearerToken);

    if (response.data?.some((tweet) => tweet.id === tweetId)) {
      return true;
    }

    nextToken = response.meta?.next_token ?? "";

    if (!nextToken) {
      return false;
    }
  }

  return false;
}

export async function verifyXTasks(xUsername: string): Promise<VerifyTasksResponse> {
  const bearerToken = getBearerToken();
  const username = normalizeXUsername(xUsername);
  const tweetId = getVerificationPostId();
  const cacheKey = `${username}:${tweetId}`;

  if (!username) {
    return {
      ok: false,
      message: "Enter your X username before verifying tasks.",
      fieldErrors: {
        xUsername: "X username is required."
      }
    };
  }

  if (!bearerToken) {
    return {
      ok: false,
      message:
        "X verification is not configured yet. Add X_API_BEARER_TOKEN in Vercel to enable strict task checks.",
      tasks: {
        follow: false,
        like: false,
        repost: false
      }
    };
  }

  const cachedResponse = readCache(verificationCache, cacheKey);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const [participant, projectUserId] = await Promise.all([
      getUserByUsername(username, bearerToken),
      getProjectUserId(bearerToken)
    ]);

    const [follow, like, repost] = await Promise.all([
      pagedContainsUser(
        `/users/${participant.id}/following?max_results=1000&user.fields=username`,
        projectUserId,
        bearerToken
      ),
      pagedContainsTweet(
        `/users/${participant.id}/liked_tweets?max_results=100&tweet.fields=id`,
        tweetId,
        bearerToken
      ),
      pagedContainsUser(
        `/tweets/${tweetId}/retweeted_by?max_results=100&user.fields=username`,
        participant.id,
        bearerToken
      )
    ]);

    const tasks: XTaskStatusMap = {
      follow,
      like,
      repost
    };
    const complete = Object.values(tasks).every(Boolean);

    const result: VerifyTasksResponse = {
      ok: complete,
      message: complete
        ? "X tasks verified."
        : "Some X tasks were not found yet. Complete the missing tasks, then verify again.",
      tasks
    };

    writeCache(verificationCache, cacheKey, result, getCacheTtlMs());

    return result;
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to verify X tasks right now.",
      tasks: {
        follow: false,
        like: false,
        repost: false
      }
    };
  }
}
