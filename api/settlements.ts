import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.development.local' });

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool: any = null;
if (databaseUrl) {
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  } catch (e) {
    console.error('Failed to init Postgres pool in settlements.ts:', e);
  }
}

let tablesCreated = false;
async function ensureTables() {
  if (!pool || tablesCreated) return;
  try {
    await pool.query(`
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
    `);
    tablesCreated = true;
  } catch (err) {
    console.error('Failed to create settlements table:', err);
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Portal-Role');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // 1. GET SETTLEMENTS
  if (req.method === 'GET') {
    if (!pool) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, settlements: [], persistent: false }));
    }

    try {
      await ensureTables();
      const result = await pool.query(
        'SELECT * FROM settlements ORDER BY created_at DESC LIMIT 100'
      );
      const settlements = result.rows.map((row: any) => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        entityName: row.entity_name,
        entityArea: row.entity_area,
        amount: Number(row.amount),
        method: row.method,
        transactionRef: row.transaction_ref,
        receiptImageUrl: row.receipt_image_url,
        receiptNotes: row.receipt_notes,
        status: row.status,
        rejectionReason: row.rejection_reason,
        adminNotes: row.admin_notes,
        createdAt: row.created_at,
        resolvedAt: row.resolved_at,
      }));

      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, settlements, persistent: true }));
    } catch (err: any) {
      console.error('Error fetching settlements from Postgres:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ ok: false, error: err.message || 'Database error' }));
    }
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // 2. CREATE SETTLEMENT (POST)
  if (req.method === 'POST') {
    const s = body?.settlement || body;
    if (!s || !s.id || !s.amount || !s.entityId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: 'بيانات السداد غير مكتملة' }));
    }

    if (!pool) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, settlement: s, persistent: false }));
    }

    try {
      await ensureTables();
      await pool.query(
        `
        INSERT INTO settlements (
          id, entity_type, entity_id, entity_name, entity_area,
          amount, method, transaction_ref, receipt_image_url, receipt_notes,
          status, created_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status
      `,
        [
          s.id,
          s.entityType,
          s.entityId,
          s.entityName || '',
          s.entityArea || '',
          s.amount,
          s.method,
          s.transactionRef,
          s.receiptImageUrl,
          s.receiptNotes || null,
          s.status || 'pending',
          s.createdAt || new Date().toISOString(),
        ]
      );

      res.statusCode = 201;
      return res.end(JSON.stringify({ ok: true, settlement: s, persistent: true }));
    } catch (err: any) {
      console.error('Error inserting settlement into Postgres:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ ok: false, error: err.message || 'Database error' }));
    }
  }

  // 3. RESOLVE SETTLEMENT: APPROVE OR REJECT (PATCH)
  if (req.method === 'PATCH') {
    const settlementId = body?.id || body?.settlementId;
    const status = body?.status; // 'approved' | 'rejected'
    if (!settlementId || !status) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: 'settlementId and status are required' }));
    }

    if (!pool) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, settlementId, status, persistent: false }));
    }

    try {
      await ensureTables();
      const resolvedAt = new Date().toISOString();
      const adminNotes = body.adminNotes || null;
      const rejectionReason = body.rejectionReason || null;

      await pool.query(
        `
        UPDATE settlements
        SET status = $1, resolved_at = $2, admin_notes = $3, rejection_reason = $4
        WHERE id = $5
      `,
        [status, resolvedAt, adminNotes, rejectionReason, settlementId]
      );

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          ok: true,
          settlementId,
          status,
          resolvedAt,
          persistent: true,
        })
      );
    } catch (err: any) {
      console.error('Error resolving settlement in Postgres:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ ok: false, error: err.message || 'Database error' }));
    }
  }

  res.statusCode = 405;
  return res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
}
