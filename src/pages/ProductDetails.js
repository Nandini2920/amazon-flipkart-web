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

  // Determine which platform is cheaper
  const amazonPrice = parseFloat(product.amazon.price?.replace(/[^0-9.]/g, "")) || Infinity;
  const flipkartPrice = parseFloat(product.flipkart.price?.replace(/[^0-9.]/g, "")) || Infinity;
  const cheaperPlatform = amazonPrice < flipkartPrice ? "amazon" : "flipkart";
  const priceDifference = Math.abs(amazonPrice - flipkartPrice);

  return (
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
                  <td style={styles.td}>Amazon</td>
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
                  <td style={styles.td}>Flipkart</td>
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
              <h3>Our Recommendation:</h3>
              <p>
                {cheaperPlatform === "amazon" ? "Amazon" : "Flipkart"} is cheaper by ₹{priceDifference.toFixed(2)}. 
                We recommend purchasing from {" "}
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
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif"
  },
  title: {
    color: "#333",
    marginBottom: "30px",
    textAlign: "center"
  },
  tableContainer: {
    width: "100%",
    overflowX: "auto",
    marginBottom: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    borderRadius: "8px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white"
  },
  th: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    textAlign: "left"
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    textAlign: "left"
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
    "&:hover": {
      textDecoration: "underline"
    }
  },
  error: {
    color: "red",
    textAlign: "center"
  },
  recommendation: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    width: "100%",
    textAlign: "center",
    marginTop: "20px"
  },
  recommendationLink: {
    color: "#007bff",
    fontWeight: "bold",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline"
    }
  }
};