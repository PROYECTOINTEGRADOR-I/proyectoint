import { useState } from "react";
import "../styles/Home.css";
import "../styles/pages.css";
import Footer from "../components/Footer";

export default function Contacto() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("Gracias por escribirnos. Te contactaremos pronto.");
    setNombre(""); setEmail(""); setMensaje("");
  }

  return (
    <div className="page">
      <section className="section-hero">
        <div className="container">
          <h1>Contacto</h1>
          <p>Escríbenos y con gusto te apoyamos.</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid-2">
          <div className="card">
            <h3>Envíanos un mensaje</h3>
            <form className="form" onSubmit={handleSubmit}>
              <input className="input" placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)} required />
              <input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
              <textarea className="textarea" placeholder="Mensaje" value={mensaje} onChange={e=>setMensaje(e.target.value)} required />
              <button className="btn" type="submit">Enviar</button>
            </form>
          </div>

          <div className="info-block">
            <h4>Información</h4>
            <p className="muted">Puntarenas, Costa Rica</p>
            <ul className="checks" style={{marginTop:8}}>
              <li>Tel: +506 1234 5678</li>
              <li>Email: info@inolasa.com</li>
              <li>Horario: Lun–Vie, 8:00–17:00</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
