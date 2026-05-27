import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./FakeLogin.module.css";

function FakeLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem("fakeUser", "true");

    navigate("/userprofilepage"); 
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <h1>Welcome Back</h1>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
          />

          <button type="submit">Login</button>
        </form>

      </div>
    </div>
  );
}

export default FakeLogin;
