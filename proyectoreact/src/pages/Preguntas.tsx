import "../styles/Home.css";
import "../styles/pages.css";
import Footer from "../components/Footer";
import Header from "../components/Header";


export default function Preguntas() {
  return (
    <div className="page">
      {/* Header reutilizable */}
      <Header />
      <section className="section-hero">
        <div className="container">
          <h1>Preguntas Frecuentes</h1>
          <p>Resolvemos dudas comunes sobre recepción de materiales y procesos.</p>
        </div>
      </section>

      <section className="section">
        <div className="container faqs">
          <details open>
            <summary>¿Qué materiales reciben?</summary>
            <p>PET y HDPE limpios y secos, además de papel y cartón.</p>
          </details>

          <details>
            <summary>¿Cómo deben entregarse?</summary>
            <p>Enjuagados, secos y compactados cuando sea posible. Retire etiquetas si puede.</p>
          </details>

          <details>
            <summary>¿Entregan certificación o comprobante?</summary>
            <p>Sí, emitimos comprobante de recepción y peso según el material recibido.</p>
          </details>

          <details>
            <summary>¿Atienden a personas y empresas?</summary>
            <p>Ambas. Contamos con atención en planta y coordinación con municipios y comercios.</p>
          </details>
        </div>
      </section>

      <Footer />
    </div>
  );
}
