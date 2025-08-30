import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from './db.ts';

const router = Router();

function signToken(payload: object) {
  const secret = process.env.JWT_SECRET || 'dev_secret';
  return jwt.sign(payload, secret, { expiresIn: '2h' });
}

function verifyToken(token?: string) {
  const secret = process.env.JWT_SECRET || 'dev_secret';
  return jwt.verify(token || '', secret) as { userId: number; role: string };
}

export function requireAuth(req: any, res: any, next: any) {
  try {
    const token = req.cookies?.token;
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }
}

export function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    next();
  };
}

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Faltan credenciales.' });
    }

    const conn = await (await pool).getConnection();
    try {
      await conn.query('CALL SP_LoginUsuario(?, ?, @o_id, @o_rol, @o_ok)', [username, password]);
      const [rows]: any = await conn.query('SELECT @o_id AS id, @o_rol AS rol, @o_ok AS ok');
      const row = rows?.[0];

      const ok = row?.ok === 1 || row?.ok === true || row?.ok === '1';
      if (!ok) {
        return res.status(401).json({ success: false, message: 'Usuario o contraseña inválidos.' });
      }

      const userId = Number(row.id);
      const role = String(row.rol); // 'Agente Manual' | 'Cajero'
      const token = signToken({ userId, role });

      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // en prod: true con HTTPS
        maxAge: 1000 * 60 * 60 * 2
      });

      return res.json({ success: true, userId, role });
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Error interno.' });
  }
});

// GET /api/me
router.get('/me', requireAuth, (req: any, res) => {
  return res.json({ success: true, userId: req.user.userId, role: req.user.role });
});

// POST /api/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false });
  res.json({ success: true });
});

// POST /procesar-pago 
router.post('/procesar-pago', requireAuth, requireRole(['Cajero']), async (req, res) => {
  try {
    const { qr_token, id_cajero } = req.body;
    if (!qr_token || !id_cajero) {
      return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }

    // Extraer token si viene como URL
    let cleanToken = qr_token;
    if (qr_token.includes('/factura/')) {
      const parts = qr_token.split('/factura/');
      cleanToken = parts[parts.length - 1];
    }

    // Si el QR no es de nuestro sistema, rechazar
    if (!cleanToken || cleanToken.includes('http') || cleanToken.includes('www')) {
      return res.json({ 
        success: false, 
        message: 'QR no válido. Use un QR generado por el sistema de registro.' 
      });
    }

    const conn = await (await pool).getConnection();
    try {
      // Verificar si existe la transacción (manejo de campos que pueden no existir)
      const [transRows]: any = await conn.query(`
        SELECT 
          t.id_transaccion, 
          t.pesaje_kg, 
          t.monto_total, 
          COALESCE(t.nombre_cliente, 'Cliente') as nombre_cliente,
          m.nombre_material 
        FROM Transacciones t 
        JOIN Materiales m ON t.id_material = m.id_material 
        WHERE t.qr_token = ?
      `, [cleanToken]);

      if (transRows.length === 0) {
        return res.json({ 
          success: false, 
          message: 'QR no encontrado en el sistema. Asegúrese de usar un QR válido generado por el registro de entregas.' 
        });
      }

      const transaccion = transRows[0];
      
      // Procesar el pago
      await conn.query('CALL SP_ValidarProcesarQR(?, ?, ?, @o_success, @o_mensaje)', 
        [cleanToken, id_cajero, transaccion.monto_total]);
      
      const [rows]: any = await conn.query('SELECT @o_success AS success, @o_mensaje AS message');
      const result = rows?.[0];
      
      if (result?.success === 1) {
        return res.json({ 
          success: true, 
          message: result.message,
          recibo: {
            id_transaccion: transaccion.id_transaccion,
            id_factura: transaccion.id_transaccion,
            fecha_hora: new Date().toISOString(),
            pesaje_kg: transaccion.pesaje_kg,
            material: transaccion.nombre_material,
            monto_total: transaccion.monto_total,
            nombre_cliente: transaccion.nombre_cliente,
            qr_token: cleanToken
          }
        });
      } else {
        return res.json({ success: false, message: result?.message || 'Error al procesar el pago' });
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

export default router;
