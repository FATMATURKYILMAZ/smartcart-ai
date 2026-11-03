
import { Link } from "react-router-dom";
import "../../App.css";

function SellerDashboard() {
  return (
    <div className="seller-dashboard">
      <aside className="seller-sidebar">
        <Link to="/" className="seller-logo">
          SmartCart <span>AI</span>
        </Link>

        <p className="sidebar-label">SELLER MENU</p>

        <nav className="seller-nav">
          <Link to="/seller/dashboard" className="seller-nav-item active">
            <span>▦</span> Dashboard
          </Link>

          <Link to="/seller/products" className="seller-nav-item">
            <span>▣</span> My Products
          </Link>

          <Link to="/seller/orders" className="seller-nav-item">
            <span>▤</span> Orders
          </Link>

          <Link to="/seller/inventory" className="seller-nav-item">
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

        <section className="seller-stats">
          <article className="seller-stat-card">
            <span>Total Products</span>
            <strong>—</strong>
            <small>Products in your store</small>
          </article>

          <article className="seller-stat-card">
            <span>Pending Orders</span>
            <strong>—</strong>
            <small>Orders waiting for action</small>
          </article>

          <article className="seller-stat-card">
            <span>Low Stock</span>
            <strong>—</strong>
            <small>Products needing attention</small>
          </article>

          <article className="seller-stat-card">
            <span>Total Sales</span>
            <strong>—</strong>
            <small>Sales overview</small>
          </article>
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
