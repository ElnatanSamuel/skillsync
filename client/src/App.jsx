// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// App pages
import Dashboard from "./pages/main/Dashboard";
import Goals from "./pages/main/Goals";
import Calendar from "./pages/main/Calendar";
import Analytics from "./pages/main/Analytics";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>

            {/* Redirect root to dashboard or login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
