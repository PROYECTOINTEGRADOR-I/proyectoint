import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AnalizarQR.css";
import { useAuth } from "../auth";

declare global {
  interface Window {
    jsQR: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null;
  }
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export default function AnalizarQR() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [qrResult, setQrResult] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; message: string } | null>(null);
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

    // Cargar jsQR si no está disponible
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

  const procesarPago = async (qrToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/procesar-pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ qr_token: qrToken, id_cajero: user?.userId }),
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
          </div>
        )}

        <button onClick={resetForm} className="reset-btn">
          Nuevo análisis
        </button>
      </div>
    </div>
  );
}