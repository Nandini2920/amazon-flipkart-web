import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SearchPage from "./pages/Search";
import ProductDetails from "./pages/ProductDetails";
import LoginPage from "./pages/Login"; 

function App() {
  const isAuthenticated = !!localStorage.getItem("user"); // Check if user is logged in

  return (
    <Router>
      <Routes>
        {/* Default route should go to Login Page */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Protect Search Page: Redirect to login if not authenticated */}
        <Route path="/search" element={isAuthenticated ? <SearchPage /> : <Navigate to="/" />} />
        
        {/* Protect Product Details Page */}
        <Route path="/product-details" element={isAuthenticated ? <ProductDetails /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
