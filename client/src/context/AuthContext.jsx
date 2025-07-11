import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

// Create context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        setCurrentUser(null);
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      try {
        // Verify token with server
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        } else {
          // If token is invalid, clear localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", JSON.stringify(data.user.id));
      setCurrentUser(data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", JSON.stringify(data.user.id));
      setCurrentUser(data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/login");
  };

  const value = {
    currentUser,
    loading,
    authChecked,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
