const BASE = "/aic/api/v1";
const imgBase = (json) =>
  (json.config?.iiif_url ?? "https://www.artic.edu/iiif/2").replace(
    "https://www.artic.edu",
    "/aicimg"
  );
const INTERVAL_MS = 1000;
const LIST_FIELDS = "id,title,artist_display,date_display,date_start,image_id,thumbnail,color";
const FULL_FIELDS = "id,title,artist_display,date_display,date_start,medium_display,department_title,image_id,thumbnail,color";

const cache = new Map();
let chain = Promise.resolve();
let lastStart = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function fetchJson(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    console.error("fetch failed:", url, e);
    throw new ApiError("Не удалось загрузить данные. Проверьте соединение", 0);
  }
  if (res.status === 429) {
    throw new ApiError("Слишком много запросов, подождите минуту", 429);
  }
  if (!res.ok) {
    throw new ApiError(`Ошибка сервера: ${res.status}`, res.status);
  }
  return res.json();
}

function schedule(task) {
  const run = chain.then(async () => {
    const wait = Math.max(0, lastStart + INTERVAL_MS - Date.now());
    if (wait > 0) await sleep(wait);
    lastStart = Date.now();
    return task();
  });
  chain = run.catch(() => {});
  return run;
}

function request(url) {
  if (cache.has(url)) return cache.get(url);
  const promise = schedule(() => fetchJson(url));
  cache.set(url, promise);
  promise.catch(() => cache.delete(url));
  return promise;
}

export function clearCache() {
  cache.clear();
}

export async function searchArtworks(q, page = 1, limit = 24) {
  const params = new URLSearchParams({
    q,
    fields: LIST_FIELDS,
    limit: String(limit),
    page: String(page),
  });
  const json = await request(`${BASE}/artworks/search?${params}`);
  return {
    data: json.data ?? [],
    total: json.pagination?.total ?? 0,
    limit: json.pagination?.limit ?? limit,
    iiifUrl: imgBase(json),
  };
}

export async function getArtwork(id) {
  const json = await request(`${BASE}/artworks/${id}?fields=${FULL_FIELDS}`);
  return {
    data: json.data,
    iiifUrl: imgBase(json),
  };
}

export async function getArtworks(ids) {
  if (!ids || ids.length === 0) {
    return { data: [], iiifUrl: "/aicimg/iiif/2" };
  }
  const params = new URLSearchParams({
    ids: ids.join(","),
    fields: LIST_FIELDS,
    limit: "12",
  });
  const json = await request(`${BASE}/artworks?${params}`);
  const byId = new Map((json.data ?? []).map((w) => [w.id, w]));
  return {
    data: ids.map((id) => byId.get(id)).filter(Boolean),
    iiifUrl: imgBase(json),
  };
}