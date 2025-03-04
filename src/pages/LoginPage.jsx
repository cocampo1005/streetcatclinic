import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/svgs/Logo";
import { useAuth } from "../contexts/AuthContext";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="flex-col flex-1 justify-center items-center h-screen bg-primaryGray">
      <div className="flex p-8 justify-center items-center">
        <Logo />
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />

      {/* Login Block */}
      <div className="m-auto w-full max-w-sm p-8 bg-primaryWhite rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-primaryGreen mb-4">
          Login
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
            required
          />
          <div className="flex justify-between items-end">
            <label>Password</label>
            <a
              onClick={() => setForgotPasswordOpen(true)}
              className="text-xs text-primaryGreen mb-2 cursor-pointer hover:text-cyan-500"
            >
              Forgot Password?
            </a>
          </div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-primaryGreen text-white py-2 rounded-lg hover:bg-secondaryGreen transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
