import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getArtworks } from "../api/artic.js";
import { decodeExpo } from "../lib/art.js";
import ArtworkCard from "../components/ArtworkCard.jsx";

export default function ExpoViewPage() {
  const { search } = useLocation();
  const { title, ids } = useMemo(() => decodeExpo(search), [search]);
  const idsKey = ids.join(",");
  const [state, setState] = useState({ status: "loading", data: [], iiif: "", error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (ids.length === 0) {
      setState({ status: "done", data: [], iiif: "/aicimg/iiif/2", error: "" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading", data: [], iiif: "", error: "" });
    getArtworks(ids)
      .then((r) => {
        if (cancelled) return;
        setState({ status: "done", data: r.data, iiif: r.iiifUrl, error: "" });
      })
      .catch((e) => {
        if (cancelled) return;
        setState({ status: "error", data: [], iiif: "", error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [idsKey, attempt]);

  const unavailable = ids.length - state.data.length;

  return (
    <div>
      <h1>{title}</h1>

      {state.status === "loading" && <p className="status">Загрузка…</p>}

      {state.status === "error" && (
        <div className="status">
          <p>{state.error}</p>
          <button onClick={() => setAttempt((n) => n + 1)}>Повторить</button>
        </div>
      )}

      {state.status === "done" && ids.length === 0 && (
        <div className="status">
          <p>В этой выставке нет работ.</p>
          <Link to="/">Найти работы</Link>
        </div>
      )}

      {state.status === "done" && state.data.length > 0 && (
        <div className="grid">
          {state.data.map((work) => (
            <ArtworkCard key={work.id} work={work} iiifBase={state.iiif} />
          ))}
        </div>
      )}

      {state.status === "done" && ids.length > 0 && unavailable > 0 && (
        <p className="status">Недоступных работ: {unavailable}</p>
      )}
    </div>
  );
}