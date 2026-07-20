import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { googleLogin, registerUser } from "../../services/api";
import { GoogleLogin } from '@react-oauth/google'; // Import Google Login
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // --- Standard Registration ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await registerUser({ username, email, password, role });
      console.log(response.data);
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("");
      alert("Check your mail!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // --- Google Registration / Login ---
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!role) {
       alert("Please select a role (Client or Freelancer) before using Google Sign-In.");
       return;
    }

    try {
      const response = await googleLogin({
        credential: credentialResponse.credential,
        role: role, 
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      const userRole = response.data.user.role;
      navigate(`/${userRole}/dashboard`);

    } catch (error) {
      alert(error.response?.data?.message || 'Google authentication failed.');
    }
  };

  return (
    <section className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg px-8 py-10">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
            <p className="text-sm text-gray-500 mt-1">Join SkillSphere and start collaborating</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Role Selection Moved Up for Google Flow Compatibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                I want to join as a…
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer"
              >
                <option value="">Select your role</option>
                <option value="client">Client — I want to hire talent</option>
                <option value="freelancer">Freelancer — I want to find work</option>
                {/* Admin option completely removed for security */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                placeholder="e.g. john_doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          {/* Google Auth Divider & Button */}
          <div className="mt-6 flex items-center justify-center space-x-2">
            <span className="h-px w-full bg-gray-300"></span>
            <span className="text-sm text-gray-500">OR</span>
            <span className="h-px w-full bg-gray-300"></span>
          </div>
          
          <div className="mt-6 flex justify-center">
             <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert('Google Login Failed')}
                text="signup_with"
             />
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}