
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

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
}

const API_URL = "http://localhost:8081/api/products";

function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

const [formData, setFormData] = useState<ProductForm>({
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "Headphones",
});

const [saving, setSaving] = useState(false);
const [success, setSuccess] = useState("");
const [editingProduct, setEditingProduct] = useState<Product | null>(null);

const [editFormData, setEditFormData] = useState<ProductForm>({
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "Other",
});

const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load products.");
      }

      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Products could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
const [deleting, setDeleting] = useState(false);

  async function handleAddProduct(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setSaving(true);
  setError("");
  setSuccess("");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Product could not be added.");
    }

    await fetchProducts();

    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "Headphones",
    });

    setShowForm(false);
    setSuccess("Product added successfully!");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Product could not be added."
    );
  } finally {
    setSaving(false);
  }
}
function openEditModal(product: Product) {
  setEditingProduct(product);

  setEditFormData({
    name: product.name,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    category: product.category || "Other",
  });
}

function closeEditModal() {
  setEditingProduct(null);
}

async function handleUpdateProduct(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (!editingProduct) return;

  setUpdating(true);
  setError("");
  setSuccess("");

  try {
    const response = await fetch(
      `${API_URL}/${editingProduct.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          description: editFormData.description.trim(),
          price: Number(editFormData.price),
          stock: Number(editFormData.stock),
          category: editFormData.category,
        }),
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Product could not be updated.");
    }

    await fetchProducts();
    closeEditModal();
    setSuccess("Product updated successfully!");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Product could not be updated."
    );
  } finally {
    setUpdating(false);
  }
}

async function handleDeleteProduct() {
  if (!deletingProduct) return;

  setDeleting(true);
  setError("");
  setSuccess("");

  try {
    const response = await fetch(
      `${API_URL}/${deletingProduct.id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Product could not be deleted.");
    }

    setDeletingProduct(null);
    await fetchProducts();

    setSuccess("Product deleted successfully!");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Product could not be deleted."
    );
  } finally {
    setDeleting(false);
  }
}

  return (
    <main className="seller-products-page">
        {deletingProduct && (
  <div
    className="seller-modal-overlay"
    onClick={() => {
      if (!deleting) setDeletingProduct(null);
    }}
  >
    <div
      className="delete-confirmation-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="delete-modal-icon">
        !
      </div>

      <h2>Delete Product?</h2>

      <p>
        Are you sure you want to delete{" "}
        <strong>{deletingProduct.name}</strong>?
      </p>

      <p className="delete-warning-text">
        This action cannot be undone. The product will be
        permanently removed from your store.
      </p>

      <div className="delete-modal-actions">
        <button
          type="button"
          className="delete-cancel-button"
          disabled={deleting}
          onClick={() => setDeletingProduct(null)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="delete-confirm-button"
          disabled={deleting}
          onClick={handleDeleteProduct}
        >
          {deleting ? "Deleting..." : "Delete Product"}
        </button>
      </div>
    </div>
  </div>
)}
        {editingProduct && (
  <div
    className="seller-modal-overlay"
    onClick={closeEditModal}
  >
    <div
      className="seller-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="seller-modal-header">
        <div>
          <h2>Edit Product</h2>
          <p>Update your product information.</p>
        </div>

        <button
          type="button"
          className="seller-modal-close"
          onClick={closeEditModal}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleUpdateProduct}>
        <label>Product Name</label>
        <input
          value={editFormData.name}
          onChange={(event) =>
            setEditFormData({
              ...editFormData,
              name: event.target.value,
            })
          }
          required
        />

        <label>Description</label>
        <textarea
          value={editFormData.description}
          onChange={(event) =>
            setEditFormData({
              ...editFormData,
              description: event.target.value,
            })
          }
          required
        />

        <div className="seller-modal-row">
          <div>
            <label>Price</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={editFormData.price}
              onChange={(event) =>
                setEditFormData({
                  ...editFormData,
                  price: event.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <label>Stock</label>
            <input
              type="number"
              min="0"
              step="1"
              value={editFormData.stock}
              onChange={(event) =>
                setEditFormData({
                  ...editFormData,
                  stock: event.target.value,
                })
              }
              required
            />
          </div>
        </div>

        <label>Category</label>
        <select
          value={editFormData.category}
          onChange={(event) =>
            setEditFormData({
              ...editFormData,
              category: event.target.value,
            })
          }
        >
          <option value="Headphones">Headphones</option>
          <option value="Mice">Mice</option>
          <option value="Other">Other</option>
        </select>

        <div className="seller-modal-actions">
          <button
            type="button"
            className="seller-modal-cancel"
            onClick={closeEditModal}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="seller-modal-save"
            disabled={updating}
          >
            {updating ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      <header className="seller-products-header">
        <div>
          <Link to="/seller/dashboard" className="back-link">
            ← Dashboard
          </Link>
          <h1>My Products</h1>
          <p>Manage your store products and inventory.</p>
        </div>

       <button
  className="seller-add-product-button"
  type="button"
  onClick={() => {
    setShowForm((current) => !current);
    setSuccess("");
  }}
>
  {showForm ? "Cancel" : "+ Add New Product"}
</button>
      </header>
      {showForm && (
  <form className="seller-product-form" onSubmit={handleAddProduct}>
    <h2>Add New Product</h2>

    <input
      type="text"
      placeholder="Product name"
      value={formData.name}
      onChange={(event) =>
        setFormData({ ...formData, name: event.target.value })
      }
      required
    />

    <textarea
      placeholder="Product description"
      value={formData.description}
      onChange={(event) =>
        setFormData({ ...formData, description: event.target.value })
      }
      required
    />

    <input
      type="number"
      placeholder="Price"
      min="0.01"
      step="0.01"
      value={formData.price}
      onChange={(event) =>
        setFormData({ ...formData, price: event.target.value })
      }
      required
    />

    <input
      type="number"
      placeholder="Stock quantity"
      min="0"
      step="1"
      value={formData.stock}
      onChange={(event) =>
        setFormData({ ...formData, stock: event.target.value })
      }
      required
    />

    <select
      value={formData.category}
      onChange={(event) =>
        setFormData({ ...formData, category: event.target.value })
      }
    >
      <option value="Headphones">Headphones</option>
      <option value="Mice">Mice</option>
      <option value="Other">Other</option>
    </select>

    <button type="submit" disabled={saving}>
      {saving ? "Saving..." : "Save Product"}
    </button>
  </form>
)}

{success && (
  <p className="seller-success-message">{success}</p>
)}

      <section className="seller-products-toolbar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <span>{filteredProducts.length} products</span>
      </section>

      {loading ? (
        <p className="seller-products-message">Loading products...</p>
      ) : error ? (
        <p className="seller-products-error">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="seller-products-message">
          No products found.
        </p>
      ) : (
        <div className="seller-products-table-wrapper">
          <table className="seller-products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <small>{product.description}</small>
                  </td>

                  <td>{product.category || "Other"}</td>

                  <td>
                    {product.price.toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </td>

                  <td>{product.stock}</td>

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

                  <td>
                    <button
  type="button"
  className="seller-edit-button"
  onClick={() => openEditModal(product)}
>
  Edit
</button>

<button
  type="button"
  className="seller-delete-button"
  onClick={() => setDeletingProduct(product)}
>
  Delete
</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default SellerProductsPage;
