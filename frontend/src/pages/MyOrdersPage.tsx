
import { useEffect, useState } from "react";

interface OrderProduct {
  id: number;
  name: string;
  price: number;
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: OrderProduct;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:8081/api/orders"
        );

        if (!response.ok) {
          throw new Error("Unable to load your orders.");
        }

        const data: Order[] = await response.json();

        setOrders(
          data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (price: number) =>
    price.toLocaleString("tr-TR", {
      style: "currency",
      currency: "TRY",
    });

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("tr-TR");

  const getStatusClass = (status: string) =>
    `order-status status-${status.toLowerCase()}`;

  if (isLoading) {
    return (
      <main className="my-orders-page">
        <h1>My Orders</h1>
        <p>Loading your orders...</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="my-orders-page">
        <h1>My Orders</h1>
        <p className="checkout-error">{errorMessage}</p>
      </main>
    );
  }

  return (
    <main className="my-orders-page">
      <div className="orders-heading">
        <h1>My Orders</h1>
        <p>Track and manage your recent orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-cart">
          <h2>No orders yet</h2>
          <p>Your order history will appear here.</p>
        </div>
      ) : (
        <section className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-header">
                <div>
                  <h2>Order #{order.id}</h2>
                  <p>{formatDate(order.createdAt)}</p>
                </div>

                <span className={getStatusClass(order.status)}>
                  {order.status}
                </span>
              </div>

              <div className="order-customer">
                <p>
                  <strong>Customer:</strong> {order.customerName}
                </p>
                <p>
                  <strong>Email:</strong> {order.customerEmail}
                </p>
              </div>

              <div className="order-products">
                <h3>Order Items</h3>

                {order.items.map((item) => (
                  <div className="order-product" key={item.id}>
                    <div>
                      <strong>{item.product.name}</strong>
                      <p>Quantity: {item.quantity}</p>
                    </div>

                    <strong>{formatPrice(item.lineTotal)}</strong>
                  </div>
                ))}
              </div>

              <div className="order-card-total">
                <span>Total Amount</span>
                <strong>{formatPrice(order.totalAmount)}</strong>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default MyOrdersPage;
