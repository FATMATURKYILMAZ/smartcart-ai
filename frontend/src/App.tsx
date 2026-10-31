
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { CartProvider } from "./context/CartContext";
import "./App.css";
import CartPage from "./pages/CartPage";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/products/:id"
            element={<ProductDetailPage />}
          />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
