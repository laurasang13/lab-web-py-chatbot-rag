import { moods } from "../../context/Moods";
import { Link } from "react-router-dom";
import { useUserMoods } from "../../hooks/useUserMoods";
import "../../index.css";
import styles from "./MoodCard.module.css";

function MoodCard({ mood, onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick(mood);
    }
  };

  return (
    <Link
      to={`/mood/${mood.slug}`}
      className={styles["link"]}
      onClick={handleClick}
    >
      <div className={styles["mood-card"]}>
        <img src={mood.image} alt={mood.name} />
        <h3>{mood.name}</h3>
      </div>
    </Link>
  );
}

export default MoodCard;
