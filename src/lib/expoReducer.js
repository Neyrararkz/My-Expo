import { DEFAULT_TITLE, MAX_EXPO, encodeExpo, decodeExpo } from "./art.js";

export const STORAGE_KEY = "my-expo";

export const initialExpo = { title: DEFAULT_TITLE, ids: [] };

export function expoReducer(state, action) {
  switch (action.type) {
    case "add":
      if (state.ids.includes(action.id) || state.ids.length >= MAX_EXPO) return state;
      return { ...state, ids: [...state.ids, action.id] };
    case "remove":
      return { ...state, ids: state.ids.filter((id) => id !== action.id) };
    case "move": {
      const i = state.ids.indexOf(action.id);
      const j = i + action.delta;
      if (i === -1 || j < 0 || j >= state.ids.length) return state;
      const ids = [...state.ids];
      [ids[i], ids[j]] = [ids[j], ids[i]];
      return { ...state, ids };
    }
    case "rename":
      return { ...state, title: action.title };
    case "setOrder":
      return { ...state, ids: action.ids };
    case "replace":
      return action.expo;
    case "clear":
      return initialExpo;
    default:
      return state;
  }
}

export function loadExpo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialExpo;
    return decodeExpo(encodeExpo(JSON.parse(raw)));
  } catch {
    return initialExpo;
  }
}

export function saveExpo(expo) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expo));
  } catch {
    return;
  }
}