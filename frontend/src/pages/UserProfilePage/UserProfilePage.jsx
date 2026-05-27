import MoodCard from "../../components/MoodCard/MoodCard";
import Pagination from "../../components/Paginacion/Paginacion";
import { useUserMoods } from "../../hooks/useUserMoods"; 
import BackButton from "../../components/BackBottom/BackBottom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../index.css";
import styles from "../UserProfilePage/UserProfilePage.module.css";

function ProfilePage() {
  const { savedMoods, clearMoods } = useUserMoods();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20
  const totalPages = Math.ceil(savedMoods.length / itemsPerPage);
  const displayedMoods = savedMoods.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );;
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (

    <main className={styles["profile-container"]}>

      <header className={styles["header"]}>

        <div>
          <h1 className={styles["title"]}>Mood Summary</h1>
          <p className={styles["subtitle"]}>
            Here you can see how you've been feeling lately
        </p>
        </div>

      </header>

      {/* moods seleccionados */}
      <section className={styles["moods-grid"]}>
        {savedMoods.length > 0 ? (
          displayedMoods.map((mood, index) => (
            <MoodCard key={`${mood.slug}-${index}`} mood={mood} />
          ))
        ) : (
          <div className={styles["no-data"]}>
            <p>You haven't recorded any moods yet.</p>
          </div>
        )}
      </section>
      
      {savedMoods.length > 0 && (
      <section>
            <Pagination 
      currentPage={currentPage} 
      totalPages={totalPages} 
      onPageChange={handlePageChange} 
    />
      </section>
      )}

      {savedMoods.length > 0 && (
        <section className={styles["button-container"]}>
          <div>
            <button className={styles["button"]} onClick={() => navigate("/currentmood")}>
                Which is your Current mood?
            </button>
          </div>

          <div className={styles["clearMoods"]}>
            <button className={styles["button"]} onClick={clearMoods}>
              Clear moods
            </button>
          </div>
        </section>
      )}

      
    </main>
  );
}

export default ProfilePage;