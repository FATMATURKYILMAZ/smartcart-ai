
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

const API_URL = "http://localhost:8081/api/auth";

export type UserRole = "CUSTOMER" | "SELLER";

export interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
}

interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

function getStoredAuth(): {
  user: AuthUser | null;
  token: string | null;
} {
  try {
    const stored = sessionStorage.getItem("smartcart_auth");

    if (!stored) {
      return { user: null, token: null };
    }

    const parsed = JSON.parse(stored) as AuthResponse;

    if (!parsed.token || !parsed.email) {
      sessionStorage.removeItem("smartcart_auth");
      return { user: null, token: null };
    }

    return {
      token: parsed.token,
      user: {
        userId: parsed.userId,
        fullName: parsed.fullName,
        email: parsed.email,
        role: parsed.role,
      },
    };
  } catch {
    sessionStorage.removeItem("smartcart_auth");
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(getStoredAuth);

  function saveAuth(data: AuthResponse) {
    const newAuth = {
      token: data.token,
      user: {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      },
    };

    sessionStorage.setItem("smartcart_auth", JSON.stringify(data));
    setAuth(newAuth);
  }

  async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Invalid email or password.");
    }

    const data: AuthResponse = await response.json();
    saveAuth(data);
  }

  async function register(
    fullName: string,
    email: string,
    password: string
  ) {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullName, email, password }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Registration failed.");
    }

    const data: AuthResponse = await response.json();
    saveAuth(data);
  }

  function logout() {
    sessionStorage.removeItem("smartcart_auth");
    setAuth({ user: null, token: null });
  }

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        token: auth.token,
        isAuthenticated: Boolean(auth.token && auth.user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
