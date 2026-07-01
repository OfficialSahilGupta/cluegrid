import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./i18n";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found.");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <GoogleOAuthProvider
      clientId="1024989209731-4motjn5de3tgsqf3tfq7rqvbi5n8fqib.apps.googleusercontent.com"
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);