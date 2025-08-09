import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import logoInolasa from "../assets/logo-inolasa.png";
import bosqueBanner from "../assets/bosque-banner.png";
import nuestraMeta from "../assets/nuestra-meta.png";

// Iconos reales
import { FaFigma } from "react-icons/fa";
import { FaXTwitter, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa6";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="container header-inner">
          <img
            src={logoInolasa}
            alt="Logo Inolasa"
            className="logo"
            loading="eager"
            decoding="sync"
          />

          <div className="header-right">
            <nav aria-label="Navegación principal">
              <ul>
                <li><a href="#empresa">Empresa</a></li>
                <li><a href="#servicios">Servicios</a></li>
                <li><a href="#faq">Preguntas Frecuentes</a></li>
                <li><a href="#contacto">Contacto</a></li>
              </ul>
            </nav>

            {/* Botón que redirige a /login */}
            <Link to="/login" className="btn-verde">
              Inicio de sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Banner full-bleed */}
      <section className="banner" aria-label="Imagen de bosque">
        <img
          src={bosqueBanner}
          alt="Bosque"
          className="banner-img"
          loading="eager"
          decoding="async"
        />
      </section>

      {/* Contenido principal */}
      <main className="contenido">
        <div className="container">
          <h1 className="titulo">Programa #AmbientalCostaRica</h1>

          <section className="info-grid" aria-label="Descripción del programa e imagen ilustrativa">
            <div className="texto">
              <p>
                A partir de enero del 2020, INOLASA, como parte de sus programas
                de responsabilidad social empresarial y su compromiso con el medio
                ambiente, puso en marcha el proyecto <strong>#AmbientalCostaRica</strong>,
                el cual se constituye como una alternativa ambientalmente amigable
                a la gestión de residuos valorizables entre ellos papel, cartón y
                plástico post consumo, especialmente en las categorías PET y HDPE,
                todo esto en completo cumplimiento de la normativa asociada al
                manejo de estos materiales.
              </p>
              <p>
                El papel y cartón son dispuestos con gestores autorizados para
                dicha labor, fomentando el encadenamiento positivo de pequeños y
                grandes empresarios, impactando positivamente en la cadena de
                valor. El plástico, por su parte, es compactado en la planta para
                posteriormente comercializarlo en el mercado nacional de plástico,
                siendo parte de una de las etapas del residuo, en búsqueda de la
                circularidad en su ciclo de vida.
              </p>
              <p>
                La interacción con diferentes actores sociales ha sido clave para
                el éxito del proyecto. Esto abarca desde los municipios, que
                cumplen con la legislación en materia de gestión de residuos, hasta
                las personas físicas que acuden a las puertas de INOLASA a través
                de <strong>#AmbientalCostaRica</strong> para comercializar este material.
                Esta colaboración ha generado impactos positivos no solo en la
                dimensión ambiental, sino también en el aspecto social de la
                comunidad local.
              </p>
              <p>
                El proyecto crece y con él surge el deseo de un futuro mejor,
                impulsado por el progreso, la innovación tecnológica y la
                sostenibilidad que caracterizan a cada proyecto de INOLASA.
              </p>
            </div>

            <aside className="lateral" aria-label="Ilustración del proceso y meta">
              <img
                src={nuestraMeta}
                alt="Nuestra meta y proceso de reciclaje"
                className="meta-img"
                loading="lazy"
                decoding="async"
              />
            </aside>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer-verde">
        <div className="container footer-grid">
          <div className="social" aria-label="Redes sociales">
            <a href="https://www.figma.com/" target="_blank" rel="noopener noreferrer" aria-label="Figma">
              <FaFigma size={20} />
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
              <FaXTwitter size={18} />
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram size={18} />
            </a>
            <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FaYoutube size={18} />
            </a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin size={18} />
            </a>
          </div>

          <ul id="empresa">
            <li>UI design</li>
            <li>UX design</li>
            <li>Wireframing</li>
            <li>Diagramming</li>
            <li>Brainstorming</li>
            <li>Online whiteboard</li>
            <li>Team collaboration</li>
          </ul>

          <ul id="servicios">
            <li>Design</li>
            <li>Prototyping</li>
            <li>Development features</li>
            <li>Design systems</li>
            <li>Collaboration features</li>
            <li>Design process</li>
            <li>FigJam</li>
          </ul>

          <ul id="faq">
            <li>Blog</li>
            <li>Best practices</li>
            <li>Colors</li>
            <li>Color wheel</li>
            <li>Support</li>
            <li>Developers</li>
            <li>Resource library</li>
          </ul>
        </div>

        <div id="contacto" style={{ height: 1, width: 1, overflow: "hidden" }} />
      </footer>
    </div>
  );
};

export default Home;
