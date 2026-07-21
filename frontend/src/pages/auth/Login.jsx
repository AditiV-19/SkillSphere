import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser, googleLogin, verify2FALogin } from "../../services/api"; 
import { GoogleLogin } from '@react-oauth/google';
import socket from "../../services/socket";

export default function Login() {
  const navigate = useNavigate();

  // Standard Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2FA State
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  // Helper function to finalize login (used by both normal and 2FA login)
  const finalizeLogin = (user, token, message) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("registerUser", user._id);

    alert(message || "Login successful!");

    switch (user.role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "client":
        navigate("/client/dashboard");
        break;
      default:
        navigate("/freelancer/dashboard");
    }
  };

  // --- Step 1: Standard Email Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser({ email, password });

      // Check if the backend paused the login for 2FA
      if (response.data.requires2FA) {
        setUserId(response.data.userId);
        setRequires2FA(true); // This swaps the UI to the 2FA form
        setLoading(false);
        return;
      }

      // If no 2FA is required, finish login normally
      finalizeLogin(response.data.user, response.data.token, response.data.message);

    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      if (!requires2FA) setLoading(false);
    }
  };

  // --- Step 2: Submit 2FA Code ---
  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await verify2FALogin({ 
        userId: userId, 
        token: twoFactorCode 
      });

      // Code is correct, finalize the login!
      finalizeLogin(response.data.user, response.data.token, response.data.message);

    } catch (error) {
      alert(error.response?.data?.message || "Invalid 2FA code");
    } finally {
      setLoading(false);
    }
  };

  // --- Google OAuth Login ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await googleLogin({
        credential: credentialResponse.credential,
      });
      finalizeLogin(response.data.user, response.data.token, response.data.message);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message.includes("role")) {
         alert("Account not found. Please go to the Registration page to create an account and select your role.");
      } else {
         alert(error.response?.data?.message || "Google Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg px-8 py-10">
          
          {/* Conditional Rendering: If 2FA is required, show the 2FA Form, otherwise show standard Login */}
          {requires2FA ? (
            
            /* --- 2FA INPUT FORM --- */
            <div>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
                  {/* Shield Icon */}
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Two-Factor Authentication</h1>
                <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code from your authenticator app.</p>
              </div>

              <form onSubmit={handle2FASubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">Authentication Code</label>
                  <input
                    type="text"
                    maxLength="6"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    disabled={loading}
                    required
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-center text-2xl tracking-[0.5em] font-mono text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || twoFactorCode.length !== 6}
                  className="w-full mt-4 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {loading ? "Verifying…" : "Verify & Login"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setRequires2FA(false)}
                  className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Back to login
                </button>
              </form>
            </div>

          ) : (

            /* --- STANDARD LOGIN FORM --- */
            <div>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sign in with email</h1>
                <p className="text-sm text-gray-500 mt-1">Join SkillSphere and start collaborating</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Link to="/forgot-password" className="text-sm text-blue-600 font-medium hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center space-x-2">
                <span className="h-px w-full bg-gray-300"></span>
                <span className="text-sm text-gray-500">OR</span>
                <span className="h-px w-full bg-gray-300"></span>
              </div>
              
              <div className="mt-6 flex justify-center">
                 <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => alert('Google Login Failed')}
                    text="signin_with"
                 />
              </div>

              <p className="mt-6 text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 font-medium hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}