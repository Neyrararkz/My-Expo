import { Routes, Route, NavLink } from "react-router-dom";
import SearchPage from "./pages/SearchPage.jsx";
import ArtworkPage from "./pages/ArtworkPage.jsx";
import ExpoPage from "./pages/ExpoPage.jsx";
import ExpoViewPage from "./pages/ExpoViewPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <NavLink to="/" end>Поиск</NavLink>
        <NavLink to="/expo">Моя выставка</NavLink>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/artwork/:id" element={<ArtworkPage />} />
          <Route path="/expo" element={<ExpoPage />} />
          <Route path="/expo/view" element={<ExpoViewPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}