import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api.js";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function VerifyEmail(){
    const { token } = useParams();

    const [message, setMessage] = useState("Verifying your email...");

    const [isSuccess, setIsSuccess] = useState(false)

useEffect(() => {

    const verify = async () => {

        try {

            const response =
                await API.get(`/verify-email/${token}`);

            setMessage(response.data.message);
            setIsSuccess(true)
        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Verification failed."
            );
            setIsSuccess(false)
        }

    };

    verify();

}, [token]);
return (
    <>
        { isSuccess ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
        
        {/* Animated Checkmark Icon */}
        <div className="mx-auto w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <FaCheckCircle className="w-10 h-10" />
        </div>

        {/* Text Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h1>
        <p className="text-gray-600 mb-8">
          Your email has been successfully verified. You can now log in to your account.
        </p>

        {/* Call to Action */}
        <button 
          onClick={() => window.location.href = '/login'}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md"
        >
          Continue to Login
        </button>
      </div>
    </div>

    ) : (
        
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
        
        {/* Error Icon */}
        <div className="mx-auto w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <FaExclamationCircle className="w-10 h-10" />
        </div>

        {/* Text Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
        <p className="text-gray-600 mb-8">
          The verification link has expired or is invalid. Please request a new link to proceed.
        </p>

        {/* Action Buttons */}

          <button 
            onClick={() => window.location.href = '/register'}
            className="w-full text-gray-500 hover:text-gray-800 font-medium py-2 transition"
          >
            Back to Sign up
          </button>
      </div>
    </div>
    )
}
</>

        


);
}