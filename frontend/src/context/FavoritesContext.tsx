
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface FavoriteProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string | null;
}

interface FavoritesContextType {
  favorites: FavoriteProduct[];
  favoriteCount: number;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: FavoriteProduct) => void;
  removeFavorite: (productId: number) => void;
}

const FavoritesContext = createContext<
  FavoritesContextType | undefined
>(undefined);

export function FavoritesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>(() => {
    try {
      const savedFavorites = localStorage.getItem("smartcart-favorites");
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "smartcart-favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  const isFavorite = (productId: number) =>
    favorites.some((product) => product.id === productId);

  const toggleFavorite = (product: FavoriteProduct) => {
    setFavorites((current) =>
      current.some((item) => item.id === product.id)
        ? current.filter((item) => item.id !== product.id)
        : [...current, product]
    );
  };

  const removeFavorite = (productId: number) => {
    setFavorites((current) =>
      current.filter((product) => product.id !== productId)
    );
  };

  const favoriteCount = favorites.length;

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteCount,
        isFavorite,
        toggleFavorite,
        removeFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error(
      "useFavorites must be used inside FavoritesProvider."
    );
  }

  return context;
}
