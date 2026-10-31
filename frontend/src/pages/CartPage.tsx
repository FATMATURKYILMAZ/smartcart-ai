
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartPage() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const formatPrice = (price: number) =>
    price.toLocaleString("tr-TR", {
      style: "currency",
      currency: "TRY",
    });

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
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>{formatPrice(item.price)}</p>
                <span>{item.stock} items available</span>
              </div>

              <div className="cart-item-controls">
                <button
                  type="button"
                  disabled={item.quantity <= 1}
                  onClick={() =>
                    updateQuantity(item.id, item.quantity - 1)
                  }
                >
                  −
                </button>

                <span>{item.quantity}</span>

                <button
                  type="button"
                  disabled={item.quantity >= item.stock}
                  onClick={() =>
                    updateQuantity(item.id, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>

              <strong>
                {formatPrice(item.price * item.quantity)}
              </strong>

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
        </aside>
      </div>
    </main>
  );
}

export default CartPage;
