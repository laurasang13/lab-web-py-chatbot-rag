import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../index.css";
import styles from "./SignUpPage.module.css";
import "../../index.css"


function SignUpUser() {
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

    const newUser = {
      id: crypto.randomUUID(),
      ...formData,
    };

    console.log("Nuevo usuario:", newUser);

    // aquí se conecta con backend en el futuro

    navigate("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <h1>Sign Up</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Nombre completo"
            value={formData.fullName}
            onChange={handleChange}
          />

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

          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
}

export default SignUpUser;