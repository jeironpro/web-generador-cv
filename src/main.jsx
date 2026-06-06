// Punto de entrada de la aplicación React
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Estilos globales + Tailwind
import App from "./App.jsx"; // Componente principal

// Renderiza la app dentro del div#root del index.html
createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
