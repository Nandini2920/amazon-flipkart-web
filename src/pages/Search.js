import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const bgImages = ["/a.jpg", "/f.jpg"];

const recommendations = [
  // Mobiles
  { name: "OnePlus 13R 5G", image: "/oneplus-13r-1.jpg", type: "mobile" },
  { name: "Samsung Galaxy M35 5G", image: "/samsung-galaxy-m35.jpg", type: "mobile" },
  { name: "Redmi Note 13 Pro", image: "/xiaomi-redmi-note-13-pro-5g.jpg", type: "mobile" },
  { name: "iPhone 15", image: "/apple-iphone-15.jpg", type: "mobile" },
  { name: "Realme Narzo 60", image: "/realme-narzo60-.jpg", type: "mobile" },
  { name: "Motorola G73 5G", image: "/moto.jpg", type: "mobile" },
  { name: "Infinix Zero 5G", image: "/infinix.jpg", type: "mobile" },
  { name: "Vivo T2 5G", image: "/vivo.jpg", type: "mobile" },
  { name: "POCO X6 Pro", image: "/poco.jpeg", type: "mobile" },
  { name: "iPhone 16", image: "/16.jpg", type: "mobile" },
  { name: "Samsung Galaxy A15", image: "/sam.jpeg", type: "mobile" },
  { name: "Realme 12+ 5G", image: "/realme.jpeg", type: "mobile" },

  // Laptops
  { name: "HP Victus Ryzen 5", image: "/1.jpeg", type: "laptop" },
  { name: "ASUS TUF Gaming F15", image: "/2.jpeg", type: "laptop" },
  { name: "Lenovo Legion 5", image: "/3.jpeg", type: "laptop" },
  { name: "MacBook Air M1", image: "/4.jpeg", type: "laptop" },
  { name: "Dell Inspiron 15", image: "/5.jpeg", type: "laptop" },
  { name: "Acer Aspire 7", image: "/6.jpeg", type: "laptop" },
  { name: "MSI Modern 14", image: "/7.jpeg", type: "laptop" },
  { name: "Samsung Galaxy Book3", image: "/8.jpeg", type: "laptop" },
  { name: "ASUS ROG Zephyrus G14", image: "/9.jpeg", type: "laptop" },
  { name: "Lenovo IdeaPad Slim 5", image: "/10.jpeg", type: "laptop" },
  { name: "HP Pavilion Plus", image: "/11.jpeg", type: "laptop" },
  { name: "Acer Swift Go 14", image: "/12.jpeg", type: "laptop" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [currentBg, setCurrentBg] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) navigate("/");
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (query.trim() !== "") {
      navigate(`/product-details?query=${query}`);
    }
  };

  const handleRecommendationClick = (productName) => {
    navigate(`/product-details?query=${productName}`);
  };

  const mobiles = recommendations.filter((p) => p.type === "mobile");
  const laptops = recommendations.filter((p) => p.type === "laptop");

  return (
    <div style={styles.page}>
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

      <div style={styles.content}>
        <h1 style={styles.title}>PriceMate</h1>
        <h2 style={styles.subtitle}><u>Compare Product Price</u></h2>

        <input
          type="text"
          placeholder="Search Product"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSearch} style={styles.button}>Search</button>

        {/* Mobiles */}
        <h2 style={styles.sectionHeading}>Mobile Recommendations</h2>
        <div style={styles.recommendationGrid}>
          {mobiles.map((product, index) => (
            <div key={index} style={styles.card} onClick={() => handleRecommendationClick(product.name)}>
              <img
                src={product.image}
                alt={product.name}
                style={styles.productImage}
                onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
              />
              <p style={styles.productName}>{product.name}</p>
            </div>
          ))}
        </div>

        {/* Laptops */}
        <h2 style={styles.sectionHeading}>Laptop Recommendations</h2>
        <div style={styles.recommendationGrid}>
          {laptops.map((product, index) => (
            <div key={index} style={styles.card} onClick={() => handleRecommendationClick(product.name)}>
              <img
                src={product.image}
                alt={product.name}
                style={styles.productImage}
                onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
              />
              <p style={styles.productName}>{product.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    width: "100%",
    overflowY: "scroll",
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
    minHeight: "100%",
    padding: "30px",
    backgroundColor: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(5px)",
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
    marginBottom: "30px",
  },
  sectionHeading: {
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "40px",
    marginBottom: "20px",
    color: "#222",
    textShadow: "1px 1px 3px white",
  },
  recommendationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "20px",
    justifyItems: "center",
  },
  card: {
    background: "#fff",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    cursor: "pointer",
    width: "100%",
    maxWidth: "180px",
    transition: "transform 0.2s",
  },
  productImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  productName: {
    marginTop: "10px",
    fontWeight: "bold",
    fontSize: "14px",
    color: "#333",
  },
};