export const DEFAULT_TITLE = "Моя выставка";
export const MAX_EXPO = 12;
export const MAX_RESULTS = 10000;
const GRAY_S = 15; 

export function artistName(artistDisplay) {
  if (typeof artistDisplay !== "string") return "";
  return artistDisplay.split("\n")[0].trim();
}

export function hueBucket(color) {
  if (!color || typeof color.h !== "number" || typeof color.s !== "number") return null;
  if (color.s < GRAY_S) return "gray";
  const h = ((color.h % 360) + 360) % 360;
  if (h <= 14 || h >= 345) return "red";
  if (h <= 44) return "orange";
  if (h <= 69) return "yellow";
  if (h <= 169) return "green";
  if (h <= 259) return "blue";
  return "purple";
}

export function maxPage(total, limit) {
  if (!(total > 0) || !(limit > 0)) return 0;
  return Math.min(Math.ceil(total / limit), Math.floor(MAX_RESULTS / limit));
}

export function encodeExpo(expo) {
  const title = encodeURIComponent(expo?.title ?? "");
  const ids = (expo?.ids ?? []).join(",");
  return `?title=${title}&ids=${ids}`;
}

export function decodeExpo(search) {
  const params = new URLSearchParams(search ?? "");
  const title = (params.get("title") ?? "").trim() || DEFAULT_TITLE;
  const seen = new Set();
  const ids = [];
  for (const part of (params.get("ids") ?? "").split(",")) {
    if (!/^\d+$/.test(part)) continue;
    const n = Number(part);
    if (n <= 0 || seen.has(n)) continue; 
    seen.add(n);
    ids.push(n);
    if (ids.length === MAX_EXPO) break;
  }
  return { title, ids };
}

export function iiifUrl(iiifBase, imageId, width = 843) {
  if (!iiifBase || !imageId) return null;
  return `${iiifBase}/${imageId}/full/${width},/0/default.jpg`;
}

export function sortIdsByDateStart(ids, worksById) {
  const year = (id) => {
    const y = worksById?.[id]?.date_start;
    return typeof y === "number" && Number.isFinite(y) ? y : null;
  };
  return ids
    .map((id, index) => ({ id, index, y: year(id) }))
    .sort((a, b) => {
      if (a.y === null && b.y === null) return a.index - b.index;
      if (a.y === null) return 1;
      if (b.y === null) return -1;
      return a.y - b.y || a.index - b.index;
    })
    .map((item) => item.id);
}