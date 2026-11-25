const HOSTS = {
  api: "https://api.artic.edu",
  img: "https://www.artic.edu",
};

export default async function handler(req, res) {
  const { host, path, ...rest } = req.query;
  const base = HOSTS[host];
  if (!base) {
    res.status(400).send("Bad request");
    return;
  }

  const subPath = Array.isArray(path) ? path.join("/") : path || "";
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(rest)) {
    if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
    else qs.append(key, value);
  }
  const query = qs.toString();
  const url = `${base}/${subPath}${query ? `?${query}` : ""}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        "AIC-User-Agent": "my-expo-college-project (student)",
        "User-Agent": "Mozilla/5.0 (compatible; my-expo-college-project)",
        Accept: req.headers.accept || "*/*",
      },
    });

    res.status(upstream.status);
    const type = upstream.headers.get("content-type");
    if (type) res.setHeader("Content-Type", type);
    res.setHeader(
      "Cache-Control",
      upstream.ok ? "public, s-maxage=3600, max-age=3600" : "no-store"
    );

    const body = Buffer.from(await upstream.arrayBuffer());
    res.send(body);
  } catch {
    res.status(502).send("Upstream error");
  }
}