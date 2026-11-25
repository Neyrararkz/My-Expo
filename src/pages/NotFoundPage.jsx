import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div>
      <h1>404</h1>
      <p>Такой страницы нет.</p>
      <Link to="/">На главную</Link>
    </div>
  );
}