import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/"); // ✅ Redirects to login if not logged in
    }
  }, [navigate]);

  const handleSearch = () => {
    if (query.trim() !== "") {
      navigate(`/product-details?query=${query}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); // ✅ Remove user data
    navigate("/"); // ✅ Go back to login page
  };

  return (
    <div className="container">
      <h1>Compare Prices</h1>
      <p>Search for a product to compare prices on Amazon & Flipkart</p>
      <input type="text" placeholder="Enter product name..." value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      <button onClick={handleLogout} style={{ background: "red", marginTop: "10px" }}>Logout</button>
    </div>
  );
}
