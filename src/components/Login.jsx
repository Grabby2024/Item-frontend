// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Eye, EyeOff } from "lucide-react";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username || !password) {
            setMessage("Please fill in all fields.");
            setMessageType("error");
            return;
        }

        // Simulated login success
        setMessage("Login successful!");
        setMessageType("success");

        setTimeout(() => {
            navigate("/dashboard", {
                replace: true,
                state: { user: { username: username } }  // 👈 Pass user object
            });
        }, 600);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            {/* Login Card */}
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Logo */}
                <div className="flex justify-center py-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Title */}
                <div className="px-8 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900 text-center">
                        Inventory Manager
                    </h2>
                    <p className="text-sm text-gray-500 text-center mt-1">
                        Sign in to your account
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`px-4 py-3 mx-8 mb-4 text-sm rounded-lg text-center transition-all duration-300 ${messageType === "error"
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : "bg-green-50 text-green-600 border border-green-100"
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
                    <div>
                        <label
                            htmlFor="loginUsername"
                            className="block text-xs font-medium text-gray-500 mb-1"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="loginUsername"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setMessage("");
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="loginPassword"
                            className="block text-xs font-medium text-gray-500 mb-1"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="loginPassword"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setMessage("");
                                }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                            Remember me
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 active:scale-95"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 
                010 1.414l-4 4a1 1 0 
                01-1.414-1.414L12.586 11H5a1 1 
                0 110-2h7.586l-3.293-3.293a1 
                1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Log in
                    </button>
                </form>

                {/* Footer */}
                <div className="px-8 pt-4 pb-6 text-center">
                    <p className="text-sm text-gray-500">
                        Don&apos;t have an account?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="font-medium text-blue-600 hover:underline"
                        >
                            Create account
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
