import { useParams } from "react-router-dom";

export default function ArtworkPage() {
  const { id } = useParams();
  return <h1>Работа № {id}</h1>;
}