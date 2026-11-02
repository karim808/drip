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
    console.error('Failed to init Postgres pool in orders.ts:', e);
  }
}

let tablesCreated = false;
async function ensureTables() {
  if (!pool || tablesCreated) return;
  try {
    await pool.query(`
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
    `);
    tablesCreated = true;
  } catch (err) {
    console.error('Failed to create orders table:', err);
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

  const url = new URL(req.url || '/api/orders', 'http://localhost');

  // 1. GET ORDERS
  if (req.method === 'GET') {
    if (!pool) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, orders: [], persistent: false }));
    }

    try {
      await ensureTables();
      const vendorId = url.searchParams.get('vendorId');
      const driverId = url.searchParams.get('driverId');
      const status = url.searchParams.get('status');
      const id = url.searchParams.get('id');

      let query = 'SELECT * FROM orders WHERE 1=1';
      const params: any[] = [];

      if (id) {
        params.push(id);
        query += ` AND id = $${params.length}`;
      }
      if (vendorId) {
        params.push(vendorId);
        query += ` AND vendor_id = $${params.length}`;
      }
      if (driverId) {
        params.push(driverId);
        query += ` AND driver_id = $${params.length}`;
      }
      if (status) {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }

      query += ' ORDER BY created_at DESC LIMIT 100';

      const result = await pool.query(query, params);
      const orders = result.rows.map((row: any) => ({
        id: row.id,
        orderNumber: row.order_number,
        customerId: row.customer_id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerArea: row.customer_area,
        customerAddress: row.customer_address,
        customerCoordinates: row.customer_coordinates,
        paymentMethod: row.payment_method,
        vendorId: row.vendor_id,
        vendorName: row.vendor_name,
        vendorArea: row.vendor_area,
        vendorCoordinates: row.vendor_coordinates,
        driverId: row.driver_id,
        driverName: row.driver_name,
        driverPhone: row.driver_phone,
        driverAvatar: row.driver_avatar,
        driverVehicle: row.driver_vehicle,
        driverVehicleNumber: row.driver_vehicle_number,
        driverVehiclePhoto: row.driver_vehicle_photo,
        items: row.items,
        clothesTotal: Number(row.clothes_total),
        distanceKm: Number(row.distance_km),
        deliveryFee: Number(row.delivery_fee),
        totalAmount: Number(row.total_amount),
        vendorCommission: Number(row.vendor_commission),
        driverCommission: Number(row.driver_commission),
        status: row.status,
        returnReason: row.return_reason,
        returnCode: row.return_code,
        vendorRejectedReason: row.vendor_rejected_reason,
        returnReceivedAt: row.return_received_at,
        vendorRating: row.vendor_rating,
        vendorReview: row.vendor_review,
        driverRating: row.driver_rating,
        driverReview: row.driver_review,
        ratedAt: row.rated_at,
        notes: row.notes,
        createdAt: row.created_at,
      }));

      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, orders, persistent: true }));
    } catch (err: any) {
      console.error('Error fetching orders from Postgres:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ ok: false, error: err.message || 'Database error' }));
    }
  }

  // Parse body for write operations
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // 2. CREATE NEW ORDER (POST)
  if (req.method === 'POST') {
    const order = body?.order || body;
    if (!order || !order.id || !order.vendorId || !order.clothesTotal) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: 'بيانات الطلب غير مكتملة' }));
    }

    if (!pool) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, order, persistent: false }));
    }

    try {
      await ensureTables();
      await pool.query(
        `
        INSERT INTO orders (
          id, order_number, customer_id, customer_name, customer_phone,
          customer_area, customer_address, customer_coordinates, payment_method,
          vendor_id, vendor_name, vendor_area, vendor_coordinates,
          items, clothes_total, distance_km, delivery_fee, total_amount,
          vendor_commission, driver_commission, status, notes, created_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW()
      `,
        [
          order.id,
          order.orderNumber,
          order.customerId || null,
          order.customerName,
          order.customerPhone,
          order.customerArea,
          order.customerAddress,
          JSON.stringify(order.customerCoordinates || null),
          order.paymentMethod,
          order.vendorId,
          order.vendorName,
          order.vendorArea || null,
          JSON.stringify(order.vendorCoordinates || null),
          JSON.stringify(order.items || []),
          order.clothesTotal,
          order.distanceKm || 10,
          order.deliveryFee || 45,
          order.totalAmount,
          order.vendorCommission || 0,
          order.driverCommission || 0,
          order.status || 'pending_vendor',
          order.notes || null,
          order.createdAt || new Date().toISOString(),
        ]
      );

      res.statusCode = 201;
      return res.end(JSON.stringify({ ok: true, order, persistent: true }));
    } catch (err: any) {
      console.error('Error inserting order into Postgres:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ ok: false, error: err.message || 'Database error' }));
    }
  }

  // 3. UPDATE ORDER STATUS & FIELDS (PATCH)
  if (req.method === 'PATCH') {
    const orderId = body?.id || body?.orderId;
    if (!orderId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: 'orderId is required' }));
    }

    if (!pool) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, orderId, updates: body, persistent: false }));
    }

    try {
      await ensureTables();
      const updates = body.updates || body;
      const setClauses: string[] = ['updated_at = NOW()'];
      const params: any[] = [orderId];

      const allowedFields: Record<string, string> = {
        status: 'status',
        driverId: 'driver_id',
        driverName: 'driver_name',
        driverPhone: 'driver_phone',
        driverAvatar: 'driver_avatar',
        driverVehicle: 'driver_vehicle',
        driverVehicleNumber: 'driver_vehicle_number',
        driverVehiclePhoto: 'driver_vehicle_photo',
        vendorRejectedReason: 'vendor_rejected_reason',
        returnReason: 'return_reason',
        returnCode: 'return_code',
        returnReceivedAt: 'return_received_at',
        vendorRating: 'vendor_rating',
        vendorReview: 'vendor_review',
        driverRating: 'driver_rating',
        driverReview: 'driver_review',
        ratedAt: 'rated_at',
      };

      for (const [key, col] of Object.entries(allowedFields)) {
        if (updates[key] !== undefined) {
          params.push(updates[key]);
          setClauses.push(`${col} = $${params.length}`);
        }
      }

      await pool.query(
        `UPDATE orders SET ${setClauses.join(', ')} WHERE id = $1`,
        params
      );

      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, orderId, persistent: true }));
    } catch (err: any) {
      console.error('Error updating order in Postgres:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ ok: false, error: err.message || 'Database error' }));
    }
  }

  res.statusCode = 405;
  return res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
}
