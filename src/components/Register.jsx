// src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!username || !password || !confirmPassword) {
            setMessage('All fields are required.');
            setMessageType('error');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            setMessageType('error');
            return;
        }

        // Simulate successful registration
        setMessage('Account created successfully!');
        setMessageType('success');

        // Save fake auth token
        localStorage.setItem('authToken', 'fake-jwt-token');

        // Redirect to dashboard after success
        setTimeout(() => {
            navigate('/dashboard', { replace: true });
        }, 600);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            {/* Register Card */}
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Logo */}
                <div className="flex justify-center py-6">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <UserPlus className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Title */}
                <div className="px-8 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900 text-center">Create Account</h2>
                    <p className="text-sm text-gray-500 text-center mt-1">Join our inventory system</p>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`px-4 py-3 mx-8 mb-4 text-sm rounded-lg text-center transition-all duration-300 ${messageType === 'error'
                                ? 'bg-red-50 text-red-600 border border-red-100'
                                : 'bg-green-50 text-green-600 border border-green-100'
                            }`}
                    >
                        {messageType === 'success' && <CheckCircle className="inline w-4 h-4 mr-1" />}
                        {message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
                    <div>
                        <label htmlFor="registerUsername" className="block text-xs font-medium text-gray-500 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="registerUsername"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="registerPassword" className="block text-xs font-medium text-gray-500 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="registerPassword"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="registerConfirmPassword" className="block text-xs font-medium text-gray-500 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="registerConfirmPassword"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-all duration-200 active:scale-95"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Account
                    </button>
                </form>

                {/* Footer */}
                <div className="px-8 pt-4 pb-6 text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="font-medium text-green-600 hover:underline"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;