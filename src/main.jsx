import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.jsx";
import { TrappersProvider } from "./contexts/TrappersContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <TrappersProvider>
        <App />
      </TrappersProvider>
    </AuthProvider>
  </StrictMode>
);
