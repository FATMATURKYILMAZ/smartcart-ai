
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../App.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string | null;
}

const API_URL = "http://localhost:8081/api/products";

function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Dashboard data could not be loaded.");
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Could not load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => product.stock <= 5
  ).length;

  return (
    <div className="seller-dashboard">
      <aside className="seller-sidebar">
        <Link to="/" className="seller-logo">
          SmartCart <span>AI</span>
        </Link>

        <p className="sidebar-label">SELLER MENU</p>

        <nav className="seller-nav">
          <Link
            to="/seller/dashboard"
            className="seller-nav-item active"
          >
            <span>▦</span> Dashboard
          </Link>

          <Link
            to="/seller/products"
            className="seller-nav-item"
          >
            <span>▣</span> My Products
          </Link>

          <Link
            to="/seller/orders"
            className="seller-nav-item"
          >
            <span>▤</span> Orders
          </Link>

          <Link
            to="/seller/inventory"
            className="seller-nav-item"
          >
            <span>▧</span> Inventory
          </Link>
        </nav>

        <Link to="/" className="seller-store-link">
          ← Back to Store
        </Link>
      </aside>

      <main className="seller-main">
        <header className="seller-topbar">
          <div>
            <p className="seller-welcome">SELLER CENTER</p>
            <h1>Dashboard</h1>
          </div>

          <div className="seller-profile">
            <div className="seller-avatar">S</div>
            <span>Seller Account</span>
          </div>
        </header>

        <section className="seller-welcome-card">
          <div>
            <p>WELCOME TO SMARTCART AI</p>
            <h2>Manage your store with ease.</h2>
            <span>
              Track your products, inventory and orders from one place.
            </span>
          </div>

          <div className="seller-welcome-icon">✦</div>
        </section>

        {error && (
          <p className="seller-products-error">{error}</p>
        )}

        <section className="seller-stats">
          <article className="seller-stat-card">
            <span>Total Products</span>
            <strong>
              {loading ? "..." : totalProducts}
            </strong>
            <small>Products in your store</small>
          </article>

          <article className="seller-stat-card">
            <span>Pending Orders</span>
            <strong>—</strong>
            <small>Orders waiting for action</small>
          </article>

          <article className="seller-stat-card">
            <span>Low Stock</span>
            <strong>
              {loading ? "..." : lowStockProducts}
            </strong>
            <small>Products needing attention</small>
          </article>

          <article className="seller-stat-card">
            <span>Total Sales</span>
            <strong>—</strong>
            <small>Sales overview</small>
          </article>
        </section>

<section className="inventory-alerts-card">
  <div className="inventory-alerts-header">
    <div>
      <h2>Inventory Alerts</h2>
      <p>Products that need your attention.</p>
    </div>

    <Link to="/seller/products">
      Manage Inventory →
    </Link>
  </div>

  {loading ? (
    <p className="inventory-empty-message">
      Loading inventory...
    </p>
  ) : lowStockProducts === 0 ? (
    <div className="inventory-all-good">
      <span>✓</span>
      <div>
        <strong>All products are well stocked!</strong>
        <p>There are no products requiring attention.</p>
      </div>
    </div>
  ) : (
    <div className="inventory-alerts-list">
      {products
        .filter((product) => product.stock <= 5)
        .sort((a, b) => a.stock - b.stock)
        .map((product) => (
          <div
            className="inventory-alert-item"
            key={product.id}
          >
            <div className="inventory-product-info">
              <strong>{product.name}</strong>
              <span>
                {product.stock === 0
                  ? "Out of Stock"
                  : "Low Stock"}
              </span>
            </div>

            <div className="inventory-stock-info">
              <strong>{product.stock}</strong>
              <span>
                {product.stock === 1 ? "unit left" : "units left"}
              </span>
            </div>
          </div>
        ))}
    </div>
  )}
</section>
        <section className="seller-content-card">
          <div>
            <h2>Store Management</h2>
            <p>
              Manage your products, monitor inventory and keep track of
              customer orders.
            </p>
          </div>

          <div className="seller-quick-actions">
            <Link to="/seller/products">
              Manage Products →
            </Link>

            <Link to="/seller/orders">
              View Orders →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SellerDashboard;
