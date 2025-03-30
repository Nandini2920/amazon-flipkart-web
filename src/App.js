import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SearchPage from "./pages/Search";
import ProductDetails from "./pages/ProductDetails";
import LoginPage from "./pages/Login"; 

function App() {
  const isAuthenticated = !!localStorage.getItem("user");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/search" element={isAuthenticated ? <SearchPage /> : <Navigate to="/" />} />
        <Route path="/product-details" element={isAuthenticated ? <ProductDetails /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
