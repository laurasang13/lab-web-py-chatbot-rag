import { useNavigate } from "react-router-dom";
import logo from "../../assets/MindVibesLogo.png";
import "../../index.css";
import styles from "./HomePage.module.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <header className={styles["home-container"]}>
      <article className={styles["hero"]}>
        <img src={logo} alt="MindVibe" className={styles["logoHome"]} />
        <div>
        <p className={styles["description"]}> Transform the noise of your thoughts into a melody you can understand. The first step to feeling better is allowing yourself to feel everything.</p>
        </div>
        <div className={styles["button-container"]}>
          <button
            className={styles["button-explore"]}
            style={{ boxShadow: '0 18px 36px rgba(135, 116, 142, 0.18)' }}
            onClick={() => navigate("/feelings")}>Explore</button>

          <button 
          className={styles["button-SignUp"]} 
          onClick={() => navigate("/SignUpPage")}>Sign up</button>
        </div>
      </article>

    </header>
  );
}

export default HomePage;