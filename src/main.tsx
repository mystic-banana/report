import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
// Import the dev tools and initialize them
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const AppWithRouter = () => {
  if (import.meta.env.VITE_TEMPO) {
    // Tempo routes handle their own routing context
    return <App />;
  }

  // Standard app needs BrowserRouter wrapper
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AppWithRouter />
    </HelmetProvider>
  </React.StrictMode>,
);
