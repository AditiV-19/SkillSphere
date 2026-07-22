import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaSignInAlt, FaTachometerAlt } from "react-icons/fa";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = user !== null;

  return (
    <section className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      
      {/* Hero Content */}
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl">
          Welcome to <span className="text-blue-600">SkillSphere</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect, collaborate, and elevate your freelance career. Join our community of professionals today.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {isLoggedIn ? (
            <button 
              // 3. Add optional chaining (?) to prevent crashes if user.role is missing
              onClick={() => navigate(`/${user?.role || 'freelancer'}/dashboard`)}
              className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              <FaTachometerAlt />
              Go to Dashboard
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate("/register")}
                className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                <FaUserPlus />
                Create Account
              </button>
              
              <button 
                onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-blue-600 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition"
              >
                <FaSignInAlt />
                Log In
              </button>
            </>
          )}
        </div>
      </div>
      
    </section>
  );
}