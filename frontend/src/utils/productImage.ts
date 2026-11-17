
type ProductImageData = {
  name: string;
  description?: string | null;
};

export function getProductImage(
  product: ProductImageData,
  productCategory?: string | null
): string {
  const searchText =
    `${product.name} ${product.description ?? ""}`.toLowerCase();

  if (
    productCategory === "Mice" ||
    searchText.includes("mouse") ||
    searchText.includes("fare")
  ) {
    return "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80";
  }

  if (
    productCategory === "Headphones" ||
    searchText.includes("kulaklık") ||
    searchText.includes("headphone")
  ) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
  }

  if (searchText.includes("saat") || searchText.includes("watch")) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
  }

  if (
    searchText.includes("hoparlör") ||
    searchText.includes("speaker")
  ) {
    return "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80";
  }

  return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
}
