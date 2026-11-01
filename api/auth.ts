import crypto from 'crypto';

const AUTH_SECRET = process.env.VF_AUTH_SECRET || 'vogue-fast-hmac-vault-secret-2026-eg-v2';

export type PortalRole = 'admin' | 'vendor' | 'driver' | 'customer';

export interface SessionPayload {
  role: PortalRole;
  entityId: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

interface AuthAccountRecord {
  id: string;
  role: PortalRole;
  email: string;
  name: string;
  status: 'active' | 'frozen' | 'pending' | 'suspended';
  passwordHash: string;
}

// Salted scrypt password hashes (saltHex:scryptHashHex) — no plaintext passwords in code
const accountStore: AuthAccountRecord[] = [
  {
    id: 'admin-root',
    role: 'admin',
    email: process.env.ADMIN_EMAIL || 'owner@fastdrip.eg',
    name: 'المدير العام المالي',
    status: 'active',
    passwordHash:
      process.env.ADMIN_PASSWORD_HASH ||
      '7ddd1d1a24ee41818de7a8fbbcd4d481:113c3b7ce777cebae1c12f3948d98ad5a7eafaa97f5c8c1819afa718a0c1c1cc8b0b7f77c335b38e7fcea3710c427c056b36a1da9255de79c0729e353c94b6b1',
  },
  {
    id: 'v-1',
    role: 'vendor',
    email: 'untitled@fastdrip.eg',
    name: 'UNTITLED CAIRO',
    status: 'active',
    passwordHash:
      'cd6fc8602008e499677fad6cd314667a:a8fa54fd73ddecbb599776d718ea8430ee68fa2a8642511741507f9309c7ab0111861f2fe804e304cd8a1553bebb562d5b267936800068851dca215c64b93705',
  },
  {
    id: 'v-2',
    role: 'vendor',
    email: 'shabab@fastdrip.eg',
    name: 'SHABAB CO.',
    status: 'active',
    passwordHash:
      'ad283d9ffecfef3649254707cf622064:d9d8303df8c453e265f1b391eaf83bd955c472423b60d770ad4ae569f7b8ab9dd4a18d28d14e687edf047ba10d84e9583f7597fd99ad5253e8098337588fb9af',
  },
  {
    id: 'v-3',
    role: 'vendor',
    email: 'zag@fastdrip.eg',
    name: 'ZAG STORE',
    status: 'frozen',
    passwordHash:
      '9ffbe00c0e7bd0b2917c1ab225254696:f19c937a0da21f5e36f484a99e4d3f45c3aacdebce879bf8698384951a696e5722a612d25af3b18a46fb61e57818460b5e562df967d8cb289eaf0559c6270744',
  },
  {
    id: 'v-4',
    role: 'vendor',
    email: 'oversized@fastdrip.eg',
    name: 'OVERSIZED EG',
    status: 'active',
    passwordHash:
      '2afad8b8c1154835b7b705bd8d56b698:42281ff4a9822d07336b60bb473d5dc72c6e15e4c908912bcdbcb6be1096b3771402170053c9d0a4d92f2a3544eb2537597ec1cd4e4bd4135c999c4f66eb0d3e',
  },
  {
    id: 'v-5',
    role: 'vendor',
    email: 'noir@fastdrip.eg',
    name: 'NOIR ATELIER',
    status: 'active',
    passwordHash:
      '78b6c435982a847bcd02e1f577125cc0:716e7ed3a1641f323a5c0c50335a5b0fc1fdd7bca2395f1eab2d53e24aa5672de0bae58eab9181c6f8d49d7bb00df7bcc258b681c5c75112c8db8e65ba850d6d',
  },
  {
    id: 'v-6',
    role: 'vendor',
    email: 'streetvibe@fastdrip.eg',
    name: 'STREET VIBE CAIRO',
    status: 'pending',
    passwordHash:
      '17808a42b187bb21e30f64c5aca0ef6d:10d54a006394491322894e2aec3c3c4f2e641e33f67ac47d7c44cf4875d604d342aae288595e6a8219bd7c1a686274b295a775f32341f7ba3521d9db063cf3d4',
  },
  {
    id: 'd-1',
    role: 'driver',
    email: 'ahmed.driver@fastdrip.eg',
    name: 'كابتن أحمد يوسف',
    status: 'active',
    passwordHash:
      '487739b04f693920a3718c6ed473bef9:83b709b72f7bd4100c90c5c18b763e336aabe72afa808a8dc761bcb070dec5e24ca6535c0f8aa71a04d067dfda381be1fc0cb38e2260614c48239d793ed25383',
  },
  {
    id: 'd-2',
    role: 'driver',
    email: 'mahmoud.driver@fastdrip.eg',
    name: 'كابتن محمود شريف',
    status: 'active',
    passwordHash:
      '0277fa11f8a220ec5d2c3b70dfd26ea4:be96cca3db8eff821af3162a962a2fe67a26eed1f4d34fcf9d00120f628c600f67df3a39389bfbd42fae088a9aee93b01ec86ea2349c3f485302e35a08aeed1f',
  },
  {
    id: 'd-3',
    role: 'driver',
    email: 'hossam.driver@fastdrip.eg',
    name: 'كابتن حسام عبد الرحمن',
    status: 'frozen',
    passwordHash:
      '35e80fb460fba3846b04c8dc183d33b0:21c6d6c8cd44ade685ea06f0a926fb68b1d98b5af511793bffc5a43d361765aa53ad803b9c025839e951267292298979e43ba233099eec3f8d6f3687801e7cd0',
  },
  {
    id: 'd-4',
    role: 'driver',
    email: 'tarek.driver@fastdrip.eg',
    name: 'كابتن طارق السعيد',
    status: 'pending',
    passwordHash:
      '8a1c9756d505b890d4b12ffc1bb789e0:08ccebb7f263103c6b81b07b1dc803f8f8b7fcf95ae2602c95fc18515ea7f57d86995ca1ecbdea922b02ff3d72d1a2717d0daf0ae6d1d6a009f251875f4c6087',
  },
  {
    id: 'cust-1',
    role: 'customer',
    email: 'karim@fastdrip.eg',
    name: 'كريم مجدي',
    status: 'active',
    passwordHash:
      '49c774fca8155ae751a37d7107a71bab:26ba0420951776d798c4e5d865d2eb0a871e351d3798c7175bd863364cfbfd4fd12280aeb11aac4caf9796dd8bd2e3305107cef5b0c79e62e2683d15eca7014e',
  },
  {
    id: 'cust-2',
    role: 'customer',
    email: 'sara@fastdrip.eg',
    name: 'سارة طارق',
    status: 'active',
    passwordHash:
      'fcb02967c637aea2ef8753e47876fc99:c377c12c8263758f3580df944377c09ec3f2b5e54a3834a75fae7aab38ba75c1213c1f7fe15733c04f9857ec94abcf04bf6ee2936b1bf0ce049a5997d1768788',
  },
];

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, keyHex] = (storedHash || '').split(':');
  if (!salt || !keyHex) return false;
  try {
    const keyBuffer = Buffer.from(keyHex, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    if (keyBuffer.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export function signSessionToken(payload: Omit<SessionPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + 60 * 60 * 12, // 12-hour session expiration
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(data)
    .digest('base64url');

  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    if (key) {
      list[key] = decodeURIComponent(parts.join('=').trim());
    }
  });
  return list;
}

function makeCookieHeader(name: string, value: string, maxAgeSeconds: number): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

function getAuthenticatedSession(req: any): SessionPayload | null {
  const cookies = parseCookies(req.headers?.cookie);
  const authHeader = req.headers?.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  return verifySessionToken(bearerToken || cookies.vf_session);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const url = new URL(req.url || '/api/auth', 'http://localhost');
  const action = url.searchParams.get('action') || req.body?.action || 'session';
  const currentSession = getAuthenticatedSession(req);

  // 1. GET VERIFY / RBAC & OWNERSHIP CHECKS
  if (req.method === 'GET' || action === 'session' || action === 'verify' || action === 'records') {
    const requiredRole = (url.searchParams.get('role') || '') as PortalRole;
    const targetEntityId = url.searchParams.get('entityId') || '';
    const resource = url.searchParams.get('resource') || '';

    // If caller only asks for current session summary
    if (action === 'session' && !requiredRole && !targetEntityId && !resource) {
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          authenticated: !!currentSession,
          session: currentSession,
        })
      );
    }

    // Require authentication for any verify or records check
    if (!currentSession) {
      res.statusCode = 401;
      return res.end(
        JSON.stringify({
          authenticated: false,
          authorized: false,
          error: 'Unauthorized: Authentication required (401)',
        })
      );
    }

    // Enforce strict Role-Based Access Control (RBAC)
    if (requiredRole && currentSession.role !== requiredRole) {
      res.statusCode = 403;
      return res.end(
        JSON.stringify({
          authenticated: true,
          authorized: false,
          role: currentSession.role,
          requiredRole,
          error: `Forbidden: Role '${currentSession.role}' is not authorized to access '${requiredRole}' resources (403)`,
        })
      );
    }

    // Enforce strict Cross-Account Ownership (non-admins can only access their own entityId)
    if (targetEntityId && currentSession.role !== 'admin' && currentSession.entityId !== targetEntityId) {
      res.statusCode = 403;
      return res.end(
        JSON.stringify({
          authenticated: true,
          authorized: false,
          role: currentSession.role,
          entityId: currentSession.entityId,
          requestedEntityId: targetEntityId,
          error: `Forbidden: Cross-account access denied. Account '${currentSession.entityId}' cannot access records of '${targetEntityId}' (403)`,
        })
      );
    }

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        authenticated: true,
        authorized: true,
        session: currentSession,
        resource: resource || 'portal',
        entityId: targetEntityId || currentSession.entityId,
      })
    );
  }

  // Parse JSON body for POST requests
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // 2. LOGIN WITH EMAIL & PASSWORD (SALTY SCRYPT HASH VERIFICATION)
  if (req.method === 'POST' && body?.action === 'login') {
    const requestedRole = body.role as PortalRole;
    const email = String(body.email || body.identifier || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' }));
    }

    const account = accountStore.find((acc) => acc.email.toLowerCase() === email);
    if (!account) {
      // Do not auto-create accounts or leak existence
      res.statusCode = 401;
      return res.end(
        JSON.stringify({ ok: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
      );
    }

    // Verify password against salted scrypt hash
    const isPasswordValid = verifyPassword(password, account.passwordHash);
    if (!isPasswordValid) {
      res.statusCode = 401;
      return res.end(
        JSON.stringify({ ok: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
      );
    }

    // Enforce strict role matching for the portal being logged into
    if (requestedRole && account.role !== requestedRole) {
      res.statusCode = 403;
      return res.end(
        JSON.stringify({
          ok: false,
          error: `غير مصرح: هذا الحساب مسجل بصلاحية (${account.role}) ولا يملك صلاحية الدخول إلى بوابة (${requestedRole})`,
        })
      );
    }

    if (account.status === 'pending') {
      res.statusCode = 403;
      return res.end(
        JSON.stringify({
          ok: false,
          error: 'هذا الحساب لا يزال قيد المراجعة والاعتماد من الإدارة العليا',
        })
      );
    }

    if (account.status === 'suspended') {
      res.statusCode = 403;
      return res.end(
        JSON.stringify({
          ok: false,
          error: 'تم إيقاف هذا الحساب إدارياً. يرجى التواصل مع الإدارة العليا.',
        })
      );
    }

    const token = signSessionToken({
      role: account.role,
      entityId: account.id,
      email: account.email,
      name: account.name,
    });

    res.setHeader('Set-Cookie', [makeCookieHeader('vf_session', token, 60 * 60 * 12)]);
    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        ok: true,
        session: {
          role: account.role,
          entityId: account.id,
          email: account.email,
          name: account.name,
        },
      })
    );
  }

  // 3. REGISTER NEW ACCOUNT (CUSTOMER / PENDING VENDOR / PENDING DRIVER ONLY)
  if (req.method === 'POST' && body?.action === 'register') {
    const role = body.role as PortalRole;
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const name = String(body.name || '').trim();
    const id = String(body.entityId || body.id || `${role}-${Date.now().toString().slice(-4)}`);

    // Never allow admin account creation via registration
    if (role === 'admin' || !['customer', 'vendor', 'driver'].includes(role)) {
      res.statusCode = 403;
      return res.end(
        JSON.stringify({
          ok: false,
          error: 'Forbidden: Admin privileges cannot be granted through registration (403)',
        })
      );
    }

    if (!email || !email.includes('@') || password.length < 6 || !name) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          ok: false,
          error: 'يرجى إدخال بريد إلكتروني صحيح وكلمة مرور لا تقل عن 6 أحرف',
        })
      );
    }

    const existing = accountStore.find((acc) => acc.email.toLowerCase() === email);
    if (existing) {
      res.statusCode = 409;
      return res.end(
        JSON.stringify({
          ok: false,
          error: 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول باستخدام كلمة المرور الخاصة بك.',
        })
      );
    }

    // Only allow active status for vendor/driver if an authenticated admin is creating the account
    const status =
      role === 'customer'
        ? 'active'
        : currentSession?.role === 'admin' && body.status === 'active'
        ? 'active'
        : 'pending';

    const newAccount: AuthAccountRecord = {
      id,
      role,
      email,
      name,
      status,
      passwordHash: hashPassword(password),
    };
    accountStore.push(newAccount);

    // Only active customer accounts get an immediate session; pending vendors/drivers must await Admin approval
    if (role === 'customer') {
      const token = signSessionToken({
        role: 'customer',
        entityId: id,
        email,
        name,
      });
      res.setHeader('Set-Cookie', [makeCookieHeader('vf_session', token, 60 * 60 * 12)]);
      res.statusCode = 201;
      return res.end(
        JSON.stringify({
          ok: true,
          session: { role: 'customer', entityId: id, email, name },
        })
      );
    }

    res.statusCode = 201;
    return res.end(
      JSON.stringify({
        ok: true,
        status,
        entityId: id,
      })
    );
  }

  // 4. AUTHORIZE SENSITIVE MUTATIONS & FINANCIAL ACTIONS (RBAC + OWNERSHIP)
  if (req.method === 'POST' && body?.action === 'authorize-mutation') {
    if (!currentSession) {
      res.statusCode = 401;
      return res.end(
        JSON.stringify({
          ok: false,
          authorized: false,
          error: 'Unauthorized: You must be logged in to perform this action (401)',
        })
      );
    }

    const requiredRole = (body.requiredRole || '') as PortalRole;
    const operation = String(body.mutation || body.operation || '');
    const targetEntityId = String(body.targetEntityId || body.entityId || '');

    // If requiredRole is explicitly provided, enforce it (admin is allowed to manage platform entities)
    if (requiredRole) {
      if (requiredRole === 'admin' && currentSession.role !== 'admin') {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({
            ok: false,
            authorized: false,
            error: `Forbidden: Operation '${operation}' requires 'admin' role, but current role is '${currentSession.role}' (403)`,
          })
        );
      }

      if (requiredRole !== 'admin' && currentSession.role !== requiredRole && currentSession.role !== 'admin') {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({
            ok: false,
            authorized: false,
            error: `Forbidden: Role '${currentSession.role}' cannot perform '${requiredRole}' operation '${operation}' (403)`,
          })
        );
      }

      if (targetEntityId && currentSession.role !== 'admin' && currentSession.entityId !== targetEntityId) {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({
            ok: false,
            authorized: false,
            error: `Forbidden: Account '${currentSession.entityId}' cannot modify records belonging to '${targetEntityId}' (403)`,
          })
        );
      }

      if (
        currentSession.role === 'admin' &&
        (operation === 'approve-pending-vendor' ||
          operation === 'approve-pending-driver' ||
          operation === 'approve_onboarding') &&
        targetEntityId
      ) {
        const targetAcc = accountStore.find((a) => a.id === targetEntityId);
        if (targetAcc) targetAcc.status = 'active';
      }

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          ok: true,
          authorized: true,
          authorizedBy: currentSession.entityId,
        })
      );
    }

    res.statusCode = 400;
    return res.end(JSON.stringify({ ok: false, authorized: false, error: 'Missing requiredRole or operation' }));
  }

  // 5. UPDATE PASSWORD (REQUIRES ADMIN OR SELF OWNERSHIP)
  if (req.method === 'POST' && body?.action === 'update-password') {
    if (!currentSession) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ ok: false, error: 'Unauthorized (401)' }));
    }

    const targetId = String(body.targetEntityId || body.targetId || '');
    const newPassword = String(body.newPassword || '');

    if (currentSession.role !== 'admin' && currentSession.entityId !== targetId) {
      res.statusCode = 403;
      return res.end(
        JSON.stringify({
          ok: false,
          error: 'Forbidden: Cannot change password for another user (403)',
        })
      );
    }

    if (newPassword.length < 6) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({ ok: false, error: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف' })
      );
    }

    const targetAcc = accountStore.find((a) => a.id === targetId);
    if (!targetAcc) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ ok: false, error: 'الحساب غير موجود' }));
    }

    targetAcc.passwordHash = hashPassword(newPassword);
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true }));
  }

  // 6. LOGOUT
  if (req.method === 'POST' && body?.action === 'logout') {
    res.setHeader('Set-Cookie', [
      makeCookieHeader('vf_session', '', 0),
      makeCookieHeader('vf_token_admin', '', 0),
      makeCookieHeader('vf_token_vendor', '', 0),
      makeCookieHeader('vf_token_driver', '', 0),
      makeCookieHeader('vf_token_customer', '', 0),
    ]);
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true }));
  }

  res.statusCode = 400;
  return res.end(JSON.stringify({ ok: false, error: 'Unsupported auth action' }));
}
