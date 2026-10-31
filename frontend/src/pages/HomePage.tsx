import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

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
const editableCategories = ["Headphones", "Mice", "Other"];
const { cartCount } = useCart();

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

  // Ürün adı veya açıklaması kulaklık ya da mouse olduğunu gösteriyorsa
  // eski Other kayıtlarında da doğru kategoriyi kullan.
  if (inferredCategory !== "Other") {
    return inferredCategory;
  }

  // Diğer durumlarda veritabanındaki kategoriyi kullan.
  return product.category || "Other";
}

// Ürün adına ve açıklamasına göre uygun görseli seçer.
function getProductImage(product: Product, productCategory: string): string {
  const searchText =
    `${product.name} ${product.description ?? ""}`.toLowerCase();

  // Mouse görseli
  if (
    productCategory === "Mice" ||
    searchText.includes("mouse") ||
    searchText.includes("fare")
  ) {
    return "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80";
  }

  // Kulaklık görseli
  if (
    productCategory === "Headphones" ||
    searchText.includes("kulaklık") ||
    searchText.includes("headphone")
  ) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
  }

  // Kol saati görseli
  if (searchText.includes("saat") || searchText.includes("watch")) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
  }

  // Hoparlör görseli
  if (searchText.includes("hoparlör") || searchText.includes("speaker")) {
    return "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80";
  }

  // Diğer ürünler için teknoloji temalı görsel
  return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Headphones");

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
      setError("Unable to load products. Check that the backend is running.");
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
      selectedCategory === "All" || getCategory(product) === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Form alanlarını temizler.
  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategory("Headphones");
    setEditingId(null);
  }

  // Düzenlenecek ürünü forma aktarır.
  function startEditing(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description ?? "");
    setPrice(String(product.price));
    setStock(String(product.stock));
    setCategory(getCategory(product));

    setError("");
    setSuccess("");

    document.getElementById("product-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Yeni ürün ekleme ve mevcut ürünü güncelleme işlemi.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!editableCategories.includes(category)) {
      setError("Please select a valid product category.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setError("Stock must be a whole number, zero or greater.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = editingId !== null;

      const url = isEditing ? `${API_URL}/${editingId}` : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: numericPrice,
          stock: numericStock,
          category,
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();

        throw new Error(
          `Failed to ${isEditing ? "update" : "add"} product. ${
            responseText || `HTTP ${response.status}`
          }`,
        );
      }

      resetForm();

      setSuccess(
        isEditing
          ? "Product updated successfully!"
          : "Product added successfully!",
      );

      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  // Ürün silme işlemi.
  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product.");
      }

      if (editingId === product.id) {
        resetForm();
      }

      setSuccess("Product deleted successfully!");

      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="app">
      {/* Üst navigasyon */}
      {/* Marketplace Header */}
      <header className="navbar">
        <a className="brand" href="/">
          SmartCart <span>AI</span>
        </a>

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

          <button type="button" className="header-action">
            ♡ <span>Favorites</span>
          </button>

         <Link to="/cart" className="header-action">
  My Cart ({cartCount})
</Link>
        </div>
      </header>
      {/* Category Navigation */}
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
      Discover products you'll love with intelligent recommendations
      and a shopping experience designed around you.
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
      {/* Ürün koleksiyonu */}
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

      {/* Yüklenme durumu */}
        {loading && <p>Loading products...</p>}

        {/* Henüz ürün yoksa */}
        {!loading && !error && products.length === 0 && (
          <p>No products available yet. Add your first product below.</p>
        )}

        {/* Ürün listesi */}
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

                  // Her ürün için uygun görseli seç.
                  const imageUrl = getProductImage(product, productCategory);

                  return (
                    <article className="product-card" key={product.id}>
                      <div className="product-image">
                        <img src={imageUrl} alt={product.name} loading="lazy" />

                        <span className="product-badge">
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      <div className="product-info">
  <div className="product-title-row">
    <p className="category">{productCategory}</p>

    <span className="stock-indicator">
      {product.stock > 0 ? "Available" : "Sold Out"}
    </span>
  </div>

  <h3>{product.name}</h3>

  <p className="description">
    {product.description || "No description provided."}
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
    <button
      type="button"
      className="edit-button"
      onClick={() => startEditing(product)}
    >
      Edit
    </button>

    <button
      type="button"
      className="delete-button"
      onClick={() => void handleDelete(product)}
    >
      Delete
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

      {/* Ürün ekleme ve düzenleme formu */}
      <section className="add-product" id="product-form">
        <p className="eyebrow">INVENTORY MANAGEMENT</p>

        <h2>{editingId !== null ? "Edit Product" : "Add a New Product"}</h2>

        <p className="form-description">
          {editingId !== null
            ? "Update the product details below."
            : "Add a product to your SmartCart collection."}
        </p>

        <form onSubmit={handleSubmit} className="product-form">
          <label htmlFor="name">Product Name</label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Wireless Mouse"
            required
          />

          <label htmlFor="description">Description</label>

          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe your product"
            rows={3}
          />

          <label htmlFor="category">Product Category</label>

          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          >
            <option value="Headphones">Headphones</option>
            <option value="Mice">Mice</option>
            <option value="Other">Other</option>
          </select>

          <div className="form-row">
            <div>
              <label htmlFor="price">Price (TRY)</label>

              <input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="499.90"
                required
              />
            </div>

            <div>
              <label htmlFor="stock">Stock Quantity</label>

              <input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                placeholder="10"
                required
              />
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          {success && <p className="success">{success}</p>}

          <button className="submit-button" type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId !== null
                ? "Save Changes"
                : "Add Product"}
          </button>

          {editingId !== null && (
            <button
              className="cancel-button"
              type="button"
              onClick={() => {
                resetForm();
                setError("");
                setSuccess("");
              }}
            >
              Cancel Editing
            </button>
          )}
        </form>
      </section>

      {/* Alt bilgi */}
      <footer className="footer">
        SmartCart AI · A smarter shopping experience
      </footer>
    </main>
  );
}

export default App;
