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

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const PRODUCTS_API_URL = "http://localhost:8081/api/products";
const ORDERS_API_URL = "http://localhost:8081/api/orders";

function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, ordersResponse] = await Promise.all([
          fetch(PRODUCTS_API_URL),
          fetch(ORDERS_API_URL),
        ]);

        if (!productsResponse.ok || !ordersResponse.ok) {
          throw new Error("Dashboard data could not be loaded.");
        }

        const productsData: Product[] = await productsResponse.json();
        const ordersData: Order[] = await ordersResponse.json();

        setProducts(productsData);
        setOrders(ordersData);
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
    (product) => product.stock <= 5,
  ).length;

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING",
  ).length;

  const totalSales = orders
    .filter((order) => order.status === "DELIVERED")
    .reduce((total, order) => total + order.totalAmount, 0);

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const salesOverview = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - (5 - index));

    const monthSales = orders
      .filter((order) => {
        const orderDate = new Date(order.createdAt);

        return (
          order.status === "DELIVERED" &&
          orderDate.getFullYear() === date.getFullYear() &&
          orderDate.getMonth() === date.getMonth()
        );
      })
      .reduce((total, order) => total + order.totalAmount, 0);

    return {
      label: date.toLocaleDateString("en-US", { month: "short" }),
      sales: monthSales,
    };
  });

  const maxMonthlySales = Math.max(
    ...salesOverview.map((month) => month.sales),
    0,
  );

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-US", {
      style: "currency",
      currency: "TRY",
    });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");

  const formatStatus = (status: string) =>
    status.charAt(0) + status.slice(1).toLowerCase();

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

        {error && <p className="seller-products-error">{error}</p>}

        <section className="seller-stats">
          <article className="seller-stat-card">
            <span>Total Products</span>
            <strong>{loading ? "..." : totalProducts}</strong>
            <small>Products in your store</small>
          </article>

          <article className="seller-stat-card">
            <span>Pending Orders</span>
            <strong>{loading ? "..." : pendingOrders}</strong>
            <small>Orders waiting for action</small>
          </article>

          <article className="seller-stat-card">
            <span>Low Stock</span>
            <strong>{loading ? "..." : lowStockProducts}</strong>
            <small>Products needing attention</small>
          </article>

          <article className="seller-stat-card">
            <span>Total Sales</span>
            <strong>{loading ? "..." : formatCurrency(totalSales)}</strong>
            <small>Sales overview</small>
          </article>
        </section>

        <section className="inventory-alerts-card">
          <div className="inventory-alerts-header">
            <div>
              <h2>Inventory Alerts</h2>
              <p>Products that need your attention.</p>
            </div>

            <Link to="/seller/products">Manage Inventory →</Link>
          </div>

          {loading ? (
            <p className="inventory-empty-message">Loading inventory...</p>
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
                  <div className="inventory-alert-item" key={product.id}>
                    <div className="inventory-product-info">
                      <strong>{product.name}</strong>
                      <span>
                        {product.stock === 0 ? "Out of Stock" : "Low Stock"}
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

        <section className="dashboard-recent-orders">
          <div className="dashboard-section-header">
            <div>
              <h2>Recent Orders</h2>
              <p>Keep track of your latest customer orders.</p>
            </div>

            <Link to="/seller/orders">View All Orders →</Link>
          </div>

          {loading ? (
            <p className="dashboard-orders-message">Loading orders...</p>
          ) : recentOrders.length === 0 ? (
            <div className="dashboard-orders-message">
              <strong>No orders yet.</strong>
              <p>Your recent orders will appear here.</p>
            </div>
          ) : (
            <div className="dashboard-orders-table-wrapper">
              <table className="dashboard-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <div className="dashboard-customer">
                          <strong>{order.customerName}</strong>
                          <span>{order.customerEmail}</span>
                        </div>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span
                          className={`dashboard-order-status status-${order.status.toLowerCase()}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dashboard-sales-card">
          <div className="dashboard-section-header">
            <div>
              <h2>Sales Overview</h2>
              <p>Monthly sales from delivered orders.</p>
            </div>

            <span className="dashboard-sales-period">Last 6 Months</span>
          </div>

          {loading ? (
            <p className="dashboard-orders-message">Loading sales data...</p>
          ) : (
            <>
              <div className="dashboard-sales-chart">
                {salesOverview.map((month) => {
                  const barHeight =
                    maxMonthlySales > 0
                      ? (month.sales / maxMonthlySales) * 100
                      : 0;

                  return (
                    <div className="dashboard-sales-column" key={month.label}>
                      <strong className="dashboard-sales-amount">
                        {month.sales.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}
                      </strong>

                      <div className="dashboard-sales-bar-area">
                        <div
                          className="dashboard-sales-bar"
                          title={`${month.label}: ${month.sales.toLocaleString(
                            "en-US",
                            {
                              style: "currency",
                              currency: "TRY",
                            },
                          )}`}
                          style={{ height: `${barHeight}%` }}
                        />
                      </div>

                      <span className="dashboard-sales-month">
                        {month.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {maxMonthlySales === 0 && (
                <p className="dashboard-sales-empty">
                  No delivered sales in this period yet.
                </p>
              )}
            </>
          )}
        </section>

        <section className="seller-content-card">
          <div>
            <h2>Store Management</h2>
            <p>
              Manage your products, monitor inventory and keep track of customer
              orders.
            </p>
          </div>

          <div className="seller-quick-actions">
            <Link to="/seller/products">Manage Products →</Link>

            <Link to="/seller/orders">View Orders →</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SellerDashboard;
