import { useSyncExternalStore } from "react";
import { CATALOG_URL, catalogReady, initCatalog, type RawCatalog } from "./catalog";

type Status = "loading" | "ready" | "error";

let status: Status = "loading";
let started = false;
const listeners = new Set<() => void>();

function notify(next: Status) {
  status = next;
  for (const l of listeners) l();
}

export function loadCatalog() {
  if (catalogReady() || started) return;
  started = true;
  fetch(CATALOG_URL)
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json() as Promise<RawCatalog>;
    })
    .then((raw) => {
      initCatalog(raw);
      notify("ready");
    })
    .catch(() => {
      started = false;
      notify("error");
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  queueMicrotask(loadCatalog);
  return () => listeners.delete(listener);
}

export function useCatalogStatus(): Status {
  return useSyncExternalStore(
    subscribe,
    () => (catalogReady() ? "ready" : status),
    () => "loading",
  );
}

export function retryCatalog() {
  notify("loading");
  loadCatalog();
}
