import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import "../styles/AnalizarQR.css";
import { useAuth } from "../auth";

declare global {
  interface Window {
    jsQR: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null;
  }
}

interface ReciboData {
  id_transaccion: number;
  id_factura: number;
  fecha_hora: string;
  pesaje_kg: number;
  material: string;
  monto_total: number;
  nombre_cliente: string;
  qr_token: string;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export default function AnalizarQR() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [qrResult, setQrResult] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; message: string; recibo?: ReciboData } | null>(null);
  const [mostrarRecibo, setMostrarRecibo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
      await refresh();
      navigate("/");
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setQrResult("");
    setPaymentResult(null);
    setMostrarRecibo(false);

    // Cargar jsQR si no está disponible..
    if (!window.jsQR) {
      try {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr/dist/jsQR.js';
        script.onload = () => processImage(file);
        document.head.appendChild(script);
      } catch {
        setQrResult("Error cargando librería QR");
        setProcessing(false);
      }
    } else {
      processImage(file);
    }
  };

  const processImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      setPreviewSrc(imageSrc);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        if (window.jsQR) {
          const qr = window.jsQR(imageData.data, canvas.width, canvas.height);
          if (qr) {
            setQrResult(qr.data);
            procesarPago(qr.data);
          } else {
            setQrResult("No se detectó ningún QR en la imagen");
            setProcessing(false);
          }
        } else {
          setQrResult("Librería QR no disponible");
          setProcessing(false);
        }
      };
      img.src = imageSrc;
    };
    reader.readAsDataURL(file);
  };

  const procesarPago = async (qrData: string) => {
    try {
      // Extraer solo el token del QR
      let qrToken = qrData;
      
      // Si el QR contiene una URL, extraer solo el token
      if (qrData.includes('/factura/')) {
        const parts = qrData.split('/factura/');
        qrToken = parts[parts.length - 1];
      }
      
      console.log('Token extraído:', qrToken);
      
      const response = await fetch(`${API_BASE}/procesar-pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          qr_token: qrToken,
          id_cajero: user?.userId 
        }),
      });

      const data = await response.json();
      setPaymentResult(data);
    } catch {
      setPaymentResult({ success: false, message: "Error de conexión" });
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setPreviewSrc("");
    setQrResult("");
    setPaymentResult(null);
    setMostrarRecibo(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const imprimirRecibo = () => {
    const printContent = document.getElementById("recibo-print");
    if (printContent) {
      const printWindow = window.open("", "Print Recibo", "width=400,height=600");
      if (printWindow) {
        printWindow.document.write('<html><head><title>Recibo Digital</title></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const ReciboDigital = ({ recibo }: { recibo: ReciboData }) => {
    const fechaObj = new Date(recibo.fecha_hora);
    const qrUrl = `${window.location.origin}/factura/${recibo.qr_token}`;
    
    return (
      <div className="recibo-digital">
        <div id="recibo-print" style={{ 
          border: "1px solid #ccc", 
          borderRadius: 8, 
          padding: 30, 
          maxWidth: 400, 
          margin: "auto", 
          backgroundColor: "#f9f9f9" 
        }}>
          <h2 style={{ textAlign: "center", color: "#004a99" }}>Recibo Digital - Pago Procesado</h2>
          <p><strong>ID Transacción:</strong> {recibo.id_transaccion}</p>
          <p><strong>ID Factura:</strong> {recibo.id_factura}</p>
          <p><strong>Cliente:</strong> {recibo.nombre_cliente}</p>
          <p><strong>Fecha:</strong> {fechaObj.toLocaleDateString()}</p>
          <p><strong>Hora:</strong> {fechaObj.toLocaleTimeString()}</p>
          <p><strong>Peso:</strong> {recibo.pesaje_kg} kg</p>
          <p><strong>Material:</strong> {recibo.material}</p>
          <p><strong>Monto:</strong> ₡ {recibo.monto_total.toFixed(2)}</p>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <QRCode value={qrUrl} size={180} />
            <p style={{ fontSize: 12, color: "#666", marginTop: 10 }}>
              QR procesado exitosamente
            </p>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={imprimirRecibo} className="btn-verde" style={{ margin: "0 5px" }}>
            Imprimir Recibo
          </button>
          <button onClick={() => setMostrarRecibo(false)} className="reset-btn" style={{ margin: "0 5px" }}>
            Cerrar Recibo
          </button>
        </div>
      </div>
    );
  };

  // Si se muestra el recibo, renderizar solo eso
  if (mostrarRecibo && paymentResult?.recibo) {
    return (
      <div className="qr-page">
        <div className="qr-container">
          <ReciboDigital recibo={paymentResult.recibo} />
        </div>
      </div>
    );
  }

  return (
    <div className="qr-page">
      <div className="qr-container">
        <div className="qr-header">
          <h1>Análisis de QR</h1>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar sesión
          </button>
        </div>
        <p className="subtitle">Sube una imagen con código QR para procesar el pago</p>

        <div className="upload-section">
          <input
            ref={fileInputRef}
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="fileInput" className="file-label">
            Seleccionar imagen
          </label>
        </div>

        {previewSrc && (
          <div className="preview-section">
            <img src={previewSrc} alt="Preview" className="preview-img" />
          </div>
        )}

        {processing && <div className="loading">Procesando...</div>}

        {qrResult && !processing && (
          <div className="result-section">
            <h3>QR detectado:</h3>
            <p className="qr-content">{qrResult}</p>
          </div>
        )}

        {paymentResult && (
          <div className={`payment-result ${paymentResult.success ? 'success' : 'error'}`}>
            <h3>{paymentResult.success ? 'Pago exitoso' : 'Error en pago'}</h3>
            <p>{paymentResult.message}</p>
            
            {paymentResult.success && paymentResult.recibo && (
              <button 
                onClick={() => setMostrarRecibo(true)} 
                className="btn-verde" 
                style={{ marginTop: 15, width: "100%" }}
              >
                Ver Recibo Digital
              </button>
            )}
          </div>
        )}

        <button onClick={resetForm} className="reset-btn">
          Nuevo análisis
        </button>
      </div>
    </div>
  );
}