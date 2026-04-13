import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootEl = document.getElementById("root")!;
// Prevent browser-extension DOM mutations from crashing React
rootEl.setAttribute("data-reactroot", "");
createRoot(rootEl).render(<App />);
