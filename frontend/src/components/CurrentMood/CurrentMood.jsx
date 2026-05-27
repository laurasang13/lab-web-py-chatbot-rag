import MoodCard from "../MoodCard/MoodCard";
import { useUserMoods } from "../../hooks/useUserMoods"; 
import { useNavigate } from "react-router-dom"; 
import { useDominantMood } from "../../hooks/useDominantMood";
import "../../index.css";
import styles from "../CurrentMood/CurrentMood.module.css";

function MoodSummary() {
  const { savedMoods } = useUserMoods();
  const dominantMood = useDominantMood(savedMoods);
  const navigate = useNavigate();

  return (
    
    <main className={styles["profile-container"]}>
      
      <header className={styles["header-container"]}>
        <h1 className={styles["title"]}>Your Current Mood</h1>
        <p className={styles["subtitle"]}>
          Based on your recent activity, you are feeling:
        </p>
      </header>

      <section className={styles["mood-display"]}>
        {dominantMood ? (
      
          <div className={styles["featured-mood"]}>
             <MoodCard mood={dominantMood} />
             <p className={styles["mood-label"]}>This is your dominant state!</p>
          </div>
        ) : (
          <div className={styles["no-data"]}>
            <p>No moods recorded yet to analyze.</p>
          </div>
        )}
      </section>

      <div className={styles["button-container"]}>
        <button className={styles["back-button"]} onClick={() => navigate(-1)}> Return
        </button>
      </div>
      
    </main>
  );
}

export default MoodSummary;
