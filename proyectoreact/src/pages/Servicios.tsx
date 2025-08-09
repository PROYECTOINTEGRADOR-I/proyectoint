import "../styles/Home.css";
import "../styles/pages.css";
import Footer from "../components/Footer";
import Header from "../components/Header";



export default function Servicios() {
  return (
    <div className="page">
      {/* Header reutilizable */}
      <Header />
      <section className="section-hero">
        <div className="container">
          <h1>Servicios</h1>
          <p>Soluciones para recepción, clasificación y valorización de materiales reciclables.</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid-3">
          <div className="card">
            <h3>Recepción y pesaje</h3>
            <p>Atención a personas y empresas con comprobante de recepción y peso por material.</p>
          </div>
          <div className="card">
            <h3>Clasificación y pretratamiento</h3>
            <p>Limpieza, acopio y separación de PET/HDPE, papel y cartón para su valorización.</p>
          </div>
          <div className="card">
            <h3>Compactación / molienda</h3>
            <p>Reducción de volumen para logística eficiente; coprocesamiento de no valorizables.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h3 style={{marginBottom:12}}>Proceso</h3>
          <div className="steps">
            <div className="step"><b>1.</b> Recepción y registro</div>
            <div className="step"><b>2.</b> Acopio y separación</div>
            <div className="step"><b>3.</b> Compactación / molienda</div>
            <div className="step"><b>4.</b> Valorización y salida</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
