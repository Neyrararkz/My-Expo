import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArtworks } from "../api/artic.js";
import { DEFAULT_TITLE, MAX_EXPO, encodeExpo, sortIdsByDateStart } from "../lib/art.js";
import { useExpo } from "../context/ExpoContext.jsx";
import ArtworkCard from "../components/ArtworkCard.jsx";

export default function ExpoPage() {
  const { expo, dispatch } = useExpo();
  const [works, setWorks] = useState({});
  const [iiif, setIiif] = useState("/aicimg/iiif/2");
  const [status, setStatus] = useState("done");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [copyMessage, setCopyMessage] = useState("");

  const idsKey = expo.ids.join(",");

  useEffect(() => {
    const missing = expo.ids.filter((id) => !works[id]);
    if (missing.length === 0) {
      setStatus("done");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    getArtworks([...missing].sort((a, b) => a - b))
      .then((r) => {
        if (cancelled) return;
        setWorks((prev) => {
          const next = { ...prev };
          for (const w of r.data) next[w.id] = w;
          return next;
        });
        setIiif(r.iiifUrl);
        setStatus("done");
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [idsKey, attempt]);

  async function copyLink() {
    const link = `${window.location.origin}/expo/view${encodeExpo(expo)}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopyMessage("Ссылка скопирована");
    } catch {
      setCopyMessage(`Скопируйте вручную: ${link}`);
    }
  }

  function fixTitle() {
    if (!expo.title.trim()) dispatch({ type: "rename", title: DEFAULT_TITLE });
  }

  const count = expo.ids.length;

  return (
    <div>
      <h1>Моя выставка</h1>

      <label className="expo-title-label">
        Название выставки
        <input
          className="expo-title"
          type="text"
          value={expo.title}
          maxLength={100}
          onChange={(e) => dispatch({ type: "rename", title: e.target.value })}
          onBlur={fixTitle}
        />
      </label>

      <p>
        Работ: {count} из {MAX_EXPO}
      </p>

      <div className="toolbar">
        <button
          disabled={count < 2 || status === "loading"}
          onClick={() =>
            dispatch({ type: "setOrder", ids: sortIdsByDateStart(expo.ids, works) })
          }
        >
          Хронологически
        </button>
        <button disabled={count === 0} onClick={copyLink}>
          Скопировать ссылку
        </button>
      </div>

      {copyMessage && <p className="status">{copyMessage}</p>}

      {count === 0 && (
        <div className="status">
          <p>Выставка пуста.</p>
          <Link to="/">Найти работы</Link>
        </div>
      )}

      {status === "error" && (
        <div className="status">
          <p>{error}</p>
          <button onClick={() => setAttempt((n) => n + 1)}>Повторить</button>
        </div>
      )}

      {count > 0 && (
        <div className="grid">
          {expo.ids.map((id, i) => {
            const work = works[id];
            return (
              <div key={id} className="expo-item">
                <div className="expo-pos">{i + 1}</div>
                {work ? (
                  <ArtworkCard work={work} iiifBase={iiif} />
                ) : (
                  <div className="card-img placeholder expo-missing" style={{ aspectRatio: "1 / 1" }}>
                    {status === "done" ? "Работа недоступна" : "Загрузка…"}
                  </div>
                )}
                <div className="expo-controls">
                  <button
                    disabled={i === 0}
                    onClick={() => dispatch({ type: "move", id, delta: -1 })}
                    aria-label="Переместить выше"
                  >
                    ↑
                  </button>
                  <button
                    disabled={i === count - 1}
                    onClick={() => dispatch({ type: "move", id, delta: 1 })}
                    aria-label="Переместить ниже"
                  >
                    ↓
                  </button>
                  <button onClick={() => dispatch({ type: "remove", id })}>Убрать</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}