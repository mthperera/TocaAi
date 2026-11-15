import catalogJson from "@/data/catalog.json";
import { initCatalog, type RawCatalog } from "./catalog";

initCatalog(catalogJson as RawCatalog);

export * from "./catalog";
