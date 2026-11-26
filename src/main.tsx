import "@fontsource/inter/latin-200.css";
import "@fontsource/inter/latin-ext-200.css";
import "@fontsource/inter/latin-300.css";
import "@fontsource/inter/latin-ext-300.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-ext-400.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-ext-600.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/tokens.css";
import "./styles/global.css";

const root = document.getElementById("root");
if (!root) throw new Error("root missing");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
