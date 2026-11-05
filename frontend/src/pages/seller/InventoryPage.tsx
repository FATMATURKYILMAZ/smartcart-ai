
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string | null;
}

const API_URL = "http://localhost:8081/api/products";

function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [stockValues, setStockValues] = useState<Record<number, string>>({});
  const [savingStockId, setSavingStockId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch inventory.");
      }

      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load products when page opens
  useEffect(() => {
    fetchProducts();
  }, []);

  // Update product stock
  const handleStockUpdate = async (product: Product) => {
    const stockValue = stockValues[product.id];

    if (stockValue === undefined || stockValue.trim() === "") {
      return;
    }

    const newStock = Number(stockValue);

    if (!Number.isInteger(newStock) || newStock < 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    try {
      setSavingStockId(product.id);
      setSuccessMessage("");
      setError("");

      const response = await fetch(`${API_URL}/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...product,
          stock: newStock,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update stock.");
      }

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === product.id
            ? { ...item, stock: newStock }
            : item
        )
      );

      setStockValues((currentValues) => {
        const updatedValues = { ...currentValues };
        delete updatedValues[product.id];
        return updatedValues;
      });

      setSuccessMessage(`${product.name} stock updated successfully!`);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSavingStockId(null);
    }
  };

  // Search and filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Low Stock" &&
        product.stock > 0 &&
        product.stock <= 5) ||
      (activeFilter === "Out of Stock" && product.stock === 0);

    return matchesSearch && matchesFilter;
  });

  // Inventory statistics
  const totalProducts = products.length;

  const lowStock = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  ).length;

  const outOfStock = products.filter(
    (product) => product.stock === 0
  ).length;

  return (
    <div className="seller-layout">
      <aside className="seller-sidebar">
        <div className="seller-sidebar-logo">SmartCart AI</div>

        <nav className="seller-sidebar-nav">
          <Link to="/seller/dashboard">Dashboard</Link>
          <Link to="/seller/products">My Products</Link>

          <Link to="/seller/inventory" className="active">
            Inventory
          </Link>

          <Link to="/seller/dashboard">Orders</Link>
          <Link to="/">Back to Store</Link>
        </nav>
      </aside>

      <main className="seller-main">
        <header className="seller-topbar">
          <div>
            <h1>Inventory Management</h1>
            <p>Monitor and manage your product stock.</p>
          </div>
        </header>

        {/* Inventory Statistics */}
        <section className="seller-stats-grid">
          <div className="seller-stat-card">
            <span>Total Products</span>
            <h2>{totalProducts}</h2>
          </div>

          <div className="seller-stat-card">
            <span>Low Stock</span>
            <h2>{lowStock}</h2>
          </div>

          <div className="seller-stat-card">
            <span>Out of Stock</span>
            <h2>{outOfStock}</h2>
          </div>
        </section>

        {/* Inventory Table */}
        <section className="seller-products-section">
          <div className="seller-products-header">
            <div>
              <h2>Stock Overview</h2>
              <p>View and manage your product inventory.</p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Stock Filters */}
          <div className="inventory-filters">
            {["All", "Low Stock", "Out of Stock"].map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? "active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {loading && <p>Loading inventory...</p>}

          {error && (
            <p className="error-message">{error}</p>
          )}

          {successMessage && (
            <p className="inventory-success-message">
              {successMessage}
            </p>
          )}

          {!loading && !error && (
            <div className="seller-table-wrapper">
              <table className="seller-products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Current Stock</th>
                    <th>Update Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>

                      <td>{product.category || "Other"}</td>

                      <td>
                        ₺{product.price.toLocaleString("tr-TR")}
                      </td>

                      <td>{product.stock} units</td>

                      <td>
                        <div className="inventory-stock-update">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="New stock"
                            value={stockValues[product.id] ?? ""}
                            onChange={(e) =>
                              setStockValues((current) => ({
                                ...current,
                                [product.id]: e.target.value,
                              }))
                            }
                          />

                          <button
                            onClick={() => handleStockUpdate(product)}
                            disabled={
                              savingStockId === product.id ||
                              stockValues[product.id] === undefined ||
                              stockValues[product.id].trim() === ""
                            }
                          >
                            {savingStockId === product.id
                              ? "Saving..."
                              : "Save"}
                          </button>
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            product.stock === 0
                              ? "seller-stock-empty"
                              : product.stock <= 5
                                ? "seller-stock-low"
                                : "seller-stock-active"
                          }
                        >
                          {product.stock === 0
                            ? "Out of Stock"
                            : product.stock <= 5
                              ? "Low Stock"
                              : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6}>No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default InventoryPage;
