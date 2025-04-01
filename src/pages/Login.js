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
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "20vh",
      gap: "16px",
      padding: "20px",
      boxSizing: "border-box",
      marginBottom:"90px"
    }}>
      <h1 style={{ margin: 0 }}>Login</h1>
      
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        style={{ 
          padding: "12px 16px",
          width: "100%",
          maxWidth: "350px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }} 
      />
      
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        style={{ 
          padding: "12px 16px",
          width: "100%",
          maxWidth: "350px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }} 
      />
      
      {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
      
      <button 
        onClick={handleLogin}
        style={{ 
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          width: "100%",
          maxWidth: "400px",
          fontWeight: "bold"
        }}
      >
        Login
      </button>
    </div>
  );
}
