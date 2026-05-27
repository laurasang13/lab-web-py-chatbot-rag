import { useNavigate } from "react-router-dom";
import "../../index.css";
import styles from "./Footer.module.css";



function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles["footer"]}>
      <div className={styles["content"]}>
        
        <nav className={styles["links"]}>
          <a href="#about">About Us</a>
          <a href="#help">Support</a>
          <a href="#privacy">Privacy</a>
        </nav>

        <div className={styles.brand}>
          <p>© {currentYear} | Designed by <strong>Laura Sang</strong></p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;