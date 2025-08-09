import React, { useState } from "react";
import "../styles/Home.css";
import Footer from "../components/Footer";

const Contacto: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // aquí podrías llamar a tu API o servicio de email
    alert("Gracias por escribirnos. Te contactaremos pronto.");
    setNombre(""); setEmail(""); setMensaje("");
  }

  return (
    <div className="home-container">
      <header className="header">
        <div className="container header-inner">
          <h1 className="titulo" style={{ margin: 0 }}>Contacto</h1>
        </div>
      </header>

      <main className="contenido">
        <div className="container" style={{ maxWidth: 720 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label>Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e5e5", borderRadius: 6 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e5e5", borderRadius: 6 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Mensaje</label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={5}
                required
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e5e5", borderRadius: 6, resize: "vertical" }}
              />
            </div>

            <button
              type="submit"
              className="btn-verde"
              style={{ border: "none" }}
            >
              Enviar
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contacto;
