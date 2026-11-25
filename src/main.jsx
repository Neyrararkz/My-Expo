import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ExpoProvider } from "./context/ExpoContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ExpoProvider>
        <App />
      </ExpoProvider>
    </BrowserRouter>
  </StrictMode>
);