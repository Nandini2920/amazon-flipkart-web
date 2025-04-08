import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function ProductDetails() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const [product, setProduct] = useState({ amazon: {}, flipkart: {} });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/product?product_name=${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setProduct(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch product details.");
        setLoading(false);
      });
  }, [query]);

  const amazonPrice = parseFloat(product.amazon.price?.replace(/[^0-9.]/g, "")) || Infinity;
  const flipkartPrice = parseFloat(product.flipkart.price?.replace(/[^0-9.]/g, "")) || Infinity;
  const cheaperPlatform = amazonPrice < flipkartPrice ? "amazon" : "flipkart";
  const priceDifference = Math.abs(amazonPrice - flipkartPrice);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Product Comparison: {query}</h1>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={styles.error}>{error}</p>
        ) : (
          <>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Platform</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Link</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={styles.td}>
                      <img src="/amazon-logo.png" alt="Amazon" style={styles.logo} />
                    </td>
                    <td style={styles.td}>{product.amazon.price || "Not available"}</td>
                    <td style={styles.td}>
                      {product.amazon.product_url ? (
                        <a href={product.amazon.product_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                          View on Amazon
                        </a>
                      ) : "Not available"}
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.td}>
                      <img src="/flipkart-logo.jpg" alt="Flipkart" style={styles.logo} />
                    </td>
                    <td style={styles.td}>{product.flipkart.price || "Not available"}</td>
                    <td style={styles.td}>
                      {product.flipkart.product_url ? (
                        <a href={product.flipkart.product_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                          View on Flipkart
                        </a>
                      ) : "Not available"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {product.amazon.price && product.flipkart.price && (
              <div style={styles.recommendation}>
                <h3>💡 Our Recommendation:</h3>
                <p>
                  {cheaperPlatform === "amazon" ? "Amazon" : "Flipkart"} is cheaper by ₹{priceDifference.toFixed(2)}.{" "}
                  We recommend purchasing from{" "}
                  <a
                    href={cheaperPlatform === "amazon" ? product.amazon.product_url : product.flipkart.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.recommendationLink}
                  >
                    {cheaperPlatform === "amazon" ? "Amazon" : "Flipkart"}
                  </a>.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "linear-gradient(to right, #4facfe, #00f2fe)",
    minHeight: "100vh",
    padding: "50px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    background: "linear-gradient(145deg, #ffffff, #e6e6e6)",
    borderRadius: "20px",
    boxShadow: "0 12px 25px rgba(0, 0, 0, 0.15)",
    padding: "40px",
    maxWidth: "1000px",
    width: "100%",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    animation: "fadeIn 1s ease-in-out",
  },
  title: {
    background: "linear-gradient(90deg,rgb(75, 137, 243),rgb(103, 53, 239))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontSize: "38px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "35px",
    letterSpacing: "1px",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  tableContainer: {
    width: "100%",
    overflowX: "auto",
    marginBottom: "30px",
    borderRadius: "12px",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white"
  },
  th: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "14px",
    textAlign: "left",
    fontSize: "16px",
    letterSpacing: "0.5px"
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid #ddd",
    textAlign: "left",
    fontSize: "15px"
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "color 0.2s ease-in-out",
  },
  error: {
    color: "red",
    textAlign: "center",
    fontWeight: "bold"
  },
  recommendation: {
    background: "linear-gradient(to right, #ffecd2, #fcb69f)",
    padding: "25px",
    borderRadius: "14px",
    textAlign: "center",
    color: "#333",
    fontWeight: "500",
    fontSize: "18px",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
    marginTop: "30px"
  },
  recommendationLink: {
    color: "#d6006e",
    fontWeight: "bold",
    textDecoration: "underline"
  },
  logo: {
    width: "100px",
    height: "auto",
    marginBottom: "10px"
  }
};
