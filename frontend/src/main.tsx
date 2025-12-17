import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./styles.css";
import App from "./App.jsx";
import { ToastProvider } from "./components/Toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <App />
            </ToastProvider>
        </BrowserRouter>
    </React.StrictMode>
);
