import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { portalCredentials } from './db-schema';

dotenv.config({ path: '.env.development.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('[v0] DATABASE_URL is not configured; credential persistence is unavailable.');
}

export const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl, max: 5 })
  : null;

export const db = pool ? drizzle(pool, { schema: { portalCredentials } }) : null;
