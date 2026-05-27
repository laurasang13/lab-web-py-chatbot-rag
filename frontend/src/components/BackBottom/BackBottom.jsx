import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import "../../index.css";
import styles from "../../components/BackBottom/BackBottom.module.css"

function BackButton() {
  const navigate = useNavigate();

  return (
    <button className={styles["back-button"]} onClick={() => navigate(-1)}>
        <IoArrowBack />
    </button>
  );
}

export default BackButton;