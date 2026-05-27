import "../../index.css";
import styles from "../Navbar/Navbar.module.css";
import { NavLink } from 'react-router-dom';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className={styles["navbar"]}>
          <h1 className={styles.logo}
          onClick={() => navigate("/HomePage")}
          >MindVibes</h1>

          <div 
            className={styles["menu-icon"]} 
            onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </div>

          <div className={styles["links-menu"]}>
            <Link to="/">Home</Link>
            <Link to="/feelings">Moods</Link>
            <Link to="">Blog</Link>
          </div>
          <div className={styles["button-login"]}>
              <button className={styles["button-login"]}
              onClick={() => navigate("/FakeLogin")}>Login</button>
          </div>
      </nav>
      {menuOpen && (
        <div className={styles["mobile-menu"]}>
          <Link to="/">Home</Link>
          <Link to="/feelings">Moods</Link>
          <Link to="">Blog</Link>
          <Link to="UserProfilePage">Login</Link>
        </div>
      )}
    </>
  );
}

export default Navbar;