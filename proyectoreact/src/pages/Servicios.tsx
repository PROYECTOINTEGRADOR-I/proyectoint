import React from "react";
import "../styles/Home.css";
import Footer from "../components/Footer";

const Servicios: React.FC = () => {
  return (
    <div className="home-container">
      <header className="header">
        <div className="container header-inner">
          <h1 className="titulo" style={{ margin: 0 }}>Servicios</h1>
        </div>
      </header>

      <main className="contenido">
        <div className="container">
          <ul>
            <li>Recepción y clasificación de materiales (PET, HDPE, papel y cartón).</li>
            <li>Compactación/molienda para valorización o coprocesamiento.</li>
            <li>Asesoría a municipios, comercios y comunidades en gestión de residuos.</li>
            <li>Programas de educación ambiental y campañas de recolección.</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Servicios;
