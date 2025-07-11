import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthForm from "../../components/auth/AuthForm";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { login, loading } = useAuth();

  const handleLogin = async ({ email, password }) => {
    setError(null);

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <AuthForm
      type="login"
      onSubmit={handleLogin}
      loading={loading}
      error={error}
    />
  );
}
