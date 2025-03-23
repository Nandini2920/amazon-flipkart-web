import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/"); // ✅ Redirect to Login Page if not logged in
    }
  }, [navigate]);

  const handleSearch = () => {
    if (query.trim() !== "") {
      navigate(`/product-details?query=${query}`);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Compare Prices</h1>
      <p>Search for a product to compare prices on Amazon & Flipkart</p>

      <input
        type="text"
        placeholder="Enter product name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleSearch} style={styles.button}>Search</button>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", padding: "50px" },
  input: { padding: "10px", fontSize: "16px", margin: "10px", width: "250px" },
  button: { padding: "10px 20px", fontSize: "16px", background: "blue", color: "white", border: "none" },
};
