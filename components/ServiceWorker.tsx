"use client";

import { useEffect } from "react";

export default function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("Service Worker registered successfully"))
        .catch((err) =>
          console.error("Service Worker registration failed:", err)
        );
    }
  }, []);

  return null; // no UI
}
