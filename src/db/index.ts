import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * `neon()` is lazy: it opens no connection until a query actually runs. So a
 * missing DATABASE_URL during `next build` (dynamic routes issue no queries at
 * build time) is harmless. We fall back to a syntactically-valid placeholder
 * so the client — and the Auth.js Drizzle adapter's dialect detection — can be
 * constructed without throwing. Real requests at runtime use the real value;
 * if it's genuinely unset then, the first query fails with a connection error.
 */
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder";

export const db = drizzle(neon(connectionString), { schema });
export { schema };
