import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SearchPage from "./pages/Search";
import ProductDetails from "./pages/ProductDetails";
import LoginPage from "./pages/Login";

function App() {
  const isAuthenticated = !!localStorage.getItem("user");

  return (
    <Router>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          width: '100%',
          margin: '0 auto'
        }}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/search" element={isAuthenticated ? <SearchPage /> : <Navigate to="/" />} />
            <Route path="/product-details" element={isAuthenticated ? <ProductDetails /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;