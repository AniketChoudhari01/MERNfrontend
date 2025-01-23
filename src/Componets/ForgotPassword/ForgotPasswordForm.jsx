import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const isForgotPasswordRoute = location.pathname === "/forgot-password";

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:3001/api/forgot-password", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      //logic for rate limiting 1 per day
  
      if (response.ok) {
        // Success toast
        toast.success(data.status || "Password reset email sent!", {
          position: "top-right",
        });
        navigate("/register"); // Navigate back to register after submission
      } else {
        // Error toast
        toast.error(data.message || "User Not Found", {
          position: "top-center",
          duration: 3000,
          progress: undefined, // Ensures no loading indicator
          // hideProgressBar: true, // Disables the progress bar

        });
      }
    } catch (error) {
      // Network or unexpected error
      console.error("Error during forgot password:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  return (
    <>
      {isForgotPasswordRoute && (
        <>
          {/* Background Blur */}
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" />

          {/* Popup Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="max-w-lg w-1/3 p-8 bg-blue-300 border-black rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">Forgot Password</h2>
                <button
                  className="mr-3 text-white bg-gray-400 hover:bg-gray-500 rounded-full p-2"
                  onClick={() => navigate("/")} // Navigate back on close
                >
                  <i className="bi bi-x text-3xl px-1"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow px-4 py-3 text-base"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset Password
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};
