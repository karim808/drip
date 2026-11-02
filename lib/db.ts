import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './db-schema';

dotenv.config({ path: '.env.development.local' });

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      max: 10,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;

let tablesCreated = false;

export async function ensureTables(): Promise<boolean> {
  if (!pool || tablesCreated) return Boolean(pool);

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS portal_credentials (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT portal_credentials_entity_unique UNIQUE (entity_type, entity_id),
        CONSTRAINT portal_credentials_email_unique UNIQUE (email)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number TEXT NOT NULL,
        customer_id TEXT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_area TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        customer_coordinates JSONB,
        payment_method TEXT NOT NULL,
        vendor_id TEXT NOT NULL,
        vendor_name TEXT NOT NULL,
        vendor_area TEXT,
        vendor_coordinates JSONB,
        driver_id TEXT,
        driver_name TEXT,
        driver_phone TEXT,
        driver_avatar TEXT,
        driver_vehicle TEXT,
        driver_vehicle_number TEXT,
        driver_vehicle_photo TEXT,
        items JSONB NOT NULL,
        clothes_total DOUBLE PRECISION NOT NULL,
        distance_km DOUBLE PRECISION NOT NULL,
        delivery_fee DOUBLE PRECISION NOT NULL,
        total_amount DOUBLE PRECISION NOT NULL,
        vendor_commission DOUBLE PRECISION NOT NULL,
        driver_commission DOUBLE PRECISION NOT NULL,
        status TEXT NOT NULL,
        return_reason TEXT,
        return_code TEXT,
        vendor_rejected_reason TEXT,
        return_received_at TEXT,
        vendor_rating INTEGER,
        vendor_review TEXT,
        driver_rating INTEGER,
        driver_review TEXT,
        rated_at TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS settlements (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        entity_name TEXT NOT NULL,
        entity_area TEXT,
        amount DOUBLE PRECISION NOT NULL,
        method TEXT NOT NULL,
        transaction_ref TEXT NOT NULL,
        receipt_image_url TEXT NOT NULL,
        receipt_notes TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        rejection_reason TEXT,
        admin_notes TEXT,
        created_at TEXT NOT NULL,
        resolved_at TEXT
      );

      CREATE TABLE IF NOT EXISTS platform_entities (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        current_debt DOUBLE PRECISION NOT NULL DEFAULT 0,
        debt_limit DOUBLE PRECISION NOT NULL DEFAULT 3000,
        total_sales DOUBLE PRECISION NOT NULL DEFAULT 0,
        total_trips INTEGER NOT NULL DEFAULT 0,
        total_earnings DOUBLE PRECISION NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    tablesCreated = true;
    return true;
  } catch (err) {
    console.error('Failed to create PostgreSQL tables:', err);
    return false;
  }
}
