import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthForm from "../../components/auth/AuthForm";

export default function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { signup, loading } = useAuth();

  const handleSignup = async ({ email, password }) => {
    setError(null);

    const result = await signup(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <AuthForm
      type="signup"
      onSubmit={handleSignup}
      loading={loading}
      error={error}
    />
  );
}
