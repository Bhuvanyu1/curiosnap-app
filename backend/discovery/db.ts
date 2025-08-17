import { SQLDatabase } from "encore.dev/storage/sqldb";

export const discoveryDB = new SQLDatabase("discovery", {
  migrations: "./migrations",
});
