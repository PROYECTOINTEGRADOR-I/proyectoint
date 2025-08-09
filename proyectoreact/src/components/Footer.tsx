import React from "react";
import "../styles/footer.css";
import logoInolasa from "../assets/inolasa.png";
import { FaFacebookF, FaInstagram, FaYoutube, FaPinterestP, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer: React.FC = () => {
  return (
    <footer className="site-footer" aria-label="Pie de página">
      <div className="container footer-layout">
        {/* Columna izquierda */}
        <ul className="footer-links">
          <li><a href="/aviso-legal">Aviso legal</a></li>
          <li><a href="/privacidad">Política de privacidad</a></li>
          <li><a href="/cookies">Política de cookies</a></li>
          <li><a href="/calidad">Política de calidad</a></li>
        </ul>

        {/* Centro: logo + redes */}
        <div className="footer-center">
          <img
            src={logoInolasa}
            alt="INOLASA"
            className="footer-logo"
            loading="lazy"
            decoding="async"
          />
          <div className="footer-social" aria-label="Redes sociales">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X (Twitter)"><FaXTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><FaYoutube /></a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest"><FaPinterestP /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>

        {/* Columna derecha */}
        <ul className="footer-links align-right">
          <li><a href="/">Inolasa</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/contacto">Contacto</a></li>
          <li><a href="/faq">FAQs</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
