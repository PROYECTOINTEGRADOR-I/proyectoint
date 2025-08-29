import { Router } from 'express';
import { pool } from './db.ts';
import { requireAuth, requireRole } from './auth.ts';
import { RowDataPacket } from 'mysql2';

const router = Router();

/**
 * @route POST /api/transacciones
 * @description Registrar una nueva transacción y generar factura usando SP_RegistrarTransaccionConFactura.
 * @access Private (Agente Manual)
 */
router.post(
  '/transacciones',
  requireAuth,
  requireRole(['Agente Manual']),
  async (req, res) => {
    const { id_material, pesaje_kg, id_agente_manual } = req.body;

    if (!id_material || !pesaje_kg || !id_agente_manual) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios para la transacción.',
      });
    }

    const conn = await (await pool).getConnection();
    try {
      // Llamada al procedimiento almacenado + obtener valores de salida
      const [rows] = await conn.query(
        'CALL SP_RegistrarTransaccionConFactura(?, ?, ?, @o_id_transaccion, @o_id_factura, @o_qr_token); SELECT @o_id_transaccion AS id_transaccion, @o_id_factura AS id_factura, @o_qr_token AS qr_token;',
        [id_material, pesaje_kg, id_agente_manual]
      );

      // El resultado del SELECT está en la segunda posición
      const result: any = (rows as any)[1][0];

      return res.status(201).json({
        success: true,
        message: 'Transacción registrada exitosamente.',
        transaccion: {
          id_transaccion: result.id_transaccion,
          id_factura: result.id_factura,
          qr_token: result.qr_token,
        },
      });
    } catch (e) {
      console.error('Error al registrar la transacción:', e);
      return res
        .status(500)
        .json({ success: false, message: 'Error interno al registrar transacción.' });
    } finally {
      conn.release();
    }
  }
);

/**
 * @route GET /api/transacciones
 * @description Obtener todas las transacciones con factura y datos de material.
 * @access Private (Agente Manual o Cajero)
 */
router.get(
  '/transacciones',
  requireAuth,
  requireRole(['Agente Manual', 'Cajero']),
  async (req, res) => {
    const sql = 'SELECT * FROM Vista_Facturas ORDER BY fecha_hora DESC';

    const conn = await (await pool).getConnection();
    try {
      const [rows] = await conn.query(sql);
      return res.json({ success: true, transacciones: rows as RowDataPacket[] });
    } catch (e) {
      console.error('Error al obtener transacciones:', e);
      return res
        .status(500)
        .json({ success: false, message: 'Error interno al obtener transacciones.' });
    } finally {
      conn.release();
    }
  }
);

/**
 * @route GET /api/materiales
 * @description Obtener lista de materiales disponibles.
 * @access Private (Agente Manual o Cajero)
 */
router.get(
  '/materiales',
  requireAuth,
  requireRole(['Agente Manual', 'Cajero']),
  async (req, res) => {
    const sql = 'SELECT id_material, nombre_material FROM Materiales ORDER BY nombre_material ASC';

    const conn = await (await pool).getConnection();
    try {
      const [rows] = await conn.query(sql);
      return res.json({ success: true, materiales: rows as RowDataPacket[] });
    } catch (e) {
      console.error('Error al obtener materiales:', e);
      return res
        .status(500)
        .json({ success: false, message: 'Error interno al obtener materiales.' });
    } finally {
      conn.release();
    }
  }
);

/**
 * @route GET /factura/:qr_token
 * @description Página pública para ver factura digital
 */
router.get('/factura/:qr_token', async (req, res) => {
  const { qr_token } = req.params;

  try {
    const conn = await (await pool).getConnection();

    // Buscar transacción por qr_token
    const sql = 'SELECT * FROM Vista_Facturas WHERE qr_token = ? LIMIT 1';
    const [rows] = await conn.query(sql, [qr_token]);
    conn.release();

    if ((rows as any[]).length === 0) {
      return res.status(404).send('Factura no encontrada');
    }

    const transaccion = (rows as any[])[0];

    // HTML para mostrar la factura
    res.send(`
      <html>
        <head>
          <title>Factura Digital</title>
          <style>
            body { font-family: Arial; max-width: 600px; margin: auto; padding: 20px; }
            h1 { color: #004a99; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Factura Digital</h1>
          <table>
            <tr><th>ID Transacción</th><td>${transaccion.id_transaccion}</td></tr>
            <tr><th>ID Factura</th><td>${transaccion.id_factura}</td></tr>
            <tr><th>Fecha</th><td>${new Date(transaccion.fecha_hora).toLocaleDateString()}</td></tr>
            <tr><th>Hora</th><td>${new Date(transaccion.fecha_hora).toLocaleTimeString()}</td></tr>
            <tr><th>Peso</th><td>${transaccion.pesaje_kg} kg</td></tr>
            <tr><th>Material</th><td>${transaccion.material}</td></tr>
            <tr><th>Monto</th><td>₡ ${Number(transaccion.monto_total).toFixed(2)}</td></tr>
          </table>
        </body>
      </html>
    `);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno al mostrar la factura');
  }
});




export default router;
