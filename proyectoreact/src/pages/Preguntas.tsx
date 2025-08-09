import React from "react";
import "../styles/Home.css";
import Footer from "../components/Footer";

const Preguntas: React.FC = () => {
  return (
    <div className="home-container">
      <header className="header">
        <div className="container header-inner">
          <h1 className="titulo" style={{ margin: 0 }}>Preguntas Frecuentes</h1>
      </div>
      </header>

      <main className="contenido">
        <div className="container">
          <h3>¿Qué materiales reciben?</h3>
          <p>PET y HDPE limpios y secos, además de papel y cartón.</p>

          <h3>¿Cómo deben entregarse?</h3>
          <p>Enjuagados, secos y compactados cuando sea posible. Retire etiquetas si puede.</p>

          <h3>¿Entregan certificación o comprobante?</h3>
          <p>Sí, emitimos comprobante de recepción y peso según el material recibido.</p>

          <h3>¿Atienden a personas y empresas?</h3>
          <p>Ambas. Contamos con atención en planta y coordinación con municipios y comercios.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Preguntas;
