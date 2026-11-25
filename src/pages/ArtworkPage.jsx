import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getArtwork } from "../api/artic.js";
import { artistName, iiifUrl, MAX_EXPO } from "../lib/art.js";
import { useExpo } from "../context/ExpoContext.jsx";

export default function ArtworkPage() {
  const { id } = useParams();
  const numericId = /^\d+$/.test(id) ? Number(id) : null;
  const { expo, dispatch } = useExpo();

  const [state, setState] = useState({ status: "loading", work: null, iiif: "", error: "" });
  const [attempt, setAttempt] = useState(0);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (numericId === null) return;
    let cancelled = false;
    setState({ status: "loading", work: null, iiif: "", error: "" });
    setBroken(false);
    getArtwork(numericId)
      .then((r) => {
        if (cancelled) return;
        setState({ status: "done", work: r.data, iiif: r.iiifUrl, error: "" });
      })
      .catch((e) => {
        if (cancelled) return;
        const notFound = e.status === 404;
        setState({
          status: notFound ? "notfound" : "error",
          work: null,
          iiif: "",
          error: e.message,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [numericId, attempt]);

  if (numericId === null || state.status === "notfound") {
    return (
      <div className="status">
        <p>Работа не найдена.</p>
        <Link to="/">К поиску</Link>
      </div>
    );
  }

  if (state.status === "loading") return <p className="status">Загрузка…</p>;

  if (state.status === "error") {
    return (
      <div className="status">
        <p>{state.error}</p>
        <button onClick={() => setAttempt((n) => n + 1)}>Повторить</button>
      </div>
    );
  }

  const { work } = state;
  const src = iiifUrl(state.iiif, work.image_id, 843);
  const w = work.thumbnail?.width;
  const h = work.thumbnail?.height;
  const ratio = w && h ? `${w} / ${h}` : "1 / 1";
  const alt = work.thumbnail?.alt_text || work.title || "Произведение искусства";

  const inExpo = expo.ids.includes(work.id);
  const full = expo.ids.length >= MAX_EXPO;
  let label = "В выставку";
  if (inExpo) label = "Уже в выставке";
  else if (full) label = `Выставка заполнена (${MAX_EXPO} из ${MAX_EXPO})`;

  return (
    <div className="artwork">
      <Link to="/">← К поиску</Link>

      <div className="artwork-img card-img" style={{ aspectRatio: ratio }}>
        {src && !broken ? (
          <img src={src} alt={alt} onError={() => setBroken(true)} />
        ) : (
          <span className="placeholder">Нет изображения</span>
        )}
      </div>

      <h1>{work.title}</h1>
      <p className="artwork-author">{artistName(work.artist_display) || "Автор неизвестен"}</p>

      <dl className="artwork-meta">
        <dt>Дата</dt>
        <dd>{work.date_display || "—"}</dd>
        <dt>Техника</dt>
        <dd>{work.medium_display || "—"}</dd>
        <dt>Отдел музея</dt>
        <dd>{work.department_title || "—"}</dd>
      </dl>

      <button
        disabled={inExpo || full}
        onClick={() => dispatch({ type: "add", id: work.id })}
      >
        {label}
      </button>
      <p>
        В выставке: {expo.ids.length} из {MAX_EXPO} · <Link to="/expo">Открыть выставку</Link>
      </p>
    </div>
  );
}