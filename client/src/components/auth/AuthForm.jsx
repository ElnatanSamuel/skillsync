import { useState } from "react";
import { Link } from "react-router-dom";

export default function AuthForm({ type = "login", onSubmit }) {
  const isLogin = type === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Animated dots background */}
      <div className="absolute inset-0 z-0">
        <div className="dots-bg w-full h-full" />
      </div>

      {/* Glassy form card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-white block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-white block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link
            to={isLogin ? "/signup" : "/login"}
            className="underline text-white hover:text-gray-200"
          >
            {isLogin ? "Sign up" : "Login"}
          </Link>
        </p>
      </div>
    </div>
  );
}
