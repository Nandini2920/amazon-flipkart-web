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
      localStorage.setItem("user", JSON.stringify(data)); // ✅ Store user data
      navigate("/search"); // ✅ Redirect to Search Page
    } else {
      setError(data.detail || "Login failed. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Login</h1>
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
      <button onClick={handleLogin} style={styles.button}>Login</button>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", padding: "50px" },
  input: { padding: "10px", fontSize: "16px", margin: "10px", width: "250px" },
  button: { padding: "10px 20px", fontSize: "16px", background: "blue", color: "white", border: "none" },
  error: { color: "red", marginTop: "10px" },
};
