
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

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

function getCategory(product: Product): string {
  // Veritabanındaki kategori varsa onu kullan.
  // Eski kayıtlarda kategori null ise geçici olarak tahmin et.
  return product.category || inferCategory(product);
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

  useEffect(() => {
    void fetchProducts();
  }, []);

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

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategory("Headphones");
    setEditingId(null);
  }

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
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

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
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  }

  return (
    <main className="app">
      <header className="navbar">
        <a className="brand" href="/">
          SmartCart <span>AI</span>
        </a>

        <span className="tagline">
          Your smarter shopping experience 🛒
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">SMARTER SHOPPING</p>
        <h1>A smarter way to shop.</h1>
        <p className="hero-description">
          Discover products, explore your options, and enjoy a smarter
          shopping experience.
        </p>
      </section>

      <section className="products">
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

        <div className="catalog-toolbar">
          <input
            type="search"
            className="search-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search products"
          />

          <div className="category-filters" aria-label="Product categories">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`category-button ${
                  selectedCategory === item ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(item)}
                aria-pressed={selectedCategory === item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading && <p>Loading products...</p>}

        {!loading && !error && products.length === 0 && (
          <p>No products available yet. Add your first product below.</p>
        )}

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

                  const imageUrl =
                    productCategory === "Mice"
                      ? "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80"
                      : productCategory === "Headphones"
                        ? "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                        : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

                  return (
                    <article className="product-card" key={product.id}>
                      <div className="product-image">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          loading="lazy"
                        />

                        <span className="product-badge">
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      <div className="product-info">
                        <p className="category">{productCategory}</p>

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

      <section className="add-product" id="product-form">
        <p className="eyebrow">INVENTORY MANAGEMENT</p>

        <h2>
          {editingId !== null ? "Edit Product" : "Add a New Product"}
        </h2>

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

      <footer className="footer">
        SmartCart AI · A smarter shopping experience
      </footer>
    </main>
  );
}

export default App;
