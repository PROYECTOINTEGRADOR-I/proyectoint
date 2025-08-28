import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import logoInolasa from "../assets/logo-inolasa.png";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

interface Transaccion {
  id_transaccion: number;
  id_factura: number;
  fecha_hora: string;
  pesaje_kg: number;
  material: string;
  monto_total: number;
  qr_token: string;
}

export default function RegistroEntrega() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [transaccionActual, setTransaccionActual] = useState<Transaccion | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarRecibo, setMostrarRecibo] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' | null }>({ texto: '', tipo: null });

  const [pesaje, setPesaje] = useState("");
  const [material, setMaterial] = useState("");
  const [listaMateriales, setListaMateriales] = useState<{id_material: number, nombre_material: string}[]>([]);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [userId, setUserId] = useState<number>(1); // temporal, reemplazar con /api/me

  // Función para generar URL del QR
  const generarTextoQR = (t: Transaccion) => `${window.location.origin}/factura/${t.qr_token}`;

  // Obtener lista de materiales
  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const res = await fetch("/api/materiales");
        const data = await res.json();
        if (Array.isArray(data.materiales)) {
          setListaMateriales(data.materiales);
        } else {
          console.error("Formato inesperado de materiales:", data);
          setListaMateriales([]);
        }
      } catch (error) {
        console.error("Error al cargar materiales", error);
        setListaMateriales([]);
      }
    };
    fetchMateriales();
  }, []);

  // Obtener transacciones
  useEffect(() => {
    const fetchTransacciones = async () => {
      try {
        const res = await fetch("/api/transacciones");
        const data = await res.json();
        if (res.ok) setTransacciones(data.transacciones);
        else setMensaje({ texto: data.message || 'Error al cargar transacciones', tipo: 'error' });
      } catch (error) {
        console.error('Error de red:', error);
        setMensaje({ texto: 'No se pudo conectar con el servidor', tipo: 'error' });
      }
    };
    fetchTransacciones();
  }, []);

  const abrirFormulario = () => {
    setMostrarFormulario(true);
    setTransaccionActual(null);
    setMostrarRecibo(false);
    setPesaje("");
    setMaterial("");
    setMensaje({ texto: '', tipo: null });

    const now = new Date();
    setFecha(now.toISOString().split('T')[0]); // yyyy-mm-dd
    setHora(now.toTimeString().split(' ')[0]);  // hh:mm:ss
  };

  const confirmarTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: null });

    if (!pesaje || !material) {
      setMensaje({ texto: 'Complete todos los campos', tipo: 'error' });
      return;
    }

    try {
      const res = await fetch("/api/transacciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesaje_kg: Number(pesaje),
          id_material: Number(material),
          id_agente_manual: userId
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje({ texto: data.message, tipo: 'exito' });

        const materialNombre = listaMateriales.find(m => m.id_material === Number(material))?.nombre_material || "Desconocido";
        const nuevaTransaccion: Transaccion = {
          id_transaccion: data.transaccion.id_transaccion,
          id_factura: data.transaccion.id_factura,
          fecha_hora: new Date().toISOString(),
          pesaje_kg: Number(pesaje),
          material: materialNombre,
          monto_total: 0,
          qr_token: data.transaccion.qr_token
        };

        setTransacciones([nuevaTransaccion, ...transacciones]);
        setTransaccionActual(nuevaTransaccion);
        setMostrarFormulario(false);

      } else {
        setMensaje({ texto: data.message || 'Error al registrar transacción', tipo: 'error' });
      }

    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'No se pudo conectar con el servidor', tipo: 'error' });
    }
  };

  const imprimirQR = () => {
    const printContent = document.getElementById("qr-print");
    if (printContent) {
      const printWindow = window.open("", "Print QR", "width=400,height=600");
      if (printWindow) {
        printWindow.document.write('<html><head><title>Imprimir QR</title></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const ReciboDigital = ({ transaccion }: { transaccion: Transaccion }) => {
    const fechaObj = new Date(transaccion.fecha_hora);
    return (
      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 30, maxWidth: 400, margin: "auto", backgroundColor: "#f9f9f9" }}>
        <h2 style={{ textAlign: "center", color: "#004a99" }}>Recibo Digital</h2>
        <p><strong>ID Transacción:</strong> {transaccion.id_transaccion}</p>
        <p><strong>ID Factura:</strong> {transaccion.id_factura}</p>
        <p><strong>Fecha:</strong> {fechaObj.toLocaleDateString()}</p>
        <p><strong>Hora:</strong> {fechaObj.toLocaleTimeString()}</p>
        <p><strong>Peso:</strong> {transaccion.pesaje_kg} kg</p>
        <p><strong>Material:</strong> {transaccion.material}</p>
        <p><strong>Monto:</strong> ₡ {transaccion.monto_total.toFixed(2)}</p>
        <div id="qr-print" style={{ marginTop: 20, textAlign: "center" }}>
          <QRCode value={generarTextoQR(transaccion)} size={180} />
        </div>
        <button onClick={() => setMostrarRecibo(false)} style={botonStyle("#004a99")}>Cerrar Recibo</button>
      </div>
    );
  };

  const botonStyle = (color: string) => ({
    marginTop: 10,
    backgroundColor: color,
    color: "white",
    border: "none",
    padding: "10px",
    width: "100%",
    fontSize: 16,
    borderRadius: 4,
    cursor: "pointer",
  });

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <header style={{ marginBottom: 20, borderBottom: "2px solid #004a99", paddingBottom: 10 }}>
        <img src={logoInolasa} alt="Inolasa Logo" style={{ height: 60 }} />
      </header>

      {mensaje.texto && (
        <div style={{ padding: 15, borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', backgroundColor: mensaje.tipo === 'exito' ? '#e6f7ec' : '#fde7e7', color: mensaje.tipo === 'exito' ? '#1c713b' : '#922626' }}>
          {mensaje.tipo === 'exito' ? <FaCheckCircle style={{ marginRight: 10 }} /> : <FaExclamationCircle style={{ marginRight: 10 }} />}
          <p>{mensaje.texto}</p>
        </div>
      )}

      {mostrarRecibo && transaccionActual ? (
        <ReciboDigital transaccion={transaccionActual} />
      ) : transaccionActual ? (
        <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 30, textAlign: "center", maxWidth: 400, margin: "auto" }}>
          <h3>¡Transacción realizada con éxito!</h3>
          <div id="qr-print" style={{ margin: "20px 0" }}>
            <QRCode value={generarTextoQR(transaccionActual)} size={220} />
          </div>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 30 }}>Escanea este código para ver o descargar tu recibo digital en cualquier momento.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button onClick={() => setMostrarRecibo(true)}>Ver recibo digital</button>
            <button onClick={imprimirQR} style={botonStyle("#4CAF50")}>Imprimir QR</button>
          </div>
          <button onClick={() => setTransaccionActual(null)} style={{ marginTop: 20 }}>Volver a Registro de datos</button>
        </div>
      ) : (
        <>
          <TablaTransacciones transacciones={transacciones} />
          <div style={{ textAlign: "center" }}>
            <button onClick={abrirFormulario} style={botonStyle("#4CAF50")}>Registrar Entrega</button>
          </div>
          {mostrarFormulario && (
            <form onSubmit={confirmarTransaccion} style={{ marginTop: 30, border: "1px solid #ccc", padding: 20, borderRadius: 8, maxWidth: 500, margin: "auto" }}>
              <h3>Nueva Transacción</h3>

              <label>Fecha:</label>
              <input type="text" value={fecha} readOnly style={{ width: "100%", marginBottom: 10, padding: 6 }} />

              <label>Hora:</label>
              <input type="text" value={hora} readOnly style={{ width: "100%", marginBottom: 10, padding: 6 }} />

              <label>Peso (kg):</label>
              <input type="number" step="0.01" value={pesaje} onChange={e => setPesaje(e.target.value)} required style={{ width: "100%", marginBottom: 10, padding: 6 }} />

              <label>Material:</label>
              <select value={material} onChange={e => setMaterial(e.target.value)} required style={{ width: "100%", marginBottom: 10, padding: 6 }}>
                <option value="">Seleccione material</option>
                {listaMateriales.map(m => <option key={m.id_material} value={m.id_material}>{m.nombre_material}</option>)}
              </select>

              <button type="submit" style={botonStyle("#4CAF50")}>Confirmar</button>
              <button type="button" onClick={() => setMostrarFormulario(false)} style={botonStyle("#f44336")}>Cancelar</button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

const TablaTransacciones = ({ transacciones }: { transacciones: Transaccion[] }) => (
  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, textAlign: "center" }}>
    <thead>
      <tr style={{ backgroundColor: "#004a99", color: "white" }}>
        {["ID Transacción","ID Factura","Fecha","Hora","Peso","Material","Monto"].map(th => <th key={th} style={{ padding: 10, border: "1px solid #ccc" }}>{th}</th>)}
      </tr>
    </thead>
    <tbody>
      {transacciones.length === 0 ? (
        <tr><td colSpan={7} style={{ padding: 20 }}>No hay transacciones aún.</td></tr>
      ) : (
        transacciones.map((t, i) => {
          const fechaObj = new Date(t.fecha_hora);
          return (
            <tr key={i}>
              <td style={tdStyle}>{t.id_transaccion}</td>
              <td style={tdStyle}>{t.id_factura}</td>
              <td style={tdStyle}>{fechaObj.toLocaleDateString()}</td>
              <td style={tdStyle}>{fechaObj.toLocaleTimeString()}</td>
              <td style={tdStyle}>{t.pesaje_kg}</td>
              <td style={tdStyle}>{t.material}</td>
              <td style={tdStyle}>{Number(t.monto_total || 0).toFixed(2)}</td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
);

const tdStyle = { border: "1px solid #ccc", padding: 8 };
