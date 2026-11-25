import { createContext, useContext, useEffect, useReducer } from "react";
import { expoReducer, loadExpo, saveExpo } from "../lib/expoReducer.js";

const ExpoContext = createContext(null);

export function ExpoProvider({ children }) {
  const [expo, dispatch] = useReducer(expoReducer, undefined, loadExpo);

  useEffect(() => {
    saveExpo(expo);
  }, [expo]);

  return <ExpoContext.Provider value={{ expo, dispatch }}>{children}</ExpoContext.Provider>;
}

export function useExpo() {
  return useContext(ExpoContext);
}