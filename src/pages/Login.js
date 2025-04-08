import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/search");
    } else {
      setError(data.detail || "Login failed. Please try again.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      <div style={styles.formBox}>
        <h2 style={styles.formTitle}>Welcome Back!</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    backgroundImage: 'url("/thump.png")', // Put the image in public folder
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    fontFamily: "Segoe UI, sans-serif",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(6px)",
    zIndex: 0,
  },
  formBox: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "40px 50px",
    borderRadius: "20px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
    maxWidth: "420px",
    width: "90%",
    textAlign: "center",
    color: "white",
  },
  formTitle: {
    marginBottom: "28px",
    fontSize: "32px",
    fontWeight: "600",
    color: "#ffffff",
    textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
  },
  input: {
    width: "100%",
    padding: "14px 18px",
    marginBottom: "18px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.6)",
    color: "#333",
    outline: "none",
  },
  error: {
    color: "#ff4d4d",
    fontSize: "14px",
    marginBottom: "16px",
  },
  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    fontSize: "17px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s",
  },
};
