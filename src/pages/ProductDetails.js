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

  return (
    <div style={styles.container}>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <h1>Amazon Price: {product.amazon.price}</h1>
          <a href={product.amazon.product_url} target="_blank" rel="noopener noreferrer">
            🔗 View on Amazon
          </a>

          <h1>Flipkart Price: {product.flipkart.price}</h1>
          <a href={product.flipkart.product_url} target="_blank" rel="noopener noreferrer">
            🔗 View on Flipkart
          </a>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { textAlign: "center", padding: "50px" },
};
