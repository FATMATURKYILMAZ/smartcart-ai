
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string | null;
};

const API_URL = "http://localhost:8081/api/products";

const categories = ["All", "Headphones", "Mice", "Other"];

// Ürün kategorisini, isim ve açıklamasına göre tahmin eder.
function inferCategory(product: Product): string {
  const name = (product.name ?? "").toLowerCase();
  const description = (product.description ?? "").toLowerCase();

  if (
    name.includes("kulaklık") ||
    name.includes("headphone") ||
    description.includes("kulaklık") ||
    description.includes("headphone")
  ) {
    return "Headphones";
  }

  if (
    name.includes("fare") ||
    name.includes("mouse") ||
    description.includes("fare") ||
    description.includes("mouse")
  ) {
    return "Mice";
  }

  return "Other";
}

// Veritabanında kategori varsa onu kullanır.
function getCategory(product: Product): string {
  const inferredCategory = inferCategory(product);

  if (inferredCategory !== "Other") {
    return inferredCategory;
  }

  return product.category || "Other";
}

// Ürün adına ve açıklamasına göre uygun görseli seçer.
function getProductImage(
  product: Product,
  productCategory: string
): string {
  const searchText =
    `${product.name} ${product.description ?? ""}`.toLowerCase();

  if (
    productCategory === "Mice" ||
    searchText.includes("mouse") ||
    searchText.includes("fare")
  ) {
    return "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80";
  }

  if (
    productCategory === "Headphones" ||
    searchText.includes("kulaklık") ||
    searchText.includes("headphone")
  ) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
  }

  if (searchText.includes("saat") || searchText.includes("watch")) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
  }

  if (
    searchText.includes("hoparlör") ||
    searchText.includes("speaker")
  ) {
    return "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80";
  }

  return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
}

function App() {
  // Sepet ve favori bilgileri
  const { cartCount, addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Sayfa durumları
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Arama ve kategori filtreleme
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Backend üzerinden ürünleri getirir.
  async function fetchProducts() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load products.");
      }

      const data: Product[] = await response.json();

      setProducts(data);
      setError("");
    } catch {
      setError(
        "Unable to load products. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // Sayfa ilk açıldığında ürünleri getirir.
  useEffect(() => {
    void fetchProducts();
  }, []);

  // Arama ve kategori filtreleme işlemleri.
  const filteredProducts = products.filter((product) => {
    const query = searchTerm.trim().toLowerCase();

    const matchesSearch =
      (product.name ?? "").toLowerCase().includes(query) ||
      (product.description ?? "").toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "All" ||
      getCategory(product) === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="app">
      {/* Marketplace Header */}
      <header className="navbar">
        <Link className="brand" to="/">
          SmartCart <span>AI</span>
        </Link>

        <div className="header-search">
          <input
            type="search"
            placeholder="Search products, categories or brands..."
            aria-label="Search products"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <span>⌕</span>
        </div>

        <div className="header-actions">
          <button type="button" className="header-action">
            ♙ <span>My Account</span>
          </button>

          <Link to="/favorites" className="header-action">
            ♡ <span>Favorites</span>
          </Link>

          <Link to="/cart" className="header-action">
            My Cart ({cartCount})
          </Link>
        </div>
      </header>

      {/* Category Navigation */}
      <nav className="category-nav">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={selectedCategory === item ? "active" : ""}
            onClick={() => {
              setSelectedCategory(item);
              document.getElementById("products")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            {item === "All" ? "All Products" : item}
          </button>
        ))}
      </nav>

      {/* Hero Banner */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            ✨ AI-POWERED SHOPPING
          </span>

          <h1>
            Find What You Love.
            <br />
            Shop Smarter.
          </h1>

          <p className="hero-description">
            Discover products you'll love with intelligent
            recommendations and a shopping experience designed around you.
          </p>

          <button
            className="hero-button"
            onClick={() =>
              document.getElementById("products")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            Explore Products →
          </button>
        </div>

        <div className="hero-visual">
          <div className="hero-circle">
            <span>AI</span>
            <small>SMART SHOPPING</small>
          </div>
        </div>
      </section>

      {/* Shopping Highlights */}
      <section className="shopping-highlights">
        <div className="highlight-card">
          <span className="highlight-icon">🎧</span>
          <div>
            <h3>Tech Essentials</h3>
            <p>Technology for everyday life.</p>
          </div>
        </div>

        <div className="highlight-card">
          <span className="highlight-icon">✨</span>
          <div>
            <h3>Smart Choices</h3>
            <p>Discover products you'll love.</p>
          </div>
        </div>

        <div className="highlight-card">
          <span className="highlight-icon">🤖</span>
          <div>
            <h3>AI Recommendations</h3>
            <p>Smarter ways to find what you need.</p>
          </div>
        </div>
      </section>

      {/* Product Collection */}
      <section id="products" className="products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PRODUCT COLLECTION</p>
            <h2>Featured Products</h2>
          </div>

          <span className="product-count">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </span>
        </div>

        {/* Loading State */}
        {loading && <p>Loading products...</p>}

        {/* Error State */}
        {!loading && error && (
          <p className="error-message">{error}</p>
        )}

        {/* No Products */}
        {!loading && !error && products.length === 0 && (
          <p>No products available yet. Please check back soon.</p>
        )}

        {/* Product List */}
        {!loading && !error && products.length > 0 && (
          <>
            {filteredProducts.length === 0 ? (
              <p className="empty-results">
                No products match your search. Try another keyword or category.
              </p>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => {
                  const productCategory = getCategory(product);
                  const imageUrl = getProductImage(
                    product,
                    productCategory
                  );

                  const favorite = isFavorite(product.id);

                  return (
                    <article
                      className="product-card"
                      key={product.id}
                    >
                      <div className="product-image">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          loading="lazy"
                        />

                        {/* Favorite Button */}
                        <button
                          type="button"
                          className={`favorite-button ${
                            favorite ? "active" : ""
                          }`}
                          onClick={() => toggleFavorite(product)}
                          aria-label={
                            favorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          aria-pressed={favorite}
                        >
                          {favorite ? "♥" : "♡"}
                        </button>

                        <span className="product-badge">
                          {product.stock > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>
                      </div>

                      <div className="product-info">
                        <div className="product-title-row">
                          <p className="category">
                            {productCategory}
                          </p>

                          <span className="stock-indicator">
                            {product.stock > 0
                              ? "Available"
                              : "Sold Out"}
                          </span>
                        </div>

                        <h3>{product.name}</h3>

                        <p className="description">
                          {product.description ||
                            "No description provided."}
                        </p>

                        <div className="product-bottom">
                          <div>
                            <p className="price">
                              {product.price.toLocaleString("tr-TR", {
                                style: "currency",
                                currency: "TRY",
                              })}
                            </p>

                            <p className="stock">
                              {product.stock} items in stock
                            </p>
                          </div>
                        </div>

                        <div className="product-actions">
                          <Link
                            to={`/products/${product.id}`}
                            className="view-product-button"
                          >
                            View Details
                          </Link>

                          <button
                            type="button"
                            className="add-to-cart-button"
                            disabled={product.stock <= 0}
                            onClick={() => addToCart(product, 1)}
                          >
                            {product.stock > 0
                              ? "Add to Cart"
                              : "Out of Stock"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        SmartCart AI · A smarter shopping experience
      </footer>
    </main>
  );
}

export default App;
