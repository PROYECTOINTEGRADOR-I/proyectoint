import React from "react";
import "../styles/Home.css";
import bosqueBanner from "../assets/bosque-banner.png";
import nuestraMeta from "../assets/nuestra-meta.png";
import Footer from "../components/Footer";
import Header from "../components/Header";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      {/* Header reutilizable */}
      <Header />

      {/* Banner */}
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

          <section
            className="info-grid"
            aria-label="Descripción del programa e imagen ilustrativa"
          >
            <div className="texto">
              <p>
                A partir de enero del 2020, INOLASA, como parte de sus programas
                de responsabilidad social empresarial y su compromiso con el medio
                ambiente, puso en marcha el proyecto{" "}
                <strong>#AmbientalCostaRica</strong>, el cual se constituye como
                una alternativa ambientalmente amigable a la gestión de residuos
                valorizables entre ellos papel, cartón y plástico post consumo,
                especialmente en las categorías PET y HDPE, todo esto en completo
                cumplimiento de la normativa asociada al manejo de estos
                materiales.
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
                cumplen con la legislación en materia de gestión de residuos,
                hasta las personas físicas que acuden a las puertas de INOLASA a
                través de <strong>#AmbientalCostaRica</strong> para comercializar
                este material. Esta colaboración ha generado impactos positivos no
                solo en la dimensión ambiental, sino también en el aspecto social
                de la comunidad local.
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

      {/* Footer reutilizable */}
      <Footer />
    </div>
  );
};

export default Home;
