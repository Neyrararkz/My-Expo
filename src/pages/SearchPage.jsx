import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchArtworks } from "../api/artic.js";
import { hueBucket, maxPage } from "../lib/art.js";
import ArtworkCard from "../components/ArtworkCard.jsx";

const DEFAULT_QUERY = "cats";
const DEFAULT_COLOR = "red";
const LIMIT = 24;

const COLORS = [
  ["all", "Все"],
  ["red", "Красный"],
  ["orange", "Оранжевый"],
  ["yellow", "Жёлтый"],
  ["green", "Зелёный"],
  ["blue", "Синий"],
  ["purple", "Фиолетовый"],
  ["gray", "Серый"],
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || DEFAULT_QUERY;
  const color = params.get("color") || DEFAULT_COLOR;
  const page = Math.max(1, parseInt(params.get("page"), 10) || 1);

  const [text, setText] = useState(q);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    status: "loading",
    data: [],
    total: 0,
    limit: LIMIT,
    iiif: "",
    error: "",
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: "loading" }));
    searchArtworks(q, page, LIMIT)
      .then((r) => {
        if (cancelled) return;
        setState({
          status: "done",
          data: r.data,
          total: r.total,
          limit: r.limit,
          iiif: r.iiifUrl,
          error: "",
        });
      })
      .catch((e) => {
        if (cancelled) return;
        setState((s) => ({ ...s, status: "error", error: e.message }));
      });
    return () => {
      cancelled = true;
    };
  }, [q, page, attempt]);

  function update(next) {
    setParams({ q, color, page: String(page), ...next });
  }

  function onSubmit(e) {
    e.preventDefault();
    update({ q: text.trim() || DEFAULT_QUERY, page: "1" });
  }

  const last = maxPage(state.total, state.limit);
  const visible =
    color === "all" ? state.data : state.data.filter((w) => hueBucket(w.color) === color);

  return (
    <div>
      <h1>Поиск работ</h1>

      <form className="toolbar" onSubmit={onSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Тема, например cats"
        />
        <button type="submit">Найти</button>
        <select value={color} onChange={(e) => update({ color: e.target.value })}>
          {COLORS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </form>

      {state.status === "loading" && <p className="status">Загрузка…</p>}

      {state.status === "error" && (
        <div className="status">
          <p>{state.error}</p>
          <button onClick={() => setAttempt((n) => n + 1)}>Повторить</button>
        </div>
      )}

      {state.status === "done" && state.data.length === 0 && (
        <p className="status">Ничего не найдено</p>
      )}

      {state.status === "done" && state.data.length > 0 && visible.length === 0 && (
        <p className="status">
          На этой странице нет работ выбранного цвета. Листайте дальше или выберите «Все».
        </p>
      )}

      {state.status === "done" && visible.length > 0 && (
        <div className="grid">
          {visible.map((work) => (
            <ArtworkCard key={work.id} work={work} iiifBase={state.iiif} />
          ))}
        </div>
      )}

      {state.status === "done" && last > 0 && (
        <div className="pager">
          <button disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
            Назад
          </button>
          <span>
            Страница {page} из {last}
          </span>
          <button disabled={page >= last} onClick={() => update({ page: String(page + 1) })}>
            Вперёд
          </button>
        </div>
      )}
    </div>
  );
}