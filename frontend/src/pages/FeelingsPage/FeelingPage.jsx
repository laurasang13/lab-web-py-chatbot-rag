import MoodCard from "../../components/MoodCard/MoodCard";
import { moods } from "../../context/Moods";
import { useUserMoods } from "../../hooks/useUserMoods"
import { useNavigate } from "react-router-dom";
import "../../index.css";
import styles from "./FeelingPage.module.css";

function FeelingPage() {
  const { addMood } = useUserMoods();

  const handleSelectMood = (mood) => {
    console.log("CLICK DETECTADO", mood);
    addMood(mood);
  };

  return (
    
    <article className={styles["feeling-page"]}>
       <div className={styles["tittle-box"]}>
          <h1 className={styles["title"]}>How do you feel today?</h1>
          <p>choose the mood which represents your mood.</p>
        </div>
      
        <div className={styles["moods-container"]}> 
            {moods.map((mood) => (
                <MoodCard key={mood.name} mood={mood} onClick={handleSelectMood}/>
            ))}
        </div>
    </article>

  )
}

export default FeelingPage;