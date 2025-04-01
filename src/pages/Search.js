import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  const handleSearch = () => {
    if (query.trim() !== "") {
      navigate(`/product-details?query=${query}`);
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
      <h1 style={{ margin: 0 }}>Compare Product Prices</h1>
      <input 
        type="text" 
        placeholder="Enter product name..." 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        style={{ 
          padding: "12px 16px",
          width: "100%",
          maxWidth: "300px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }} 
      />
      <button 
        onClick={handleSearch}
        style={{ 
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          width: "100%",
          maxWidth: "350px",
          fontWeight: "bold"
        }}
      >
        Search
      </button>
    </div>
  );
}