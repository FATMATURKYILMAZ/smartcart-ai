import { useEffect, useState } from "react";

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}
const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/orders");

      if (!response.ok) {
        throw new Error("Failed to fetch orders.");
      }

      const data: Order[] = await response.json();
      setOrders(data);
    } catch (error) {
      setError("Could not load orders.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "text/plain",
          },
          body: newStatus,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Status update failed:", {
          status: response.status,
          message: errorText,
        });

        throw new Error(errorText);
      }

      const updatedOrder: Order = await response.json();

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId ? updatedOrder : order,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Could not update order status.");
    }
  };
  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="seller-orders">
      <h1>Orders</h1>
      <p>Manage and monitor your customer orders.</p>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.customerEmail}</td>
                  <td>
                    {order.totalAmount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td>
                    <select
                      value={order.status}
                      onChange={(event) =>
                        updateOrderStatus(order.id, event.target.value)
                      }
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
