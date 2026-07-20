import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import AuthBootstrap from "@/auth/components/AuthBootstrap";
import RouteErrorBoundary from "@/common/components/RouteErrorBoundary";
import { queryClient } from "@/common/config/queryClient";
import "./styles/index.css";
import "mapbox-gl/dist/mapbox-gl.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouteErrorBoundary>
          <AuthBootstrap>
            <App />
          </AuthBootstrap>
        </RouteErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
