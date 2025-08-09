import React from "react";
import "../styles/Home.css";
import Footer from "../components/Footer";

const Empresa: React.FC = () => {
  return (
    <div className="home-container">
      <header className="header">
        <div className="container header-inner">
          <h1 className="titulo" style={{ margin: 0 }}>Empresa</h1>
        </div>
      </header>

      <main className="contenido">
        <div className="container">
          <p>
            INOLASA impulsa iniciativas de sostenibilidad y economía circular,
            promoviendo la correcta gestión de residuos valorizables (PET, HDPE,
            papel y cartón) y el encadenamiento con gestores autorizados.
          </p>
          <p>
            Trabajamos con comunidades, municipalidades y empresas para generar
            impacto ambiental y social positivo, alineados a la normativa vigente.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Empresa;
