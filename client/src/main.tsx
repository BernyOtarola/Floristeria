import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
// Si no tienes este CSS, quita la línea:
import "./index.css";
// Si no tienes Toaster, quita ambas líneas:
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();
const el = document.getElementById("root");
if (!el) throw new Error("No se encontró #root en index.html");

createRoot(el).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
