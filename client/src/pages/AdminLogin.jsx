import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const login = async () => {
    try {
      const response = await axios.post('${import.meta.env.VITE_API_URL}/api/admin/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Email or password incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-green-400 to-yellow-300 animate-gradient">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md transform transition-all duration-300 hover:shadow-xl border border-purple-200">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-yellow-500">
            One Stop Company
          </h1>
          <p className="text-green-600 font-medium mt-2">Admin Login</p>
        </div>
        {error && (
          <p className="text-red-500 text-center mb-4 bg-red-100 p-2 rounded-lg animate-pulse">
            {error}
          </p>
        )}
        <div className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-5 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 bg-gray-50 placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-5 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 bg-gray-50 placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={login}
            className="w-full bg-gradient-to-r from-purple-600 to-green-500 text-white py-3 rounded-xl hover:from-purple-700 hover:to-green-600 focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-bold shadow-md"
          >
            Login
          </button>
        </div>
        <p className="text-center text-gray-600 mt-6 text-sm">
          © {new Date().getFullYear()} One Stop Company. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;