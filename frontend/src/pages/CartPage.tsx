import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getProductImage } from "../utils/productImage";

interface OrderResponse {
  id: number;
  totalAmount: number;
  status: string;
}

function CartPage() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderConfirmation, setOrderConfirmation] =
    useState<OrderResponse | null>(null);

  const formatPrice = (price: number) =>
    price.toLocaleString("tr-TR", {
      style: "currency",
      currency: "TRY",
    });

  const handlePlaceOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8081/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            errorData?.detail ||
            "Unable to place your order. Please try again.",
        );
      }

      const createdOrder: OrderResponse = await response.json();

      setOrderConfirmation(createdOrder);
      clearCart();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Successful order confirmation
  if (orderConfirmation) {
    return (
      <main className="cart-page">
        <div className="empty-cart">
          <h1>Order Placed Successfully!</h1>

          <p>Thank you for your order. Your order has been received.</p>

          <h2>Order #{orderConfirmation.id}</h2>

          <p>Total: {formatPrice(orderConfirmation.totalAmount)}</p>

          <p>Status: {orderConfirmation.status}</p>

          <Link to="/" className="continue-shopping-button">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <h1>My Shopping Cart</h1>

        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Discover products and add your favorites to your cart.</p>

          <Link to="/" className="continue-shopping-button">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <h1>My Shopping Cart</h1>
        <span>{cartCount} items</span>
      </div>

      <div className="cart-layout">
        <section className="cart-items">
          {cartItems.map((item) => (
            <article className="cart-item" key={item.id}>
              <img
                src={getProductImage(item, item.category)}
                alt={item.name}
                className={`cart-product-image ${
                  item.category === "Headphones" ? "headphone-image" : ""
                }`}
              />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>{formatPrice(item.price)}</p>
                <span>{item.stock} items available</span>
              </div>

              <div className="cart-item-controls">
                <button
                  type="button"
                  disabled={item.quantity <= 1}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  −
                </button>

                <span>{item.quantity}</span>

                <button
                  type="button"
                  disabled={item.quantity >= item.stock}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <strong>{formatPrice(item.price * item.quantity)}</strong>

              <button
                type="button"
                className="remove-cart-item"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </article>
          ))}
        </section>

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Total Items</span>
            <strong>{cartCount}</strong>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>

          <button
            type="button"
            className="clear-cart-button"
            onClick={clearCart}
          >
            Clear Cart
          </button>

          <Link to="/" className="continue-shopping-link">
            Continue Shopping
          </Link>

          <hr />

          <h2>Checkout</h2>

          <form onSubmit={handlePlaceOrder}>
            <div className="checkout-form-group">
              <label htmlFor="customerName">Full Name</label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="checkout-form-group">
              <label htmlFor="customerEmail">Email Address</label>
              <input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            {errorMessage && <p className="checkout-error">{errorMessage}</p>}

            <button
              type="submit"
              className="place-order-button"
              disabled={isSubmitting || cartItems.length === 0}
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}

export default CartPage;
