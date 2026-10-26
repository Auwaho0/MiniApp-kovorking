import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { QueryProvider } from "./providers/QueryProvider";
import { TelegramProvider } from "./providers/TelegramProvider";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TelegramProvider>
      <QueryProvider>
        <App />
      </QueryProvider>
    </TelegramProvider>
  </React.StrictMode>,
);