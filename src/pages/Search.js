import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const bgImages = ["/a.jpg", "/f.jpg"]; // Make sure these images are in the public folder

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [currentBg, setCurrentBg] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) navigate("/");
  }, [navigate]);

  // Carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (query.trim() !== "") {
      navigate(`/product-details?query=${query}`);
    }
  };

  return (
    <div style={{ ...styles.page }}>
      {/* Background Carousel */}
      {bgImages.map((img, index) => (
        <div
          key={index}
          style={{
            ...styles.bgImage,
            backgroundImage: `url(${img})`,
            opacity: currentBg === index ? 1 : 0,
            zIndex: 0,
          }}
        />
      ))}

      {/* Overlay content */}
      <div style={styles.content}>
        <h1 style={styles.title}>PriceMate</h1>
        <h2 style={styles.subtitle}>
          <u>Compare Product price:</u>
        </h2>
        <input
          type="text"
          placeholder="Search Product :"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSearch} style={styles.button}>
          Search
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    width: "100%",
    overflow: "hidden",
    position: "relative",
    fontFamily: "Georgia, serif",
  },
  bgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "opacity 1.5s ease-in-out",
  },
  content: {
    position: "relative",
    zIndex: 2,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(4px)",
    padding: "20px",
    textAlign: "center",
  },
  title: {
    fontSize: "64px",
    color: "#1d127a",
    marginBottom: "10px",
    textShadow: "2px 2px 6px white",
  },
  subtitle: {
    fontSize: "32px",
    color: "#000",
    marginBottom: "30px",
    textShadow: "1px 1px 3px white",
  },
  input: {
    width: "400px",
    maxWidth: "90%",
    padding: "16px",
    fontSize: "18px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  button: {
    padding: "14px 40px",
    backgroundColor: "#8da9f8",
    color: "black",
    fontSize: "18px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    transition: "background 0.3s",
  },
};
