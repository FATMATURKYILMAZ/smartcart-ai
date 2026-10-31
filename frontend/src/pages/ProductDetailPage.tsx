import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string | null;
}

const API_URL = "http://localhost:8081/api/products";

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
const [successMessage, setSuccessMessage] = useState("");


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
          throw new Error("Product could not be found.");
        }

        const data: Product = await response.json();
        setProduct(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return <div className="detail-message">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="detail-message">
        <p>{error || "Product not found."}</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <main className="product-detail-page">
      <Link to="/" className="back-link">
        ← Back to Products
      </Link>

      <div className="product-detail-card">
        <div className="product-detail-image">
          <img
            src={
              product.name.toLowerCase().includes("mouse")
                ? "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80"
                : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
            }
            alt={product.name}
          />
        </div>

        <div className="product-detail-info">
          <span className="detail-category">
            {product.name.toLowerCase().includes("headphone")
  ? "Headphones"
  : product.name.toLowerCase().includes("mouse")
    ? "Mice"
    : product.category || "Other"}
          </span>

          <h1>{product.name}</h1>

          <p className="detail-description">
            {product.description || "No description available."}
          </p>

          <h2 className="detail-price">
            {product.price.toLocaleString("tr-TR", {
              style: "currency",
              currency: "TRY",
            })}
          </h2>

          <p className="detail-stock">
            {product.stock > 0
              ? `${product.stock} items available`
              : "Out of stock"}
          </p>
         <div className="quantity-selector">
  <span>Quantity</span>

  <div className="quantity-controls">
    <button
      type="button"
      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
      disabled={quantity <= 1}
    >
      −
    </button>

    <span>{quantity}</span>

    <button
      type="button"
      onClick={() =>
        setQuantity((current) => Math.min(product.stock, current + 1))
      }
      disabled={quantity >= product.stock}
    >
      +
    </button>
    <button
  type="button"
  className="add-to-cart-button"
  disabled={product.stock === 0}
  onClick={() => {
    addToCart(product, quantity);
    setSuccessMessage(`${quantity} item(s) added to your cart!`);
  }}
>
  Add to Cart
</button>

{successMessage && (
  <p className="cart-success-message">
    {successMessage}
  </p>
)}
  </div>
</div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetailPage;