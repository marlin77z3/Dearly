import type { Metadata } from "next";
import CreateForm from "./CreateForm";
import "./create.css";

export const metadata: Metadata = { title: "Crea tu carta · Dearly" };

export default function CrearPage() {
  return <CreateForm />;
}
