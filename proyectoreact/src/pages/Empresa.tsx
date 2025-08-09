import "../styles/Home.css";
import "../styles/pages.css";
import Footer from "../components/Footer";
import Header from "../components/Header";


export default function Empresa() {
  return (
    <div className="page">
      {/* Header reutilizable */}
      <Header />
      
      <section className="section-hero">
        <div className="container">
          <h1>Empresa</h1>
          <p>Comprometidos con la sostenibilidad y la economía circular en Costa Rica.</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid-3">
          <div className="card">
            <span className="pill">Misión</span>
            <h3>Gestión responsable de residuos</h3>
            <p>Promovemos la valorización de PET, HDPE, papel y cartón, conectando a comunidades y empresas con prácticas sostenibles.</p>
          </div>
          <div className="card">
            <span className="pill">Visión</span>
            <h3>Economía circular real</h3>
            <p>Impulsamos alianzas para cerrar ciclos de materiales y crear impacto ambiental y social positivo.</p>
          </div>
          <div className="card">
            <span className="pill">Valores</span>
            <ul className="checks">
              <li>Transparencia y cumplimiento normativo</li>
              <li>Innovación y mejora continua</li>
              <li>Trabajo con la comunidad</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container info-block">
          <h4>Datos rápidos</h4>
          <div className="info-grid">
            <div><b>+50%</b><br/>Meta de recuperación de envases post-consumo</div>
            <div><b>+20</b><br/>Alianzas con municipios y gestores</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
