
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();

  function getProductImage(name: string): string {
    const searchText = name.toLowerCase();

    if (
      searchText.includes("mouse") ||
      searchText.includes("fare")
    ) {
      return "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80";
    }

    if (
      searchText.includes("headphone") ||
      searchText.includes("kulaklık")
    ) {
      return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
    }

    return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
  }

  return (
    <main className="favorites-page">
      <div className="favorites-header">
        <Link to="/" className="back-link">
          ← Continue Shopping
        </Link>

        <p className="eyebrow">YOUR COLLECTION</p>
        <h1>My Favorites</h1>
        <p className="favorites-description">
          Your favorite products, all in one place.
        </p>

        <span className="favorites-count">
          {favorites.length}{" "}
          {favorites.length === 1 ? "product" : "products"}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <span className="empty-heart">♡</span>
          <h2>No favorites yet</h2>
          <p>
            Explore our collection and save the products you love.
          </p>
          <Link to="/" className="favorites-shop-button">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((product) => (
            <article className="favorite-card" key={product.id}>
              <div className="favorite-card-image">
                <img
                  src={getProductImage(product.name)}
                  alt={product.name}
                />
              </div>

              <div className="favorite-card-info">
                <p className="category">
                  {product.category || "Other"}
                </p>

                <h3>{product.name}</h3>

                <p className="description">
                  {product.description || "No description available."}
                </p>

                <p className="price">
                  {product.price.toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  })}
                </p>

                <p className="stock">
                  {product.stock > 0
                    ? `${product.stock} items in stock`
                    : "Out of stock"}
                </p>

                <button
                  type="button"
                  className="remove-favorite-button"
                  onClick={() => removeFavorite(product.id)}
                >
                  ♥ Remove from Favorites
                </button>

                <Link
                  to={`/products/${product.id}`}
                  className="favorite-detail-link"
                >
                  View Product →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default FavoritesPage;
