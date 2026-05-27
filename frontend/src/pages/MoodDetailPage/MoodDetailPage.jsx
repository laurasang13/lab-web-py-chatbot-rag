import { useFetch } from "../../context/useFetch.js";
import { moods } from "../../context/Moods.js";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom"; 
import "../../index.css";
import styles from "./MoodDetail.module.css";

function MoodDetailPage() {
  //Extraer slug de la URL
  const { slug } = useParams()
  console.log("Slug from URL:", slug)
  
  // Buscar el mood en el array
  const moodInfo = moods.find(m => m.slug === slug)
  console.log("MoodInfo found:", moodInfo)

  // llamamos al hook para que realice la llamada de ese mood concreto
  const { data, loading, error } = useFetch(moodInfo?.name, moodInfo?.id)

  //Control de estados
  if (loading) {

    return (
    <div className={styles["messages-container"]}>
      <p className={styles["loading"]}>Analyzing your Mood... ✨</p>
    </div>
    )
  }

  if (!data) {
    return (
    <div className={styles["messages-container"]}>
      <p className={styles["notFoundMood"]}>Mood not found</p>
    </div>
    )
  }

  // Renderizado de los datos de la API
  return (
    
    <section className={styles["colorMood-container"]}>

      <div>
        <h1>{moodInfo?.name}</h1>
      </div>

      <div className={styles["colorMood-card"]}>
     
        {data.microAction && (
          <>
          <h3>Try this now</h3>
          <p className={styles["microAction"]}>{data.microAction}</p>
          </>
        )}

        <h3>Recomendations</h3>
          <ul className={styles["recomendation"]}>
            {data.recommendations?.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
      </div>

      <div>
         <p className={styles["phrase"]}>
          “{data.phrase || data.quote || data.description}”
        </p> 
      </div>

      
    </section>

  )
}

export default MoodDetailPage;